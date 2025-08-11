
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from '@/hooks/useTranslations';
import { supabase } from '@/integrations/supabase/client';

export const useChatErrorRecovery = () => {
  const { toast } = useToast();
  const { t } = useTranslations();
  const [isRecovering, setIsRecovering] = useState(false);

  const recoverFromError = useCallback(async (error: any, context: string) => {
    setIsRecovering(true);

    let recoveryAction = t('chat.errorRecovery.defaultAction');
    let canRetry = true;

    // Analyze error type and suggest specific recovery
    if (error?.message?.includes('timeout')) {
      recoveryAction = t('chat.errorRecovery.timeout');
      canRetry = true;
    } else if (error?.message?.includes('Failed to fetch')) {
      recoveryAction = t('chat.errorRecovery.networkProblem');
      canRetry = true;
    } else if (error?.message?.includes('Session')) {
      recoveryAction = t('chat.errorRecovery.sessionProblem');
      canRetry = true;
      
      // Try to refresh session
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          recoveryAction = t('chat.errorRecovery.loginRequired');
          canRetry = false;
        }
      } catch (sessionError) {
        recoveryAction = t('chat.errorRecovery.loginFailed');
        canRetry = false;
      }
    } else if (error?.message?.includes('Chat-Service') || error?.message?.includes('Edge Function')) {
      recoveryAction = t('chat.errorRecovery.chatServiceUnavailable');
      canRetry = false;
    } else if (error?.message?.includes('OpenAI')) {
      recoveryAction = t('chat.errorRecovery.aiServiceUnavailable');
      canRetry = false;
    }

    // Only show toast for final failures to avoid spam
    if (!canRetry) {
      toast({
        title: t('chat.errorRecovery.title'),
        description: recoveryAction,
        variant: "destructive"
      });
    }

    setIsRecovering(false);
    return { canRetry, recoveryAction };
  }, [toast, t]);

  return {
    recoverFromError,
    isRecovering
  };
};
