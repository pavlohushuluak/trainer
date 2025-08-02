
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Shield, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CancellationDialogHeaderProps {
  isWithinMoneyBackPeriod: boolean;
}

export const CancellationDialogHeader = ({ isWithinMoneyBackPeriod }: CancellationDialogHeaderProps) => {
  const { t } = useTranslation();
  
  return (
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2 text-xl">
        {isWithinMoneyBackPeriod ? (
          <>
            <Shield className="h-6 w-6 text-green-600" />
            {t('subscription.cancellation.moneyBackGuarantee')}
          </>
        ) : (
          <>
            <Heart className="h-6 w-6 text-orange-500" />
            {t('subscription.cancellation.cancelSubscription')}
          </>
        )}
      </DialogTitle>
    </DialogHeader>
  );
};
