
import { useEffect } from "react";
import { usePetManagement } from "./hooks/usePetManagement";
import { useChatSession } from "./hooks/useChatSession";
import { useMessageHandling } from "./hooks/useMessageHandling";
import { useOptimizedMessageSender } from "./hooks/useOptimizedMessageSender";

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

export const useChatLogic = (isOpen: boolean, preloadedPets: PetProfile[] = []) => {
  const {
    selectedPet,
    setSelectedPet,
    pets,
    getSelectedPetName,
    getSelectedPetSpecies,
    getSelectedPetData,
    hasPets
  } = usePetManagement(preloadedPets);

  const {
    sessionId,
    sessionTrainerName,
    getTrainerName,
    isCreating
  } = useChatSession(isOpen);

  // Optimized message sender mit sofortiger Verfügbarkeit
  const {
    messages,
    loading: sendingLoading,
    sendMessageToAI,
    loadChatHistory,
    resetHistory,
    historyLoaded,
    isLoadingHistory
  } = useOptimizedMessageSender();

  const {
    message,
    setMessage,
    canSendMessage,
    usage,
    handleKeyPress,
    validateChatRequirements,
    hasActiveSubscription
  } = useMessageHandling();

  // Sofortiges History-Loading ohne Verzögerung
  useEffect(() => {
    if (sessionId && isOpen && !historyLoaded && !isLoadingHistory) {
      // Nur bei echten Sessions History laden, nicht bei temp-Sessions
      if (!sessionId.startsWith('temp-')) {
        loadChatHistory(sessionId);
      } else {
      }
    }
  }, [sessionId, isOpen, loadChatHistory, historyLoaded, isLoadingHistory]);

  // Auto-select pet logic
  const effectiveSelectedPet = () => {
    if (selectedPet !== "none") return selectedPet;
    if (pets.length === 1) return pets[0].id;
    return selectedPet;
  };

  const sendMessage = async () => {
    const currentSelectedPet = effectiveSelectedPet();
    const selectedPetData = currentSelectedPet !== "none" 
      ? pets.find(p => p.id === currentSelectedPet) 
      : null;
    
    const validation = validateChatRequirements(sessionId, hasPets, message);
    if (!validation.isValid) return;

    if (sendingLoading) return;

    const userMessage = message.trim();
    setMessage("");

    await sendMessageToAI(
      userMessage,
      sessionId!,
      sessionTrainerName,
      selectedPetData,
      currentSelectedPet,
      () => {
        if (!hasActiveSubscription) {
          // Usage increment logic
        }
      }
    );
  };

  const getEffectiveSelectedPetName = () => {
    const currentPet = effectiveSelectedPet();
    if (currentPet === "none") return null;
    const pet = pets.find(p => p.id === currentPet);
    return pet ? pet.name : null;
  };

  const getEffectiveSelectedPetSpecies = () => {
    const currentPet = effectiveSelectedPet();
    if (currentPet === "none") return null;
    const pet = pets.find(p => p.id === currentPet);
    return pet ? pet.species : null;
  };

  // Optimistic: Immer bereit, es sei denn, es wird explizit gesendet
  const isReady = !!sessionId && hasPets;

  return {
    message,
    setMessage,
    messages,
    selectedPet,
    setSelectedPet,
    pets,
    loading: sendingLoading, // Nur echtes Senden blockiert
    sendMessage,
    handleKeyPress,
    getSelectedPetName: getEffectiveSelectedPetName,
    getSelectedPetSpecies: getEffectiveSelectedPetSpecies,
    getTrainerName,
    canSendMessage: isReady, // Sofort verfügbar wenn Session und Pets da sind
    hasPets,
    usage
  };
};
