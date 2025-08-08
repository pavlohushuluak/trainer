import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { assignTrainerForSession } from "../utils/trainerTeam";

const FREE_CHAT_LIMIT = 10; // Gratis-Chat Limit für kostenlose Nutzer

interface Message {
  id: string;
  role: 'user' | 'assistant';
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

export const useInstantChat = (isOpen: boolean, preloadedPets: PetProfile[] = []) => {
  const { user } = useAuth();
  const { hasActiveSubscription, subscriptionMode } = useSubscriptionStatus();
  
  // INSTANT STATE - Available immediately
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [trainerName, setTrainerName] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [selectedPet, setSelectedPet] = useState<string>("none");
  const [isSending, setIsSending] = useState(false);
  const [isReady, setIsReady] = useState(false);
  
  // Usage tracking state
  const [usage, setUsage] = useState({
    questionsUsed: 0,
    maxQuestions: FREE_CHAT_LIMIT,
    hasReachedLimit: false
  });

  const backgroundTasksRef = useRef<Set<Promise<any>>>(new Set());
  
  // Enhanced pet validation with detailed logging
  const pets = useMemo(() => {
    const validPets = preloadedPets.filter(pet => {
      const isValid = pet && pet.id && pet.name && pet.species;
        
      return isValid;
    });
    
    return validPets;
  }, [preloadedPets]);
  
  const hasPets = pets.length > 0;

  // INSTANT SESSION CREATION - 0ms delay
  const createInstantSession = useCallback(() => {
    if (!user || !isOpen) return;

    
    // Instant temporary session - ZERO blocking
    const tempSessionId = `instant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const tempTrainer = assignTrainerForSession();
    
    setSessionId(tempSessionId);
    setTrainerName(tempTrainer);
    setIsReady(true);
    
  }, [user, isOpen]);

  // ULTRA-STRICT TIMEOUT WRAPPER
  const withUltraTimeout = useCallback(async <T>(
    name: string,
    promise: Promise<T>,
    timeoutMs: number,
    fallback: T
  ): Promise<T> => {
    const timeoutPromise = new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${name} timeout after ${timeoutMs}ms`)), timeoutMs)
    );

    try {
      return await Promise.race([promise, timeoutPromise]);
    } catch (error) {
      console.warn(`⏰ TIMEOUT: ${name} (${timeoutMs}ms) - using fallback`);
      return fallback;
    }
  }, []);

  // BACKGROUND USAGE CHECK - 500ms timeout
  const checkUsageBackground = useCallback(async () => {
    if (!user || hasActiveSubscription) return;

    
    try {
      const result = await withUltraTimeout(
        'usage-check',
        (async () => {
          const { data, error } = await supabase
            .from('subscribers')
            .select('questions_num')
            .eq('user_id', user.id)
            .maybeSingle();
          return { data, error };
        })(),
        500,
        { data: null, error: null }
      );

      const questionsUsed = result.data?.questions_num || 0;
      setUsage({
        questionsUsed,
        maxQuestions: FREE_CHAT_LIMIT,
        hasReachedLimit: questionsUsed >= FREE_CHAT_LIMIT
      });
      
    } catch (error) {
      console.warn('⚠️ Background: Usage check failed, using defaults');
      setUsage({
        questionsUsed: 0,
        maxQuestions: FREE_CHAT_LIMIT,
        hasReachedLimit: false
      });
    }
  }, [user, hasActiveSubscription, withUltraTimeout]);

  // BACKGROUND SESSION UPGRADE - 1s timeout
  const upgradeSessionBackground = useCallback(async (tempSessionId: string): Promise<string> => {
    if (!user || !tempSessionId.startsWith('instant-')) return tempSessionId;

    
    try {
      const result = await withUltraTimeout(
        'session-upgrade',
        (async () => {
          const { data, error } = await supabase
            .from('chat_sessions')
            .insert({
              user_id: user.id,
              title: `Chat mit ${trainerName}`,
            })
            .select()
            .single();
          return { data, error };
        })(),
        1000,
        { data: null, error: null }
      );

      if (result.data) {
        setSessionId(result.data.id);
        return result.data.id;
      } else {
        return tempSessionId;
      }
    } catch (error) {
      
      return tempSessionId;
    }
  }, [user, trainerName, withUltraTimeout]);

  // BACKGROUND HISTORY LOADING - 500ms timeout
  const loadHistoryBackground = useCallback(async (sessionId: string) => {
    if (!sessionId || sessionId.startsWith('instant-')) return;

    
    try {
      const result = await withUltraTimeout(
        'history-loading',
        (async () => {
          const { data, error } = await supabase
            .from('chat_messages')
            .select('id, role, content, created_at')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: true })
            .limit(5);
          return { data, error };
        })(),
        500,
        { data: [], error: null }
      );

      if (result.data?.length > 0) {
        const formattedMessages = result.data.map(msg => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          created_at: msg.created_at
        }));
        
        setMessages(formattedMessages);
      }
    } catch (error) {
      
    }
  }, [withUltraTimeout]);

  // OPTIMISTIC MESSAGE HANDLING
  const addOptimisticMessage = useCallback((content: string, role: 'user' | 'assistant') => {
    const optimisticMessage: Message = {
      id: `optimistic-${Date.now()}-${Math.random()}`,
      role,
      content,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, optimisticMessage]);
    return optimisticMessage.id;
  }, []);

  const updateMessage = useCallback((tempId: string, update: Partial<Message>) => {
    setMessages(prev => prev.map(msg => 
      msg.id === tempId ? { ...msg, ...update } : msg
    ));
  }, []);

  // CRITICAL DIAGNOSIS & ENHANCED ERROR HANDLING
  const sendMessage = useCallback(async () => {
    if (!message.trim() || !sessionId || isSending) return;

    setIsSending(true);

    const currentSelectedPet = selectedPet !== "none" ? selectedPet : 
      (pets.length === 1 ? pets[0].id : selectedPet);
    
    const selectedPetData = currentSelectedPet !== "none" 
      ? pets.find(p => p.id === currentSelectedPet) 
      : null;

    const userMessage = message.trim();
    setMessage("");

    // Instant optimistic updates
    const userMessageId = addOptimisticMessage(userMessage, 'user');
    const aiMessageId = addOptimisticMessage('💭 Denke nach...', 'assistant');

    try {
      
      // STAGE 1: Auth Token Diagnosis
      const session = await supabase.auth.getSession();
      const authUser = await supabase.auth.getUser();
      


      if (!session.data.session?.access_token) {
        throw new Error('🔐 Authentication fehlt - bitte neu anmelden');
      }

      // STAGE 2: Function Call Diagnosis


      // STAGE 3: Enhanced Function Invocation with Timeout
      const invokePromise = supabase.functions.invoke('chat-with-ai', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.access_token}`
        },
        body: {
          message: userMessage,
          sessionId: sessionId,
          petId: currentSelectedPet === "none" ? null : currentSelectedPet,
          trainerName: trainerName
        }
      });

      // Add timeout protection (30 seconds)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Function timeout after 30s')), 30000)
      );

      const { data, error } = await Promise.race([invokePromise, timeoutPromise]) as any;


      // STAGE 4: Response Analysis & Error Handling
      if (error) {
        console.error('❌ FUNCTION INVOCATION ERROR:', error);
        
        // Specific error analysis
        if (error.message?.includes('404')) {
          throw new Error('🚫 Chat-Function nicht gefunden - bitte Support kontaktieren');
        } else if (error.message?.includes('401') || error.message?.includes('403')) {
          throw new Error('🔐 Authentifizierung fehlgeschlagen - bitte neu anmelden');
        } else if (error.message?.includes('timeout')) {
          throw new Error('⏰ Chat-Service überlastet - bitte in 30 Sekunden erneut versuchen');
        } else {
          throw new Error(`🔌 Chat-Service Fehler: ${error.message}`);
        }
      }

      if (data?.response) {
        
        updateMessage(userMessageId, {
          id: `user-${Date.now()}`,
          created_at: new Date().toISOString()
        });

        updateMessage(aiMessageId, {
          id: `ai-${Date.now()}`,
          content: data.response,
          created_at: new Date().toISOString()
        });

        // Update usage for free users
        if (!hasActiveSubscription && user?.id) {
          try {
            await supabase
              .from('subscribers')
              .update({ 
                questions_num: (usage.questionsUsed || 0) + 1,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', user.id);
            
            setUsage(prev => ({
              ...prev,
              questionsUsed: prev.questionsUsed + 1,
              hasReachedLimit: prev.questionsUsed + 1 >= FREE_CHAT_LIMIT
            }));
          } catch (error) {
            console.error('❌ Error updating usage:', error);
          }
        }
      } else if (data?.error) {
        console.error('❌ FUNCTION RETURNED ERROR:', data.error);
        throw new Error(`🤖 TierTrainer Fehler: ${data.error}`);
      } else {
        console.error('❌ NO RESPONSE DATA:', data);
        throw new Error('📭 Keine Antwort vom TierTrainer - bitte erneut versuchen');
      }

    } catch (error: any) {
      console.error('❌ COMPLETE ERROR DIAGNOSIS:', {
        errorMessage: error.message,
        errorType: error.constructor.name,
        errorStack: error.stack,
        timestamp: new Date().toISOString()
      });
      
      // Enhanced user-friendly error messages
      let userErrorMessage = '❌ Chat temporär nicht verfügbar';
      
      if (error.message?.includes('Authentication') || error.message?.includes('🔐')) {
        userErrorMessage = '🔐 Bitte melden Sie sich erneut an\n\nIhre Sitzung ist abgelaufen.';
      } else if (error.message?.includes('Function timeout') || error.message?.includes('⏰')) {
        userErrorMessage = '⏰ Chat-Service überlastet\n\nBitte versuchen Sie es in 30 Sekunden erneut.';
      } else if (error.message?.includes('nicht gefunden') || error.message?.includes('🚫')) {
        userErrorMessage = '🚫 Chat-Service nicht verfügbar\n\nBitte kontaktieren Sie den Support.';
      } else if (error.message?.includes('TierTrainer Fehler') || error.message?.includes('🤖')) {
        userErrorMessage = error.message;
      } else {
        userErrorMessage = `📱 Verbindungsfehler\n\n${error.message}\n\nBitte prüfen Sie Ihre Internetverbindung.`;
      }
      
      updateMessage(aiMessageId, {
        id: `error-${Date.now()}`,
        content: userErrorMessage,
        created_at: new Date().toISOString()
      });
    } finally {
      setIsSending(false);
    }
  }, [message, sessionId, isSending, selectedPet, pets, trainerName, addOptimisticMessage, updateMessage, hasActiveSubscription]);

  // Handle key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  // INSTANT INITIALIZATION WITH PROPER SESSION MANAGEMENT
  useEffect(() => {
    if (isOpen && user && !sessionId) {
      
      // STEP 1: Instant session creation (0ms)
      createInstantSession();
    }
  }, [isOpen, user, sessionId, createInstantSession]);

  // SEPARATE EFFECT: Background tasks after session is created
  useEffect(() => {
    if (!sessionId || !sessionId.startsWith('instant-') || !user) return;

    
    // Background tasks with proper error handling
    const backgroundTasks = [
      checkUsageBackground().catch(err => {
        
      }),
      upgradeSessionBackground(sessionId).then(() => {
        // Load history after session upgrade attempt (session state updated internally)
        if (sessionId && !sessionId.startsWith('instant-')) {
          return loadHistoryBackground(sessionId).catch(err => {
            
          });
        }
      }).catch(err => {
        
      })
    ];

    // Store background tasks for cleanup
    backgroundTasks.forEach(task => backgroundTasksRef.current.add(task));
    
    // Clean up completed tasks
    Promise.allSettled(backgroundTasks).then(() => {
      backgroundTasksRef.current.clear();
    });
  }, [sessionId, user, checkUsageBackground, upgradeSessionBackground, loadHistoryBackground]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      backgroundTasksRef.current.clear();
    };
  }, []);

  // Computed values
  const getSelectedPetName = useCallback(() => {
    const currentPet = selectedPet !== "none" ? selectedPet : 
      (pets.length === 1 ? pets[0].id : selectedPet);
    if (currentPet === "none") return null;
    const pet = pets.find(p => p.id === currentPet);
    return pet ? pet.name : null;
  }, [selectedPet, pets]);

  const getSelectedPetSpecies = useCallback(() => {
    const currentPet = selectedPet !== "none" ? selectedPet : 
      (pets.length === 1 ? pets[0].id : selectedPet);
    if (currentPet === "none") return null;
    const pet = pets.find(p => p.id === currentPet);
    return pet ? pet.species : null;
  }, [selectedPet, pets]);

  const canSendMessage = hasPets && !!sessionId && !isSending;

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
    
    // Computed values
    getSelectedPetName,
    getSelectedPetSpecies,
    getTrainerName: () => trainerName || "TierTrainer",
    canSendMessage,
    hasPets,
    
    // Consolidated subscription & usage
    hasActiveSubscription,
    subscriptionMode,
    subscriptionLoading: false, // Always false for instant availability
    usage,
    usageLoading: false // Always false for instant availability
  };
};