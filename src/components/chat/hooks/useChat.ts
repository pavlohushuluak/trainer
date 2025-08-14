import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import { useTranslations } from "@/hooks/useTranslations";
import { useTranslation } from "react-i18next";
import { assignTrainerForSession } from "../utils/trainerTeam";

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

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export const useChat = (isOpen: boolean, preloadedPets: PetProfile[] = []) => {
  const { user } = useAuth();
  const { startMetric, endMetric } = usePerformanceMonitor('Chat');
  const { currentLanguage } = useTranslations();
  const { t } = useTranslation();
  
  // Consolidated state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionTrainerName, setSessionTrainerName] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [selectedPet, setSelectedPet] = useState<string>("none");
  const [isSending, setIsSending] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  
  // Cleanup refs
  const abortControllerRef = useRef<AbortController | null>(null);
  const cleanupCallbacksRef = useRef<Array<() => void>>([]);

  // Session persistence key
  const getSessionStorageKey = useCallback(() => {
    return user ? `chat-session-${user.id}` : null;
  }, [user]);

  // Memoized pets calculation
  const pets = useMemo(() => {
    return preloadedPets.filter(pet => pet && pet.id && pet.name && pet.species);
  }, [preloadedPets]);

  const hasPets = pets.length > 0;

  // Clean up only callbacks and abort controllers - keep session and messages
  const cleanupOperations = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    cleanupCallbacksRef.current.forEach(callback => {
      try { callback(); } catch (e) { /* ignore */ }
    });
    cleanupCallbacksRef.current = [];
  }, []);

  // Full cleanup only on logout/unmount
  const fullCleanup = useCallback(() => {
    cleanupOperations();
    const storageKey = getSessionStorageKey();
    if (storageKey) {
      localStorage.removeItem(storageKey);
    }
    
    setSessionId(null);
    setSessionTrainerName("");
    setMessages([]);
    setMessage("");
    setIsReady(false);
    setIsSending(false);
    setHistoryLoaded(false);
  }, [cleanupOperations, getSessionStorageKey]);

  // Get or create session with persistence
  const getOrCreateSession = useCallback(async () => {
    if (!user) return null;

    const metricKey = startMetric('session-management', 'query');
    const storageKey = getSessionStorageKey();
    
    try {
      // Check localStorage first
      let existingSessionId = null;
      if (storageKey) {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            existingSessionId = parsed.sessionId;
          } catch (e) {
            localStorage.removeItem(storageKey);
          }
        }
      }

      // If we have an existing session, verify it exists in DB
      if (existingSessionId) {
        const { data: existingSession } = await supabase
          .from('chat_sessions')
          .select('id, title')
          .eq('id', existingSessionId)
          .eq('user_id', user.id)
          .single();

        if (existingSession) {
          setSessionId(existingSession.id);
          setSessionTrainerName(existingSession.title?.replace('Chat mit ', '') || assignTrainerForSession());
          setIsReady(true);
          endMetric(metricKey, 'session-management');
          return existingSession.id;
        } else {
          // Session doesn't exist anymore, remove from localStorage
          if (storageKey) localStorage.removeItem(storageKey);
        }
      }

      // Create new session
      const trainerName = assignTrainerForSession();
      const { data: newSession } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          title: `Chat mit ${trainerName}`,
        })
        .select()
        .single();

      if (newSession) {
        setSessionId(newSession.id);
        setSessionTrainerName(trainerName);
        setIsReady(true);
        
        // Store in localStorage
        if (storageKey) {
          localStorage.setItem(storageKey, JSON.stringify({
            sessionId: newSession.id,
            trainerName,
            timestamp: Date.now()
          }));
        }
        
        endMetric(metricKey, 'session-management');
        return newSession.id;
      }
    } catch (error) {
      console.warn('Session management error:', error);
      endMetric(metricKey, 'session-management');
    }
    
    return null;
  }, [user, startMetric, endMetric, getSessionStorageKey]);

  // Load history immediately for any session
  const loadHistory = useCallback(async (sessionId: string) => {
    if (!sessionId || !user || historyLoaded) return;

    const metricKey = startMetric('load-history', 'query');
    
    try {
      const { data: chatHistory, error } = await supabase
        .from('chat_messages')
        .select('id, role, content, created_at')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
        .limit(20);

      if (!error && chatHistory && chatHistory.length > 0) {
        const formattedMessages = chatHistory.map(msg => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          created_at: msg.created_at
        }));
        
        setMessages(formattedMessages);
        setHistoryLoaded(true);
      } else {
        setHistoryLoaded(true);
      }
      
      endMetric(metricKey, 'load-history');
    } catch (error: any) {
      console.warn('History loading failed:', error);
      setHistoryLoaded(true);
      endMetric(metricKey, 'load-history');
    }
  }, [user, historyLoaded, startMetric, endMetric]);

  // Optimistic message handling
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

  // Send message with instant feedback
  const sendMessage = useCallback(async () => {
    if (!message.trim() || !sessionId || isSending) return;

    const metricKey = startMetric('send-message', 'query');
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
    const aiMessageId = addOptimisticMessage(`💭 ${t('support.chat.thinking')}`, 'assistant');

    try {
      // Debug: Log the language being sent
      console.log('🌍 Sending chat message with language:', currentLanguage);
      
      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: {
          message: userMessage,
          sessionId: sessionId,
          petId: currentSelectedPet === "none" ? null : currentSelectedPet,
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

      // Update messages with real response
      updateMessage(userMessageId, {
        id: `user-${Date.now()}`,
        created_at: new Date().toISOString()
      });

      updateMessage(aiMessageId, {
        id: `ai-${Date.now()}`,
        content: data.response,
        created_at: new Date().toISOString()
      });

      endMetric(metricKey, 'send-message');
    } catch (error: any) {
      endMetric(metricKey, 'send-message');
      console.error('Chat error:', error.message);
      
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
  }, [message, sessionId, isSending, selectedPet, pets, sessionTrainerName, currentLanguage, startMetric, endMetric, addOptimisticMessage, updateMessage]);

  // Handle key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  // Session initialization effect
  useEffect(() => {
    if (isOpen && user && !sessionId) {
      getOrCreateSession().then(newSessionId => {
        if (newSessionId && !historyLoaded) {
          loadHistory(newSessionId);
        }
      });
    }
  }, [isOpen, user, sessionId, getOrCreateSession, loadHistory, historyLoaded]);

  // History loading effect for existing sessions
  useEffect(() => {
    if (sessionId && isOpen && !historyLoaded) {
      loadHistory(sessionId);
    }
  }, [sessionId, isOpen, historyLoaded, loadHistory]);

  // Light cleanup on close - only operations, keep session and messages
  useEffect(() => {
    if (!isOpen) {
      cleanupOperations();
      setMessage(""); // Clear input field
    }
  }, [isOpen, cleanupOperations]);

  // Full cleanup on unmount
  useEffect(() => {
    return fullCleanup;
  }, [fullCleanup]);

  // Memoized computed values
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

  const getTrainerName = useCallback(() => {
    return sessionTrainerName || "TierTrainer";
  }, [sessionTrainerName]);

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
    getTrainerName,
    canSendMessage,
    hasPets,
    
    // Status
    usage: { questionsUsed: 0, maxQuestions: 10, hasReachedLimit: false }
  };
};
