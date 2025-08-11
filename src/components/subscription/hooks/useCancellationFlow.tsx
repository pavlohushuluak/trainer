
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTranslations } from '@/hooks/useTranslations';

interface UseCancellationFlowProps {
  isWithinMoneyBackPeriod: boolean;
  subscriptionEnd?: string;
  onCancelSubscription: () => void;
  onClose: () => void;
}

export const useCancellationFlow = ({
  isWithinMoneyBackPeriod,
  subscriptionEnd,
  onCancelSubscription,
  onClose
}: UseCancellationFlowProps) => {
  const { toast } = useToast();
  const { t } = useTranslations();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirmCancellation = async () => {
    setIsProcessing(true);
    
    try {
      
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: {
          immediateRefund: isWithinMoneyBackPeriod
        }
      });

      if (error) {
        console.error('Cancellation error:', error);
        throw error;
      }



      onCancelSubscription();
      
      if (isWithinMoneyBackPeriod && data.refunded) {
        toast({
          title: t('admin.cancellationFlow.toasts.cancelledWithRefund.title'),
          description: t('admin.cancellationFlow.toasts.cancelledWithRefund.description', { refundAmount: (data.refundAmount / 100).toFixed(2) }),
          duration: 10000
        });
      } else if (isWithinMoneyBackPeriod) {
        toast({
          title: t('admin.cancellationFlow.toasts.cancelledImmediate.title'),
          description: t('admin.cancellationFlow.toasts.cancelledImmediate.description'),
          duration: 8000
        });
      } else {
        toast({
          title: t('admin.cancellationFlow.toasts.cancelledPeriodEnd.title'),
          description: t('admin.cancellationFlow.toasts.cancelledPeriodEnd.description', { subscriptionEnd: subscriptionEnd ? new Date(subscriptionEnd).toLocaleDateString('de-DE') : 'Ablaufdatum' }),
          duration: 6000
        });
      }
      
      onClose();
    } catch (error: any) {
      console.error('Failed to cancel subscription:', error);
      const errorMessage = error.message || "Die Kündigung konnte nicht verarbeitet werden. Bitte versuche es erneut oder kontaktiere den Support.";
      toast({
        title: t('admin.cancellationFlow.toasts.cancellationError.title'),
        description: t('admin.cancellationFlow.toasts.cancellationError.description', { errorMessage }),
        variant: "destructive",
        duration: 8000
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    handleConfirmCancellation
  };
};
