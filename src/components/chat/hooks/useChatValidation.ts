
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/hooks/useTranslations";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { useFreeChatLimit } from "@/hooks/useFreeChatLimit";

export const useChatValidation = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslations();
  const { hasActiveSubscription } = useSubscriptionStatus();
  const { usage, loading: usageLoading, incrementUsage } = useFreeChatLimit();

  // Super-optimistic: Always allow until explicitly blocked
  const canSendMessage = true; // Optimistic: Allow immediately, validate when sending

  const validateChatRequirements = (
    sessionId: string | null,
    hasPets: boolean,
    message: string
  ): { isValid: boolean; errorShown: boolean } => {
    if (!message.trim()) {
      return { isValid: false, errorShown: false };
    }

    // Optimistic: Temp-sessions are also valid
    if (!sessionId || (!sessionId.startsWith('temp-') && !sessionId)) {
      toast({
        title: t('chat.validation.error'),
        description: t('chat.validation.chatPreparing'),
        variant: "destructive"
      });
      return { isValid: false, errorShown: true };
    }

    if (!user) {
      toast({
        title: t('chat.validation.loginRequired.title'),
        description: t('chat.validation.loginRequired.description'),
        variant: "destructive"
      });
      return { isValid: false, errorShown: true };
    }

    if (!hasPets) {
      toast({
        title: t('chat.validation.petProfileRequired.title'),
        description: t('chat.validation.petProfileRequired.description'),
        variant: "destructive"
      });
      return { isValid: false, errorShown: true };
    }

    // Optimistic: Only block when limit is clearly reached
    if (!hasActiveSubscription && usage.hasReachedLimit && !usageLoading) {
      toast({
        title: t('chat.validation.freeTrialEnded.title'),
        description: t('chat.validation.freeTrialEnded.description'),
        variant: "destructive"
      });
      return { isValid: false, errorShown: true };
    }

    return { isValid: true, errorShown: false };
  };

  return {
    canSendMessage,
    usage,
    usageLoading,
    incrementUsage,
    hasActiveSubscription,
    validateChatRequirements
  };
};
