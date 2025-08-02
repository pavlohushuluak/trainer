
import { useState, useCallback } from "react";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  pending?: boolean;
  error?: boolean;
}

export const useOptimisticMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [optimisticCount, setOptimisticCount] = useState(0);

  const addOptimisticMessage = useCallback((content: string, role: 'user' | 'assistant') => {
    const tempId = `optimistic-${Date.now()}-${optimisticCount}`;
    setOptimisticCount(prev => prev + 1);
    
    const optimisticMessage: Message = {
      id: tempId,
      role,
      content,
      created_at: new Date().toISOString(),
      pending: role === 'assistant'
    };

    setMessages(prev => [...prev, optimisticMessage]);
    return tempId;
  }, [optimisticCount]);

  const confirmMessage = useCallback((tempId: string, finalMessage: Message) => {
    setMessages(prev => prev.map(msg => 
      msg.id === tempId ? { ...finalMessage, pending: false } : msg
    ));
  }, []);

  const markMessageError = useCallback((tempId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === tempId ? { ...msg, pending: false, error: true } : msg
    ));
  }, []);

  const removeOptimisticMessage = useCallback((tempId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== tempId));
  }, []);

  const setMessagesFromHistory = useCallback((historyMessages: Message[]) => {
    setMessages(historyMessages);
  }, []);

  return {
    messages,
    addOptimisticMessage,
    confirmMessage,
    markMessageError,
    removeOptimisticMessage,
    setMessagesFromHistory
  };
};
