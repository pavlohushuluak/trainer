
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useChatErrorRecovery = () => {
  const { toast } = useToast();
  const [isRecovering, setIsRecovering] = useState(false);

  const recoverFromError = useCallback(async (error: any, context: string) => {
    setIsRecovering(true);

    let recoveryAction = 'Bitte versuche es erneut.';
    let canRetry = true;

    // Analyze error type and suggest specific recovery
    if (error?.message?.includes('timeout')) {
      recoveryAction = '⏱️ Timeout erkannt. Der TierTrainer wird automatisch erneut versucht...';
      canRetry = true;
    } else if (error?.message?.includes('Failed to fetch')) {
      recoveryAction = '🌐 Netzwerkproblem erkannt. Prüfe deine Internetverbindung und versuche es erneut.';
      canRetry = true;
    } else if (error?.message?.includes('Session')) {
      recoveryAction = '🔑 Session-Problem erkannt. Prüfe deine Anmeldung...';
      canRetry = true;
      
      // Try to refresh session
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          recoveryAction = '🔑 Bitte melde dich erneut an.';
          canRetry = false;
        }
      } catch (sessionError) {
        recoveryAction = '🔑 Anmeldung fehlgeschlagen. Bitte lade die Seite neu.';
        canRetry = false;
      }
    } else if (error?.message?.includes('Chat-Service') || error?.message?.includes('Edge Function')) {
      recoveryAction = '🤖 Chat-Service ist vorübergehend nicht verfügbar. Bitte versuche es in wenigen Minuten erneut.';
      canRetry = false;
    } else if (error?.message?.includes('OpenAI')) {
      recoveryAction = '🧠 KI-Service ist vorübergehend nicht verfügbar. Versuche es später erneut.';
      canRetry = false;
    }

    // Only show toast for final failures to avoid spam
    if (!canRetry) {
      toast({
        title: "Chat-Problem erkannt",
        description: recoveryAction,
        variant: "destructive"
      });
    }

    setIsRecovering(false);
    return { canRetry, recoveryAction };
  }, [toast]);

  return {
    recoverFromError,
    isRecovering
  };
};
