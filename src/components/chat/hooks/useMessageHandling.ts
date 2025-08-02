
import { useState } from "react";
import { useChatValidation } from "./useChatValidation";
import { useChatTracking } from "./useChatTracking";
import { useMessageSender } from "./useMessageSender";

export const useMessageHandling = () => {
  const [message, setMessage] = useState("");
  
  const {
    canSendMessage,
    usage,
    usageLoading,
    incrementUsage,
    hasActiveSubscription,
    validateChatRequirements
  } = useChatValidation();

  const {
    chatStarted,
    setChatStarted,
    trackChatStart
  } = useChatTracking();

  const {
    messages,
    setMessages,
    loading: sendingLoading,
    sendMessageToAI,
    loadChatHistory,
    resetHistory,
    historyLoaded,
    isLoadingHistory
  } = useMessageSender();

  const sendMessage = async (
    sessionId: string | null,
    sessionTrainerName: string,
    selectedPetData: any,
    selectedPet: string,
    hasPets: boolean
  ) => {

    if (usage.hasReachedLimit && !hasActiveSubscription) {
      return;
    }

    const validation = validateChatRequirements(sessionId, hasPets, message);
    if (!validation.isValid) {
      return;
    }

    if (sendingLoading) {
      return;
    }

    if (!chatStarted) {
      trackChatStart();
      setChatStarted(true);
    }

    const userMessage = message.trim();
    setMessage("");

    await sendMessageToAI(
      userMessage,
      sessionId!,
      sessionTrainerName,
      selectedPetData,
      selectedPet,
      () => {
        if (!hasActiveSubscription) {
          incrementUsage();
        }
      }
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !sendingLoading && !e.shiftKey) {
      e.preventDefault();
    }
  };

  return {
    message,
    setMessage,
    messages,
    setMessages,
    loading: sendingLoading || usageLoading,
    sendMessage,
    handleKeyPress,
    canSendMessage,
    usage,
    loadChatHistory,
    resetHistory,
    historyLoaded,
    isLoadingHistory,
    validateChatRequirements,
    hasActiveSubscription
  };
};
