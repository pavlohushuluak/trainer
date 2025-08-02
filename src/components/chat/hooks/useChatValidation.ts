
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { useFreeChatLimit } from "@/hooks/useFreeChatLimit";

export const useChatValidation = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { hasActiveSubscription } = useSubscriptionStatus();
  const { usage, loading: usageLoading, incrementUsage } = useFreeChatLimit();

  // Super-optimistisch: Immer erlauben bis explizit blockiert
  const canSendMessage = true; // Optimistic: Erlaube sofort, validiere beim Senden

  const validateChatRequirements = (
    sessionId: string | null,
    hasPets: boolean,
    message: string
  ): { isValid: boolean; errorShown: boolean } => {
    if (!message.trim()) {
      return { isValid: false, errorShown: false };
    }

    // Optimistic: Temp-Sessions sind auch gültig
    if (!sessionId || (!sessionId.startsWith('temp-') && !sessionId)) {
      toast({
        title: "Fehler",
        description: "Chat wird vorbereitet... Versuche es gleich nochmal!",
        variant: "destructive"
      });
      return { isValid: false, errorShown: true };
    }

    if (!user) {
      toast({
        title: "Fehler",
        description: "Sie müssen angemeldet sein, um den Chat zu nutzen.",
        variant: "destructive"
      });
      return { isValid: false, errorShown: true };
    }

    if (!hasPets) {
      toast({
        title: "Tierprofil erforderlich",
        description: "Lege zuerst ein Tierprofil an, um den Chat zu nutzen.",
        variant: "destructive"
      });
      return { isValid: false, errorShown: true };
    }

    // Optimistic: Nur bei eindeutigem Limit-Erreichen blockieren
    if (!hasActiveSubscription && usage.hasReachedLimit && !usageLoading) {
      toast({
        title: "Gratis-Test beendet",
        description: "Upgrade zu Premium für unbegrenzte Beratung.",
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
