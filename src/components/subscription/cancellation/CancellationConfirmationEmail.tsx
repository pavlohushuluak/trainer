
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CancellationEmailData {
  userEmail: string;
  isRefund: boolean;
  refundAmount?: number;
  subscriptionEnd?: string;
  cancellationReason?: string;
}

export const useCancellationEmail = () => {
  const { toast } = useToast();

  const sendCancellationConfirmation = async (data: CancellationEmailData) => {
    try {
      const { error } = await supabase.functions.invoke('send-cancellation-email', {
        body: {
          userEmail: data.userEmail,
          isRefund: data.isRefund,
          refundAmount: data.refundAmount,
          subscriptionEnd: data.subscriptionEnd,
          cancellationReason: data.cancellationReason || 'Nutzerwunsch'
        }
      });

      if (error) throw error;

      toast({
        title: "📧 Bestätigungs-E-Mail versendet",
        description: "Sie erhalten eine Bestätigung Ihrer Kündigung per E-Mail.",
        duration: 5000
      });
    } catch (error) {
      console.error('Failed to send cancellation email:', error);
      // Don't block the cancellation process if email fails
      toast({
        title: "Kündigung erfolgreich",
        description: "Ihre Kündigung wurde verarbeitet. Die Bestätigungs-E-Mail konnte nicht versendet werden.",
        variant: "default",
        duration: 6000
      });
    }
  };

  return { sendCancellationConfirmation };
};
