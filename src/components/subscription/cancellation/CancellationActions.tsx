
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';

interface CancellationActionsProps {
  isWithinMoneyBackPeriod: boolean;
  isProcessing: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const CancellationActions = ({
  isWithinMoneyBackPeriod,
  isProcessing,
  onConfirm,
  onCancel
}: CancellationActionsProps) => {
  const { t } = useTranslations();
  
  return (
    <div className="flex flex-col gap-2 pt-4">
      <Button 
        onClick={onConfirm} 
        variant={isWithinMoneyBackPeriod ? "default" : "destructive"}
        className="w-full"
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            {t('subscription.cancellation.actions.processing')}
          </>
        ) : (
          isWithinMoneyBackPeriod 
            ? t('subscription.cancellation.actions.cancelAndRefund')
            : t('subscription.cancellation.actions.cancelPermanently')
        )}
      </Button>
      <Button 
        variant="outline" 
        onClick={onCancel} 
        className="w-full"
        disabled={isProcessing}
      >
        {t('subscription.cancellation.actions.dontCancel')}
      </Button>
    </div>
  );
};
