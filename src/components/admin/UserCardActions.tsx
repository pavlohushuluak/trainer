
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings, Trash2 } from 'lucide-react';
import { UserWithDetails } from './types';
import { CancelSubscriptionDialog } from './CancelSubscriptionDialog';
import { differenceInDays } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface UserCardActionsProps {
  user: UserWithDetails;
  onActivate: (userId: string) => void;
  onDeactivate: (userId: string) => void;
  onSetTrial: (userId: string, trialDays: string) => void;
  onToggleTestUser: (userId: string, isTestUser: boolean) => void;
  onDelete: (userId: string) => void;
  onCancelSubscription: (userId: string, immediateRefund: boolean) => void;
  onShowDetails: (user: UserWithDetails) => void;
  isActivating: boolean;
  isDeactivating: boolean;
  isSettingTrial: boolean;
  isTogglingTestUser: boolean;
  isDeleting: boolean;
  isCancelling: boolean;
}

export const UserCardActions = ({
  user,
  onActivate,
  onDeactivate,
  onSetTrial,
  onToggleTestUser,
  onDelete,
  onCancelSubscription,
  onShowDetails,
  isActivating,
  isDeactivating,
  isSettingTrial,
  isTogglingTestUser,
  isDeleting,
  isCancelling
}: UserCardActionsProps) => {
  const { t } = useTranslation();
  const [trialDays, setTrialDays] = useState('7');

  const isWithinMoneyBackPeriod = user.subscription?.subscription_status !== 'trialing' && user.subscription?.current_period_start
    ? differenceInDays(new Date(), new Date(user.subscription.current_period_start)) < 14
    : false;

  const handleActivate = () => {
    onActivate(user.id);
  };

  const handleDeactivate = () => {
    onDeactivate(user.id);
  };

  const handleSetTrial = () => {
    onSetTrial(user.id, trialDays);
  };

  const handleToggleTestUser = () => {
    onToggleTestUser(user.id, !user.subscription?.is_test_user);
  };

  const handleDelete = () => {
    onDelete(user.id);
  };

  return (
    <div className="space-y-3 pt-4">
      {/* Primary actions row */}
      <div className="flex flex-col sm:flex-row gap-2">
        {!user.subscription?.subscribed ? (
          <Button 
            size="sm" 
            onClick={handleActivate} 
            disabled={isActivating}
            className="w-full sm:w-auto"
          >
            {t('adminUsers.userActions.activate')}
          </Button>
        ) : (
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={handleDeactivate}
            disabled={isDeactivating}
            className="w-full sm:w-auto"
          >
            {t('adminUsers.userActions.deactivate')}
          </Button>
        )}

        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="w-full sm:w-auto">
              <Settings className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">{t('adminUsers.userActions.trialPeriod')}</span>
              <span className="sm:hidden">{t('adminUsers.userActions.trialPeriod')}</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-sm sm:text-base">{t('adminUsers.userActions.setTrialPeriod')}</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                {t('adminUsers.userActions.setTrialFor')} {user.email}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <label htmlFor="trialDays" className="text-sm sm:text-right">
                  {t('adminUsers.userActions.days')}:
                </label>
                <Select
                  value={trialDays}
                  onValueChange={setTrialDays}
                >
                  <SelectTrigger className="col-span-1 sm:col-span-3">
                    <SelectValue placeholder={t('adminUsers.userActions.selectDays')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">{t('adminUsers.userActions.trialDays.7')}</SelectItem>
                    <SelectItem value="14">{t('adminUsers.userActions.trialDays.14')}</SelectItem>
                    <SelectItem value="30">{t('adminUsers.userActions.trialDays.30')}</SelectItem>
                    <SelectItem value="60">{t('adminUsers.userActions.trialDays.60')}</SelectItem>
                    <SelectItem value="90">{t('adminUsers.userActions.trialDays.90')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" onClick={handleSetTrial} disabled={isSettingTrial} className="w-full sm:w-auto">
              {t('adminUsers.userActions.save')}
            </Button>
          </DialogContent>
        </Dialog>

        <Button 
          size="sm" 
          variant="outline"
          onClick={handleToggleTestUser}
          disabled={isTogglingTestUser}
          className="w-full sm:w-auto"
        >
          <span className="hidden sm:inline">
            {user.subscription?.is_test_user ? t('adminUsers.userActions.removeTestUser') : t('adminUsers.userActions.markAsTestUser')}
          </span>
          <span className="sm:hidden">
            {user.subscription?.is_test_user ? t('adminUsers.userActions.removeTestUser') : t('adminUsers.userActions.markAsTestUser')}
          </span>
        </Button>
      </div>

      {/* Secondary actions row */}
      <div className="flex flex-col sm:flex-row gap-2">
        <CancelSubscriptionDialog
          user={user}
          isWithinMoneyBackPeriod={isWithinMoneyBackPeriod}
          onCancelSubscription={onCancelSubscription}
          isCancelling={isCancelling}
        />

        <Button 
          size="sm" 
          variant="ghost"
          onClick={() => onShowDetails(user)}
          className="w-full sm:w-auto"
        >
          <Settings className="h-3 w-3 mr-1" />
          <span className="hidden sm:inline">{t('adminUsers.userActions.details')}</span>
          <span className="sm:hidden">{t('adminUsers.userActions.details')}</span>
        </Button>

        <Button 
          size="sm" 
          variant="ghost"
          onClick={handleDelete}
          disabled={isDeleting}
          className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-3 w-3 mr-1" />
          <span className="hidden sm:inline">{t('adminUsers.userActions.delete')}</span>
          <span className="sm:hidden">{t('adminUsers.userActions.delete')}</span>
        </Button>
      </div>
    </div>
  );
};
