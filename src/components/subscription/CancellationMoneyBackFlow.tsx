
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { differenceInDays } from "date-fns";
import { useAuth } from '@/hooks/useAuth';
import { useEnhancedCancellationFlow } from './hooks/useEnhancedCancellationFlow';
import { CancellationDialogHeader } from './cancellation/CancellationDialogHeader';
import { MoneyBackGuaranteeCard } from './cancellation/MoneyBackGuaranteeCard';
import { RegularCancellationCard } from './cancellation/RegularCancellationCard';
import { CancellationActions } from './cancellation/CancellationActions';
import { CancellationErrorMessages } from './cancellation/CancellationErrorMessages';
import { hasMoneyBackGuarantee } from '../pricing/planData';

interface CancellationMoneyBackFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onCancelSubscription: () => void;
  subscriptionStart?: string;
  subscriptionEnd?: string;
  subscriptionTier?: string;
}

export const CancellationMoneyBackFlow = ({ 
  isOpen, 
  onClose, 
  onCancelSubscription,
  subscriptionStart,
  subscriptionEnd,
  subscriptionTier 
}: CancellationMoneyBackFlowProps) => {
  const { user } = useAuth();

  // Check if this subscription tier has money-back guarantee
  const tierHasGuarantee = subscriptionTier ? hasMoneyBackGuarantee(`${subscriptionTier.toLowerCase().replace(/\s+/g, '-')}-monthly`) : false;

  // Berechne ob innerhalb der 14-Tage-Frist UND ob der Plan berechtigt ist
  const isWithinMoneyBackPeriod = subscriptionStart && tierHasGuarantee
    ? differenceInDays(new Date(), new Date(subscriptionStart)) < 14
    : false;

  const daysSinceStart = subscriptionStart 
    ? differenceInDays(new Date(), new Date(subscriptionStart))
    : 0;

  const { isProcessing, handleConfirmCancellation } = useEnhancedCancellationFlow({
    isWithinMoneyBackPeriod,
    subscriptionEnd,
    userEmail: user?.email,
    onCancelSubscription,
    onClose
  });

  // Show error message only if the tier had guarantee but it's expired
  const showExpiredWarning = subscriptionStart && tierHasGuarantee && daysSinceStart >= 14;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <CancellationDialogHeader isWithinMoneyBackPeriod={isWithinMoneyBackPeriod} />
        
        <div className="space-y-4">
          {showExpiredWarning && (
            <CancellationErrorMessages 
              errorType="expired_period"
              subscriptionStart={subscriptionStart}
              subscriptionEnd={subscriptionEnd}
            />
          )}
          
          {!tierHasGuarantee && subscriptionStart && (
            <CancellationErrorMessages 
              errorType="no_guarantee"
              subscriptionStart={subscriptionStart}
              subscriptionEnd={subscriptionEnd}
            />
          )}
          
          {isWithinMoneyBackPeriod ? (
            <MoneyBackGuaranteeCard />
          ) : (
            <RegularCancellationCard subscriptionEnd={subscriptionEnd} />
          )}
          
          <CancellationActions
            isWithinMoneyBackPeriod={isWithinMoneyBackPeriod}
            isProcessing={isProcessing}
            onConfirm={handleConfirmCancellation}
            onCancel={onClose}
          />
          
          {isWithinMoneyBackPeriod && (
            <div className="text-center text-xs text-gray-500 mt-3">
              💙 Vielen Dank, dass Sie TierTrainer24 ausprobiert haben
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
