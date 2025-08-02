
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown } from 'lucide-react';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

export const QuickStatsSidebar = () => {
  const { subscription, hasActiveSubscription } = useSubscriptionStatus();
  const { t } = useTranslation();

  const getSubscriptionEndDate = () => {
    if (!subscription?.subscription_end) return t('dashboard.quickStats.subscription.unknown');
    try {
      return format(new Date(subscription.subscription_end), 'dd.MM.yyyy', { locale: de });
    } catch {
      return t('dashboard.quickStats.subscription.unknown');
    }
  };

  return (
    <div className="space-y-6">
      {/* Training Progress */}
      <Card className="shadow-sm border-gray-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            {t('dashboard.quickStats.today')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{t('dashboard.quickStats.trainingTime')}</span>
            <span className="font-semibold">12 Min</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{t('dashboard.quickStats.pointsCollected')}</span>
            <span className="font-semibold text-yellow-600">+25 ⭐</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{t('dashboard.quickStats.exercises')}</span>
            <span className="font-semibold text-green-600">3 ✅</span>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Info */}
      <Card className="shadow-sm border-gray-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Crown className="h-4 w-4 text-yellow-500" />
            {t('dashboard.quickStats.subscription.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 mb-1">
              {hasActiveSubscription ? (subscription?.subscription_tier || t('dashboard.quickStats.subscription.premium')) : t('dashboard.quickStats.subscription.free')}
            </div>
            <div className="text-sm text-gray-600 mb-3">
              {hasActiveSubscription 
                ? t('dashboard.quickStats.subscription.activeUntil', { date: getSubscriptionEndDate() })
                : t('dashboard.quickStats.subscription.noActiveSubscription')
              }
            </div>
            <Button variant="outline" size="sm" className="w-full">
              {t('dashboard.quickStats.subscription.manage')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
