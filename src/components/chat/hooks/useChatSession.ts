
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/hooks/useTranslations";

const trainerTeam = [
  { firstName: "Marc", lastName: "W.", specialty: "Hunde, Grundgehorsam" },
  { firstName: "Lisa", lastName: "M.", specialty: "Katzen, Verhaltensprobleme" },
  { firstName: "Tom", lastName: "B.", specialty: "Hunde, Aggression" },
  { firstName: "Anna", lastName: "K.", specialty: "Welpen, Sozialisation" },
  { firstName: "Max", lastName: "S.", specialty: "Exotische Tiere" },
  { firstName: "Nina", lastName: "H.", specialty: "Pferde, Training" },
  { firstName: "Paul", lastName: "L.", specialty: "Alte Tiere, Rehabilitation" }
];

export const useChatSession = (isOpen: boolean) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslations();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionTrainerName, setSessionTrainerName] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);

  const getTrainerName = () => {
    return sessionTrainerName || t('chat.hooks.defaultTrainer');
  };

  const createImmediateSession = () => {
    if (!user) return null;

    // Sofort verfügbare Temp-Session für Chat-Bereitschaft
    const tempSessionId = `temp-${user.id}-${Date.now()}`;
    const randomTrainer = trainerTeam[Math.floor(Math.random() * trainerTeam.length)];
    const trainerName = `${randomTrainer.firstName} ${randomTrainer.lastName}`;
    
    setSessionId(tempSessionId);
    setSessionTrainerName(trainerName);
    
    return tempSessionId;
  };

  const syncRealSession = async (tempSessionId: string) => {
    if (!user || !tempSessionId.startsWith('temp-')) return tempSessionId;

    try {
      
      // Versuche zuerst existierende Session zu finden
      const { data: existingSession, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (existingSession && !error) {
        setSessionId(existingSession.id);
        
        // Update timestamp im Hintergrund
        supabase
          .from('chat_sessions')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', existingSession.id)
        
        return existingSession.id;
      }

      // Erstelle neue Session wenn keine existiert
      const { data: newSession, error: createError } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          title: 'Chat mit TierTrainer',
          pet_id: null
        })
        .select()
        .single();

      if (createError) {
        console.warn('⚠️ Session creation failed, keeping temp session:', createError);
        return tempSessionId; // Behalte temp session bei Fehler
      }

      setSessionId(newSession.id);
      return newSession.id;
    } catch (error) {
      console.warn('⚠️ Background session sync failed, keeping temp session:', error);
      return tempSessionId; // Behalte temp session bei Fehler
    }
  };

  // Sofortige Session-Bereitstellung beim Öffnen
  useEffect(() => {
    if (isOpen && user && !sessionId && !isCreating) {
      setIsCreating(true);
      
      // Schritt 1: Sofort verfügbare Session
      const tempSession = createImmediateSession();
      
      // Schritt 2: Background-Sync ohne UI-Blockierung
      if (tempSession) {
        setTimeout(() => {
          syncRealSession(tempSession).finally(() => {
            setIsCreating(false);
          });
        }, 100); // Minimale Verzögerung für UI-Priorisierung
      } else {
        setIsCreating(false);
      }
    }
  }, [isOpen, user, sessionId, isCreating]);

  return {
    sessionId,
    sessionTrainerName,
    getTrainerName,
    isCreating: false
  };
};
