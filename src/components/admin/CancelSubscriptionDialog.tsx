
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { X, DollarSign } from 'lucide-react';
import { UserWithDetails } from './types';
import { hasMoneyBackGuarantee } from '../pricing/planData';
import { useTranslation } from 'react-i18next';

interface CancelSubscriptionDialogProps {
  user: UserWithDetails;
  isWithinMoneyBackPeriod: boolean;
  onCancelSubscription: (userId: string, immediateRefund: boolean) => void;
  isCancelling: boolean;
}

export const CancelSubscriptionDialog = ({
  user,
  isWithinMoneyBackPeriod,
  onCancelSubscription,
  isCancelling
}: CancelSubscriptionDialogProps) => {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const { t } = useTranslation();

  const handleCancelSubscription = (immediateRefund: boolean) => {
    onCancelSubscription(user.id, immediateRefund);
    setShowCancelDialog(false);
  };

  // Check if this user's subscription tier has money-back guarantee
  const tierHasGuarantee = user.subscription?.subscription_tier ? 
    hasMoneyBackGuarantee(`${user.subscription.subscription_tier.toLowerCase().replace(/\s+/g, '-')}-monthly`) : false;

  // Only show money-back option if both within period AND tier has guarantee
  const showMoneyBackOption = isWithinMoneyBackPeriod && tierHasGuarantee;

  if (!user.subscription?.subscribed || user.subscription?.cancel_at_period_end) {
    return null;
  }

  return (
    <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
      <DialogTrigger asChild>
        <Button 
          size="sm" 
          variant="destructive"
          disabled={isCancelling}
        >
          <X className="h-3 w-3 mr-1" />
          {t('adminCancelSubscription.cancelButton')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('adminCancelSubscription.title')}</DialogTitle>
          <DialogDescription>
            {t('adminCancelSubscription.description', { email: user.email })}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {showMoneyBackOption && (
            <div className="bg-green-50 border border-green-200 p-4 rounded">
              <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                {t('adminCancelSubscription.moneyBackGuarantee.title')}
              </h4>
              <p className="text-sm text-green-700">
                {t('adminCancelSubscription.moneyBackGuarantee.description')}
              </p>
            </div>
          )}
          
          {!tierHasGuarantee && isWithinMoneyBackPeriod && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
              <p className="text-sm text-yellow-700">
                <strong>{t('adminCancelSubscription.noGuarantee.note')}</strong> {t('adminCancelSubscription.noGuarantee.description', { plan: user.subscription?.subscription_tier || '' })}
              </p>
            </div>
          )}
          
          <div className="flex flex-col gap-2">
            {showMoneyBackOption && (
              <Button 
                onClick={() => handleCancelSubscription(true)}
                disabled={isCancelling}
                className="bg-green-600 hover:bg-green-700"
              >
                {t('adminCancelSubscription.actions.cancelWithRefund')}
              </Button>
            )}
            <Button 
              onClick={() => handleCancelSubscription(false)}
              disabled={isCancelling}
              variant="destructive"
            >
              {showMoneyBackOption ? t('adminCancelSubscription.actions.cancelWithoutRefund') : t('adminCancelSubscription.actions.cancel')}
            </Button>
            <Button 
              onClick={() => setShowCancelDialog(false)}
              variant="outline"
              disabled={isCancelling}
            >
              {t('adminCancelSubscription.actions.cancelDialog')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
