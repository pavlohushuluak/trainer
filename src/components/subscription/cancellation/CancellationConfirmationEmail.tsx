
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTranslations } from '@/hooks/useTranslations';

interface CancellationEmailData {
  userEmail: string;
  isRefund: boolean;
  refundAmount?: number;
  subscriptionEnd?: string;
  cancellationReason?: string;
}

export const useCancellationEmail = () => {
  const { toast } = useToast();
  const { t } = useTranslations();

  const sendCancellationConfirmation = async (data: CancellationEmailData) => {
    try {
      const { error } = await supabase.functions.invoke('send-cancellation-email', {
        body: {
          userEmail: data.userEmail,
          isRefund: data.isRefund,
          refundAmount: data.refundAmount,
          subscriptionEnd: data.subscriptionEnd,
          cancellationReason: data.cancellationReason || t('cancellationConfirmationEmail.defaultReason')
        }
      });

      if (error) throw error;

      toast({
        title: t('cancellationConfirmationEmail.toasts.emailSent.title'),
        description: t('cancellationConfirmationEmail.toasts.emailSent.description'),
        duration: 5000
      });
    } catch (error) {
      console.error('Failed to send cancellation email:', error);
      // Don't block the cancellation process if email fails
      toast({
        title: t('cancellationConfirmationEmail.toasts.cancellationSuccessful.title'),
        description: t('cancellationConfirmationEmail.toasts.cancellationSuccessful.description'),
        variant: "default",
        duration: 6000
      });
    }
  };

  return { sendCancellationConfirmation };
};
