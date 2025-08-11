
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslations } from "@/hooks/useTranslations";
import { useChatErrorHandler } from "../utils/chatErrorHandler";
import { useChatErrorRecovery } from "./useChatErrorRecovery";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export const useMessageSender = () => {
  const { user } = useAuth();
  const { currentLanguage } = useTranslations();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const { handleChatError } = useChatErrorHandler();
  const { recoverFromError } = useChatErrorRecovery();

  const loadChatHistory = useCallback(async (sessionId: string) => {
    if (!sessionId || !user || sessionId.startsWith('temp-')) {
      setHistoryLoaded(true);
      return;
    }

    if (isLoadingHistory) {
      return;
    }

    setIsLoadingHistory(true);

    try {
      const { data: chatHistory, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
        .limit(20);

      if (error) {
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
        
        setMessages(formattedMessages);
      }
      
      setHistoryLoaded(true);
    } catch (error) {
      setHistoryLoaded(true);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [user, isLoadingHistory]);

  const sendMessageToAI = async (
    userMessage: string,
    sessionId: string,
    sessionTrainerName: string,
    selectedPetData: any,
    selectedPet: string,
    onSuccess: () => void
  ) => {


    setLoading(true);

    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => {
      return [...prev, tempUserMessage];
    });

    let retryCount = 0;
    const maxRetries = 2;

    const attemptSend = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('Session expired - please log in again');
        }


        // Create timeout promise
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Chat request timeout - please try again')), 25000);
        });

        
        // Race between the API call and timeout
        const apiCall = supabase.functions.invoke('chat-with-ai', {
          body: {
            message: userMessage,
            sessionId: sessionId,
            petId: selectedPet === "none" ? null : selectedPet,
            petProfile: selectedPetData,
            trainerName: sessionTrainerName,
            language: currentLanguage
          }
        });


        const { data, error } = await Promise.race([apiCall, timeoutPromise]) as any;



        if (error) {
          throw new Error(`Chat-Service Fehler: ${error.message || 'Unbekannter Fehler'}`);
        }

        if (!data || !data.response) {
          throw new Error('Keine Antwort vom TierTrainer erhalten - bitte versuche es erneut');
        }

        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.response,
          created_at: new Date().toISOString()
        };
        
        setMessages(prev => {
          const newMessages = [...prev, aiMessage];
          return newMessages;
        });
        
        onSuccess();

      } catch (error: any) {
        
        const { canRetry } = await recoverFromError(error, 'Message Send');
        
        if (canRetry && retryCount < maxRetries) {
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          return attemptSend();
        } else {
          setMessages(prev => prev.filter(msg => msg.id !== tempUserMessage.id));
          handleChatError(error);
        }
      }
    };

    await attemptSend();
    setLoading(false);
  };

  const resetHistory = useCallback(() => {
    setMessages([]);
    setHistoryLoaded(false);
    setIsLoadingHistory(false);
  }, []);

  return {
    messages,
    setMessages,
    loading,
    sendMessageToAI,
    loadChatHistory,
    resetHistory,
    historyLoaded,
    isLoadingHistory
  };
};
