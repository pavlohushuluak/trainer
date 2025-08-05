
import { Badge } from '@/components/ui/badge';
import { MapPin, Activity, Clock, Calendar, CheckCircle } from 'lucide-react';
import { UserWithDetails } from './types';
import { useTranslation } from 'react-i18next';

interface UserSubscriptionInfoProps {
  user: UserWithDetails;
}

export const UserSubscriptionInfo = ({ user }: UserSubscriptionInfoProps) => {
  const { t } = useTranslation();
  if (!user.subscription) {
    return (
      <p className="text-sm text-muted-foreground">{t('adminUsers.userCard.noSubscriptionData')}</p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <span className="text-sm font-medium">{t('adminUsers.userCard.status')}:</span>
        <Badge variant={user.subscription.subscribed ? "default" : "secondary"} className="w-fit">
          {user.subscription.subscribed ? t('adminUsers.userCard.active') : t('adminUsers.userCard.inactive')}
        </Badge>
      </div>
      
      {user.subscription.subscription_tier && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span className="text-sm font-medium">{t('adminUsers.userCard.plan')}:</span>
          <Badge variant="outline" className="w-fit">{user.subscription.subscription_tier}</Badge>
        </div>
      )}
      
      {user.subscription.country && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span className="text-sm font-medium">{t('adminUsers.userCard.country')}:</span>
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-sm">{user.subscription.country}</span>
          </div>
        </div>
      )}
      
      {user.subscription.last_activity && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span className="text-sm font-medium">{t('adminUsers.userCard.lastActivity')}:</span>
          <div className="flex items-center gap-1">
            <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-sm">{new Date(user.subscription.last_activity).toLocaleDateString()}</span>
          </div>
        </div>
      )}

      {user.subscription.trial_end && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span className="flex items-center gap-1 text-sm font-medium">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
            {t('adminUsers.userCard.trialEnds')}:
          </span>
          <span className="text-sm">
            {new Date(user.subscription.trial_end).toLocaleDateString('de-DE')}
          </span>
        </div>
      )}
      
      {user.subscription.subscription_end && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span className="flex items-center gap-1 text-sm font-medium">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
            {t('adminUsers.userCard.subscriptionEnds')}:
          </span>
          <span className="text-sm">
            {new Date(user.subscription.subscription_end).toLocaleDateString('de-DE')}
          </span>
        </div>
      )}

      {user.subscription.is_manually_activated && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span className="text-sm font-medium">{t('adminUsers.userCard.manuallyActivated')}:</span>
          <Badge variant="outline" className="bg-green-50 text-green-700 w-fit">
            <CheckCircle className="h-3 w-3 mr-1" />
            {t('adminUsers.userCard.yes')}
          </Badge>
        </div>
      )}

      {user.subscription.admin_notes && (
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <span className="text-sm font-medium">{t('adminUsers.userCard.adminNotes')}:</span>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xs sm:max-w-md">{user.subscription.admin_notes}</p>
        </div>
      )}
    </div>
  );
};
