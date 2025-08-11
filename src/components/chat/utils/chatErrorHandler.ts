
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/hooks/useTranslations";

export const useChatErrorHandler = () => {
  const { toast } = useToast();
  const { t } = useTranslations();

  const handleChatError = (error: any) => {
    console.error('❌ Error in sendMessage:', error);
    
    let errorMessage = t('support.chat.errorHandler.defaultMessage');
    let isTemporary = true;
    
    if (error?.message?.includes('timeout')) {
      errorMessage = t('support.chat.errorHandler.timeout');
      isTemporary = true;
    } else if (error?.message?.includes('not found') || error?.message?.includes('404')) {
      errorMessage = t('support.chat.errorHandler.serviceUpdate');
      isTemporary = true;
    } else if (error?.message?.includes('network') || error?.message?.includes('Failed to fetch')) {
      errorMessage = t('support.chat.errorHandler.networkProblem');
      isTemporary = true;
    } else if (error?.message?.includes('Session')) {
      errorMessage = t('support.chat.errorHandler.sessionExpired');
      isTemporary = false;
    } else if (error?.message?.includes('Chat-Service') || error?.message?.includes('Edge Function')) {
      errorMessage = t('support.chat.errorHandler.chatServiceUnavailable');
      isTemporary = true;
    } else if (error?.message) {
      errorMessage = t('support.chat.errorHandler.genericError', { errorMessage: error.message });
    }
    
    toast({
      title: isTemporary ? t('support.chat.errorHandler.temporaryProblem') : t('support.chat.errorHandler.chatError'),
      description: errorMessage,
      variant: "destructive",
      duration: isTemporary ? 5000 : 8000
    });
  };

  return { handleChatError };
};
