
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslations } from "@/hooks/useTranslations";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";

export const useInstantMessageSender = (
  addOptimisticMessage: (content: string, role: 'user' | 'assistant') => string,
  updateMessage: (tempId: string, update: any) => void,
  removeMessage: (messageId: string) => void
) => {
  const { user } = useAuth();
  const { currentLanguage } = useTranslations();
  const [isSending, setIsSending] = useState(false);
  const { t } = useTranslation();
  const { startMetric, endMetric } = usePerformanceMonitor('InstantMessageSender');
  
  const sendMessageInstantly = useCallback(async (
    userMessage: string,
    sessionId: string,
    sessionTrainerName: string,
    selectedPetData: any,
    selectedPet: string,
    onSuccess: () => void
  ) => {
    if (isSending) return;

    const metricKey = startMetric('send-instant-message', 'query');
    setIsSending(true);

    // Instant optimistic messages - no delay
    const userMessageId = addOptimisticMessage(userMessage, 'user');
    const aiMessageId = addOptimisticMessage(`💭 ${t('support.chat.thinking')}`, 'assistant');

    try {
      // Direct API call without excessive logging
      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: { 
          message: userMessage,
          sessionId: sessionId,
          petId: selectedPet === "none" ? null : selectedPet,
          petProfile: selectedPetData,
          trainerName: sessionTrainerName,
          language: currentLanguage
        }
      });

      if (error) {
        throw new Error(`Edge Function Fehler: ${error.message || 'Unbekannter Fehler'}`);
      }

      if (!data || !data.response) {
        throw new Error('Keine Antwort vom TierTrainer erhalten - bitte versuche es erneut');
      }

      // Update UI with response
      updateMessage(aiMessageId, {
        id: `ai-${Date.now()}`,
        content: data.response,
        created_at: new Date().toISOString()
      });

      endMetric(metricKey, 'send-instant-message');
      onSuccess();

    } catch (error: any) {
      endMetric(metricKey, 'send-instant-message');
      console.error('Chat error:', error.message);
      
      // Update messages with error state
      updateMessage(userMessageId, {
        id: `user-${Date.now()}`,
        created_at: new Date().toISOString()
      });

      updateMessage(aiMessageId, {
        id: `error-${Date.now()}`,
        content: `Entschuldigung, es gab ein Problem: ${error.message}\n\nBitte versuchen Sie es erneut.`,
        created_at: new Date().toISOString()
      });
    } finally {
      setIsSending(false);
    }
  }, [user, isSending, addOptimisticMessage, updateMessage, startMetric, endMetric]);

  return {
    sendMessageInstantly,
    isSending
  };
};
