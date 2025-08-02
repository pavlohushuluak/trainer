
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
          title: "💰 Kündigung mit Rückerstattung erfolgreich",
          description: `Du hast €${(data.refundAmount / 100).toFixed(2)} zurückerhalten. Das Geld wird in 3-5 Werktagen auf deinem Konto sein. Danke, dass du TierTrainer24 ausprobiert hast! 🐾`,
          duration: 10000
        });
      } else if (isWithinMoneyBackPeriod) {
        toast({
          title: "💰 Kündigung mit sofortiger Beendigung",
          description: "Dein Abonnement wurde sofort beendet. Danke, dass du TierTrainer24 ausprobiert hast! 🐾",
          duration: 8000
        });
      } else {
        toast({
          title: "Kündigung bestätigt",
          description: `Schade, dass du gehst! Dein Zugang bleibt bis zum ${subscriptionEnd ? new Date(subscriptionEnd).toLocaleDateString('de-DE') : 'Ablaufdatum'} aktiv.`,
          duration: 6000
        });
      }
      
      onClose();
    } catch (error: any) {
      console.error('Failed to cancel subscription:', error);
      toast({
        title: "Fehler bei der Kündigung",
        description: error.message || "Die Kündigung konnte nicht verarbeitet werden. Bitte versuche es erneut oder kontaktiere den Support.",
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
