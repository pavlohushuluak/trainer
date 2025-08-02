
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
      <p className="text-muted-foreground">{t('adminUsers.userCard.noSubscriptionData')}</p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span>{t('adminUsers.userCard.status')}:</span>
        <Badge variant={user.subscription.subscribed ? "default" : "secondary"}>
          {user.subscription.subscribed ? t('adminUsers.userCard.active') : t('adminUsers.userCard.inactive')}
        </Badge>
      </div>
      
      {user.subscription.subscription_tier && (
        <div className="flex items-center justify-between">
          <span>{t('adminUsers.userCard.plan')}:</span>
          <Badge variant="outline">{user.subscription.subscription_tier}</Badge>
        </div>
      )}
      
      {user.subscription.country && (
        <div className="flex items-center justify-between">
          <span>{t('adminUsers.userCard.country')}:</span>
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {user.subscription.country}
          </div>
        </div>
      )}
      
      {user.subscription.last_activity && (
        <div className="flex items-center justify-between">
          <span>{t('adminUsers.userCard.lastActivity')}:</span>
          <div className="flex items-center gap-1">
            <Activity className="h-4 w-4" />
            {new Date(user.subscription.last_activity).toLocaleDateString()}
          </div>
        </div>
      )}

      {user.subscription.trial_end && (
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {t('adminUsers.userCard.trialEnds')}:
          </span>
          <span className="text-sm">
            {new Date(user.subscription.trial_end).toLocaleDateString('de-DE')}
          </span>
        </div>
      )}
      
      {user.subscription.subscription_end && (
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {t('adminUsers.userCard.subscriptionEnds')}:
          </span>
          <span className="text-sm">
            {new Date(user.subscription.subscription_end).toLocaleDateString('de-DE')}
          </span>
        </div>
      )}

      {user.subscription.is_manually_activated && (
        <div className="flex items-center justify-between">
          <span>{t('adminUsers.userCard.manuallyActivated')}:</span>
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            {t('adminUsers.userCard.yes')}
          </Badge>
        </div>
      )}

      {user.subscription.admin_notes && (
        <div className="flex items-center justify-between">
          <span>{t('adminUsers.userCard.adminNotes')}:</span>
          <p className="text-sm">{user.subscription.admin_notes}</p>
        </div>
      )}
    </div>
  );
};
