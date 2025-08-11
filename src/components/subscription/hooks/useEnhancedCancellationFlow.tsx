
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTranslations } from '@/hooks/useTranslations';
import { useCancellationEmail } from '../cancellation/CancellationConfirmationEmail';

interface UseEnhancedCancellationFlowProps {
  isWithinMoneyBackPeriod: boolean;
  subscriptionEnd?: string;
  userEmail?: string;
  onCancelSubscription: () => void;
  onClose: () => void;
}

export const useEnhancedCancellationFlow = ({
  isWithinMoneyBackPeriod,
  subscriptionEnd,
  userEmail,
  onCancelSubscription,
  onClose
}: UseEnhancedCancellationFlowProps) => {
  const { toast } = useToast();
  const { t } = useTranslations();
  const { sendCancellationConfirmation } = useCancellationEmail();
  const [isProcessing, setIsProcessing] = useState(false);

  const logCancellationAttempt = async (success: boolean, error?: string) => {
    try {
      await supabase.from('system_notifications').insert({
        type: success ? 'cancellation_successful' : 'cancellation_failed',
        title: success ? t('admin.enhancedCancellationFlow.systemNotifications.cancellationSuccessful') : t('admin.enhancedCancellationFlow.systemNotifications.cancellationFailed'),
        message: success 
          ? t('admin.enhancedCancellationFlow.systemNotifications.cancellationProcessed', { userEmail })
          : t('admin.enhancedCancellationFlow.systemNotifications.cancellationError', { error }),
        user_id: null,
        status: 'sent'
      });
    } catch (logError) {
      console.warn('Failed to log cancellation event:', logError);
    }
  };

  const deactivateAllPremiumFeatures = async () => {
    try {
      const { error } = await supabase.functions.invoke('deactivate-premium-features', {
        body: {
          userEmail,
          deactivationReason: isWithinMoneyBackPeriod ? 'refund' : 'cancellation'
        }
      });
      
      if (error) {
        console.warn('Failed to deactivate premium features:', error);
      }
    } catch (error) {
      console.warn('Failed to deactivate premium features:', error);
    }
  };

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
        await logCancellationAttempt(false, error.message);
        throw error;
      }


      await logCancellationAttempt(true);

      // Deactivate all premium features
      await deactivateAllPremiumFeatures();

      // Send confirmation email
      if (userEmail) {
        await sendCancellationConfirmation({
          userEmail,
          isRefund: isWithinMoneyBackPeriod && data.refunded,
          refundAmount: data.refundAmount,
          subscriptionEnd,
          cancellationReason: isWithinMoneyBackPeriod ? t('admin.enhancedCancellationFlow.cancellationReasons.moneyBackGuarantee') : t('admin.enhancedCancellationFlow.cancellationReasons.regularCancellation')
        });
      }

      onCancelSubscription();
      
      // Enhanced user feedback
      if (isWithinMoneyBackPeriod && data.refunded) {
        toast({
          title: t('admin.enhancedCancellationFlow.toasts.cancelledWithRefund.title'),
          description: t('admin.enhancedCancellationFlow.toasts.cancelledWithRefund.description', { refundAmount: (data.refundAmount / 100).toFixed(2) }),
          duration: 12000
        });
      } else if (isWithinMoneyBackPeriod) {
        toast({
          title: t('admin.enhancedCancellationFlow.toasts.cancelledImmediate.title'),
          description: t('admin.enhancedCancellationFlow.toasts.cancelledImmediate.description'),
          duration: 8000
        });
      } else {
        toast({
          title: t('admin.enhancedCancellationFlow.toasts.cancelledPeriodEnd.title'),
          description: t('admin.enhancedCancellationFlow.toasts.cancelledPeriodEnd.description', { subscriptionEnd: subscriptionEnd ? new Date(subscriptionEnd).toLocaleDateString('de-DE') : 'Ablaufdatum' }),
          duration: 8000
        });
      }
      
      onClose();
    } catch (error: any) {
      console.error('Failed to cancel subscription:', error);
      await logCancellationAttempt(false, error.message);
      
      toast({
        title: t('admin.enhancedCancellationFlow.toasts.cancellationError.title'),
        description: t('admin.enhancedCancellationFlow.toasts.cancellationError.description', { error: error.message }),
        variant: "destructive",
        duration: 10000
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
