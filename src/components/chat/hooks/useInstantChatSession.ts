import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslations } from "@/hooks/useTranslations";
import { assignTrainerForSession } from "../utils/trainerTeam";

interface InstantSessionResult {
  sessionId: string;
  trainerName: string;
  isReady: boolean;
  isTemp: boolean;
}

export const useInstantChatSession = (isOpen: boolean) => {
  const { user } = useAuth();
  const { t } = useTranslations();
  const [session, setSession] = useState<InstantSessionResult | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const backgroundSyncRef = useRef<Promise<void> | null>(null);

  // SOFORTIGE Session-Bereitstellung für Chat-Verfügbarkeit
  const createInstantSession = useCallback(() => {
    if (!user || !isOpen) return null;

    // Sofort verfügbare temporäre Session - KEIN await, KEINE API-Calls
    const tempSessionId = `instant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const trainerName = assignTrainerForSession();
    
    const instantSession: InstantSessionResult = {
      sessionId: tempSessionId,
      trainerName,
      isReady: true,
      isTemp: true
    };

    setSession(instantSession);

    // Background-Sync ohne Blockierung
    backgroundSyncRef.current = upgradeToRealSession(tempSessionId, trainerName);

    return instantSession;
  }, [user, isOpen]);

  // Background-Upgrade zu echter Session (non-blocking)
  const upgradeToRealSession = useCallback(async (tempSessionId: string, trainerName: string) => {
    if (!user) return;

    try {
      
      // Erstelle echte Session im Hintergrund
      const { data: realSession, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          title: `Chat mit ${trainerName}`,
        })
        .select()
        .single();

      if (realSession && !error) {
        
        // Upgrade Session State - non-blocking
        setSession(prev => prev ? {
          ...prev,
          sessionId: realSession.id,
          isTemp: false
        } : null);
        
        // Optional: Update localStorage für nächste Nutzung
        try {
          const storageKey = `chat-session-${user.id}`;
          localStorage.setItem(storageKey, JSON.stringify({
            sessionId: realSession.id,
            trainerName,
            timestamp: Date.now()
          }));
        } catch (e) {
          console.warn('localStorage update failed:', e);
        }
      } else {
        console.warn('⚠️ Background upgrade failed, keeping temp session:', error);
        // Temp Session bleibt funktional
      }
    } catch (error) {
      console.warn('⚠️ Background upgrade error, keeping temp session:', error);
      // Chat funktioniert weiterhin mit temp session
    }
  }, [user]);

  // Session bei Chat-Öffnung sofort initialisieren
  useEffect(() => {
    if (isOpen && user && !session && !isCreating) {
      setIsCreating(true);
      
      // INSTANT Session-Erstellung - 0ms Verzögerung
      const instantSession = createInstantSession();
      
      setIsCreating(false);
      
    }
  }, [isOpen, user, session, isCreating, createInstantSession]);

  // Cleanup bei Chat-Schließung
  useEffect(() => {
    if (!isOpen) {
      setSession(null);
      setIsCreating(false);
      
      // Background-Sync abbrechen falls läuft
      if (backgroundSyncRef.current) {
        backgroundSyncRef.current = null;
      }
    }
  }, [isOpen]);

  return {
    sessionId: session?.sessionId || null,
          trainerName: session?.trainerName || t('chat.hooks.defaultTrainer'),
    isReady: !!session?.isReady,
    isTemp: session?.isTemp || false,
    isCreating: false
  };
};