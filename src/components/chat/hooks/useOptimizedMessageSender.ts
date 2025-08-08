
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useOptimisticMessages } from "./useOptimisticMessages";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  pending?: boolean;
  error?: boolean;
}

export const useOptimizedMessageSender = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const { startMetric, endMetric } = usePerformanceMonitor('ChatMessageSender');
  
  const {
    messages,
    addOptimisticMessage,
    confirmMessage,
    markMessageError,
    removeOptimisticMessage,
    setMessagesFromHistory
  } = useOptimisticMessages();

  const loadChatHistory = useCallback(async (sessionId: string) => {
    if (!sessionId || !user || sessionId.startsWith('temp-') || historyLoaded || isLoadingHistory) {
      setHistoryLoaded(true);
      return;
    }

    const metricKey = startMetric('load-chat-history', 'query');
    setIsLoadingHistory(true);

    try {
      const { data: chatHistory, error } = await supabase
        .from('chat_messages')
        .select('id, role, content, created_at')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
        .limit(5); // Reduced to 5 for optimal performance

      endMetric(metricKey, 'load-chat-history');

      if (error) {
        console.error('❌ Error loading chat history:', error);
        setHistoryLoaded(true);
        return;
      }

      if (chatHistory && chatHistory.length > 0) {
        const formattedMessages = chatHistory.map(msg => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          created_at: msg.created_at
        }));
        
        setMessagesFromHistory(formattedMessages);
      }
      
      setHistoryLoaded(true);
    } catch (error) {
      endMetric(metricKey, 'load-chat-history');
      console.error('💥 Failed to load chat history:', error);
      setHistoryLoaded(true);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [user, historyLoaded, isLoadingHistory, startMetric, endMetric, setMessagesFromHistory]);

  const sendMessageToAI = useCallback(async (
    userMessage: string,
    sessionId: string,
    sessionTrainerName: string,
    selectedPetData: any,
    selectedPet: string,
    onSuccess: () => void
  ) => {
    const metricKey = startMetric('send-message-to-ai', 'query');
    setLoading(true);

    // Add optimistic user message
    const tempUserMessageId = addOptimisticMessage(userMessage, 'user');
    
    // Add optimistic AI message placeholder
    const tempAiMessageId = addOptimisticMessage('', 'assistant');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Session expired - please log in again');
      }

      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: {
          message: userMessage,
          sessionId: sessionId,
          petId: selectedPet === "none" ? null : selectedPet,
          petProfile: selectedPetData,
          trainerName: sessionTrainerName
        }
      });

      if (error) {
        throw new Error(`Edge Function Fehler: ${error.message || 'Unbekannter Fehler'}`);
      }

      if (!data || !data.response) {
        throw new Error('Keine Antwort vom TierTrainer erhalten');
      }

      // Confirm both messages with real data
      confirmMessage(tempUserMessageId, {
        id: `user-${Date.now()}`,
        role: 'user',
        content: userMessage,
        created_at: new Date().toISOString()
      });

      confirmMessage(tempAiMessageId, {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.response,
        created_at: new Date().toISOString()
      });
      
      endMetric(metricKey, 'send-message-to-ai');
      onSuccess();

    } catch (error: any) {
      endMetric(metricKey, 'send-message-to-ai');
      console.error('❌ Failed to send message:', error);
      
      // Remove optimistic messages on error
      removeOptimisticMessage(tempUserMessageId);
      removeOptimisticMessage(tempAiMessageId);
      
      // Show error message
      addOptimisticMessage(
        `Entschuldigung, es gab ein Problem beim Senden der Nachricht: ${error.message}`, 
        'assistant'
      );
    } finally {
      setLoading(false);
    }
  }, [startMetric, endMetric, addOptimisticMessage, confirmMessage, removeOptimisticMessage]);

  const resetHistory = useCallback(() => {
    setMessagesFromHistory([]);
    setHistoryLoaded(false);
    setIsLoadingHistory(false);
  }, [setMessagesFromHistory]);

  return {
    messages,
    loading,
    sendMessageToAI,
    loadChatHistory,
    resetHistory,
    historyLoaded,
    isLoadingHistory
  };
};
