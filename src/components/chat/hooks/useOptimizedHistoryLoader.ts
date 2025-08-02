
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export const useOptimizedHistoryLoader = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const { startMetric, endMetric } = usePerformanceMonitor('OptimizedHistoryLoader');

  const loadHistoryWithTimeout = useCallback(async (sessionId: string) => {
    // Skip temp sessions completely - no history to load
    if (!sessionId || !user || sessionId.startsWith('temp-') || historyLoaded) {
      setHistoryLoaded(true);
      return;
    }

    const metricKey = startMetric('load-history-instant', 'query');
    setIsLoadingHistory(true);

    try {
      // Direct history load without timeout - non-blocking
      const { data: chatHistory, error } = await supabase
        .from('chat_messages')
        .select('id, role, content, created_at')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
        .limit(10);

      if (!error && chatHistory && chatHistory.length > 0) {
        const formattedMessages = chatHistory.map(msg => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          created_at: msg.created_at
        }));
        
        setMessages(formattedMessages);
      }
      
      endMetric(metricKey, 'load-history-instant');
    } catch (error: any) {
      endMetric(metricKey, 'load-history-instant');
      // Continue without history - don't block chat
    } finally {
      setIsLoadingHistory(false);
      setHistoryLoaded(true);
    }
  }, [user, historyLoaded, startMetric, endMetric]);

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

  const updateMessage = useCallback((tempId: string, finalMessage: Partial<Message>) => {
    setMessages(prev => prev.map(msg => 
      msg.id === tempId ? { ...msg, ...finalMessage } : msg
    ));
  }, []);

  const removeMessage = useCallback((messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  }, []);

  const resetHistory = useCallback(() => {
    setMessages([]);
    setHistoryLoaded(false);
    setIsLoadingHistory(false);
  }, []);

  return {
    messages,
    isLoadingHistory,
    historyLoaded,
    loadHistoryWithTimeout,
    addOptimisticMessage,
    updateMessage,
    removeMessage,
    resetHistory
  };
};
