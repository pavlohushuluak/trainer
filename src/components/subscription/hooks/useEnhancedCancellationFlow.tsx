
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
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
  const { sendCancellationConfirmation } = useCancellationEmail();
  const [isProcessing, setIsProcessing] = useState(false);

  const logCancellationAttempt = async (success: boolean, error?: string) => {
    try {
      await supabase.from('system_notifications').insert({
        type: success ? 'cancellation_successful' : 'cancellation_failed',
        title: success ? 'Kündigung erfolgreich' : 'Kündigungsfehler',
        message: success 
          ? `Kündigung erfolgreich verarbeitet für ${userEmail}`
          : `Kündigungsfehler: ${error}`,
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
          cancellationReason: isWithinMoneyBackPeriod ? 'Geld-zurück-Garantie' : 'Reguläre Kündigung'
        });
      }

      onCancelSubscription();
      
      // Enhanced user feedback
      if (isWithinMoneyBackPeriod && data.refunded) {
        toast({
          title: "💰 Kündigung mit vollständiger Rückerstattung",
          description: `Ihr Abonnement wurde gekündigt und €${(data.refundAmount / 100).toFixed(2)} werden in 3-5 Werktagen zurückerstattet. Alle Premium-Features wurden deaktiviert. Sie erhalten eine Bestätigungs-E-Mail.`,
          duration: 12000
        });
      } else if (isWithinMoneyBackPeriod) {
        toast({
          title: "✅ Sofortige Kündigung erfolgreich",
          description: "Ihr Abonnement wurde sofort beendet und alle Premium-Features deaktiviert. Sie erhalten eine Bestätigungs-E-Mail.",
          duration: 8000
        });
      } else {
        toast({
          title: "📅 Kündigung zum Periodenende bestätigt",
          description: `Schade, dass Sie gehen! Ihr Zugang bleibt bis zum ${subscriptionEnd ? new Date(subscriptionEnd).toLocaleDateString('de-DE') : 'Ablaufdatum'} aktiv. Sie erhalten eine Bestätigungs-E-Mail.`,
          duration: 8000
        });
      }
      
      onClose();
    } catch (error: any) {
      console.error('Failed to cancel subscription:', error);
      await logCancellationAttempt(false, error.message);
      
      toast({
        title: "❌ Fehler bei der Kündigung",
        description: `Die Kündigung konnte nicht verarbeitet werden: ${error.message}. Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.`,
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
