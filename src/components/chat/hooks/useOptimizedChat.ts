import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useFreeChatLimit } from "@/hooks/useFreeChatLimit";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { useTranslations } from "@/hooks/useTranslations";
import { assignTrainerForSession } from "../utils/trainerTeam";
import { useTranslation } from "react-i18next";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface PetProfile {
  id: string;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  birth_date?: string;
  behavior_focus?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export const useOptimizedChat = (
  isOpen: boolean,
  preloadedPets: PetProfile[] = []
) => {
  const { user } = useAuth();
  const { hasActiveSubscription } = useSubscriptionStatus();
  const { currentLanguage } = useTranslations();
  const { t } = useTranslation();
  // Debug: Log the current language whenever it changes
  console.log('🌍 useOptimizedChat - Current language:', currentLanguage);
  
  const {
    usage,
    loading: usageLoading,
    incrementUsage,
  } = useFreeChatLimit();

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [selectedPet, setSelectedPet] = useState<string>("none");
  const [isSending, setIsSending] = useState(false);

  // Session state - NO automatic creation
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [trainerName, setTrainerName] = useState<string>("");
  const sessionCreatedRef = useRef(false);

  // FIXED: Enhanced pet validation with proper name/species checking
  const pets = useMemo(() => {
    const validPets = preloadedPets.filter((pet) => {
      // FIXED: Only require id to be present, accept any name/species (even if they're fallbacks)
      const isValid = pet && pet.id;
      if (!isValid) {
        
      }
      return isValid;
    });

    return validPets;
  }, [preloadedPets]);

  const hasPets = pets.length > 0;

  // FIXED: Auto-select single pet for better UX and ensure pet_id is set
  const autoSelectPet = useCallback(() => {
    if (pets.length === 1 && selectedPet === "none") {
      setSelectedPet(pets[0].id);
    }

    // FIXED: Also auto-select first pet when multiple pets available but none selected
    if (pets.length > 1 && selectedPet === "none") {
      setSelectedPet(pets[0].id);
    }
  }, [pets, selectedPet]);

  // Auto-select pet when pets become available
  useEffect(() => {
    autoSelectPet();
  }, [autoSelectPet]);

  // FIXED: Set trainer name immediately when chat opens for better UX
  useEffect(() => {
    if (isOpen && !trainerName) {
      const trainer = assignTrainerForSession();
      setTrainerName(trainer);
    }
  }, [isOpen, trainerName]);

  // Debug: Log language changes
  useEffect(() => {
    console.log('🌍 Language changed in useOptimizedChat:', currentLanguage);
  }, [currentLanguage]);

  // Create session ONLY when first message is sent
  const createSessionOnDemand = useCallback(async (): Promise<
    string | null
  > => {
    if (!user || sessionCreatedRef.current) return sessionId;

    sessionCreatedRef.current = true;

    try {
      const trainer = assignTrainerForSession();
      setTrainerName(trainer);

      // Get selected pet for session
      const currentSelectedPet =
        selectedPet !== "none"
          ? selectedPet
          : pets.length === 1
          ? pets[0].id
          : null;

      const { data, error } = await supabase
        .from("chat_sessions")
        .insert({
          user_id: user.id,
          pet_id: currentSelectedPet, // Correctly set pet_id from selection
          title: `Chat mit ${trainer}`,
        })
        .select()
        .single();

      if (error) {
        sessionCreatedRef.current = false;
        return null;
      }

      setSessionId(data.id);
      return data.id;
    } catch (error) {
      sessionCreatedRef.current = false;
      return null;
    }
  }, [user, selectedPet, pets, sessionId]);

  // Optimistic message handling
  const addOptimisticMessage = useCallback(
    (content: string, role: "user" | "assistant") => {
      const optimisticMessage: Message = {
        id: `optimistic-${Date.now()}-${Math.random()}`,
        role,
        content,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, optimisticMessage]);
      return optimisticMessage.id;
    },
    []
  );

  const updateMessage = useCallback(
    (tempId: string, update: Partial<Message>) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempId ? { ...msg, ...update } : msg))
      );
    },
    []
  );

  // Send message with on-demand session creation
  const sendMessage = useCallback(async () => {
    if (!message.trim() || isSending || !user) return;

    // Check limits for free users
    if (!hasActiveSubscription && usage.hasReachedLimit) {
      return;
    }

    setIsSending(true);

    // Create session only when first message is sent
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      currentSessionId = await createSessionOnDemand();
      if (!currentSessionId) {
        setIsSending(false);
        return;
      }
    }

    const userMessage = message.trim();
    setMessage("");

    // Get current pet data
    const currentSelectedPet =
      selectedPet !== "none"
        ? selectedPet
        : pets.length === 1
        ? pets[0].id
        : null;

    const selectedPetData = currentSelectedPet
      ? pets.find((p) => p.id === currentSelectedPet)
      : null;

    // Add optimistic messages
    const userMessageId = addOptimisticMessage(userMessage, "user");
    const aiMessageId = addOptimisticMessage(`💭 ${t('support.chat.thinking')}`, 'assistant');

    try {
      // Debug: Log the language being sent
      console.log('🌍 Sending chat message with language:', currentLanguage);
      
      const { data, error } = await supabase.functions.invoke("chat-with-ai", {
        body: {
          message: userMessage,
          sessionId: currentSessionId,
          petId: currentSelectedPet,
          petProfile: selectedPetData,
          trainerName: trainerName,
          language: currentLanguage,
        },
      });

      if (error) {
        throw new Error(
          `Chat-Service Fehler: ${error.message || "Unbekannter Fehler"}`
        );
      }

      if (!data || !data.response) {
        throw new Error(
          "Keine Antwort vom TierTrainer erhalten - bitte versuche es erneut"
        );
      }

      // Update messages with real IDs
      updateMessage(userMessageId, {
        id: `user-${Date.now()}`,
        created_at: new Date().toISOString(),
      });

      updateMessage(aiMessageId, {
        id: `ai-${Date.now()}`,
        content: data.response,
        created_at: new Date().toISOString(),
      });

      // Increment usage for free users only
      if (!hasActiveSubscription) {
        incrementUsage();
      }
    } catch (error: any) {  
      // Update messages with error
      updateMessage(userMessageId, {
        id: `user-${Date.now()}`,
        created_at: new Date().toISOString(),
      });

      updateMessage(aiMessageId, {
        id: `error-${Date.now()}`,
        content: `${t('chat.hooks.errorMessage')} ${error.message}\n\n${t('chat.hooks.pleaseRetry')}`,
        created_at: new Date().toISOString(),
      });
    } finally {
      setIsSending(false);
    }
  }, [
    message,
    isSending,
    user,
    hasActiveSubscription,
    usage.hasReachedLimit,
    sessionId,
    selectedPet,
    pets,
    trainerName,
    currentLanguage,
    addOptimisticMessage,
    updateMessage,
    createSessionOnDemand,
  ]);

  // Handle key press
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  // Helper functions
  const getSelectedPetName = useCallback(() => {
    if (selectedPet === "none") return t('chat.hooks.general');
    const pet = pets.find((p) => p.id === selectedPet);


    return pet?.name || t('chat.hooks.unnamedPet');
  }, [selectedPet, pets, t]);

  const getSelectedPetSpecies = useCallback(() => {
    if (selectedPet === "none") return "";
    const pet = pets.find((p) => p.id === selectedPet);
    return pet?.species || "";
  }, [selectedPet, pets]);

  const getTrainerName = useCallback(() => {
    return trainerName || t('chat.hooks.defaultTrainer');
  }, [trainerName, t]);

  // Check if user can send message
  const canSendMessage = useMemo(() => {
    if (!hasPets) return false;
    if (!hasActiveSubscription && usage.hasReachedLimit) return false;
    return !isSending;
  }, [hasPets, hasActiveSubscription, usage.hasReachedLimit, isSending]);

  // Reset session when chat closes
  const resetChat = useCallback(() => {
    setSessionId(null);
    setMessages([]);
    setMessage("");
    setSelectedPet("none");
    setTrainerName("");
    sessionCreatedRef.current = false;
  }, []);

  // Reset when modal closes
  if (!isOpen && sessionId) {
    resetChat();
  }

  return {
    // State
    message,
    setMessage,
    messages,
    selectedPet,
    setSelectedPet,
    pets,
    loading: isSending,

    // Actions
    sendMessage,
    handleKeyPress,

    // Helpers
    getSelectedPetName,
    getTrainerName,
    getSelectedPetSpecies,
    canSendMessage,
    hasPets,
    hasActiveSubscription,
    usage,
    usageLoading,
  };
};
