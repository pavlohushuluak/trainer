
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';

interface RegularCancellationCardProps {
  subscriptionEnd?: string;
}

export const RegularCancellationCard = ({ subscriptionEnd }: RegularCancellationCardProps) => {
  const { t, currentLanguage } = useTranslations();
  
  return (
    <Card className="bg-orange-50 border-orange-200">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-5 w-5 text-orange-600" />
          <span className="font-medium text-orange-800">{t('subscription.cancellation.regularCancellation.title')}</span>
        </div>
        <p className="text-sm text-orange-700 mb-3">
          {t('subscription.cancellation.regularCancellation.description')}
        </p>
        <div className="bg-white p-2 rounded border border-orange-300">
          <p className="text-xs text-orange-600">
            {t('subscription.cancellation.regularCancellation.accessUntil')}: {subscriptionEnd ? new Date(subscriptionEnd).toLocaleDateString(currentLanguage === 'en' ? 'en-US' : 'de-DE') : t('subscription.cancellation.regularCancellation.expiryDate')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
