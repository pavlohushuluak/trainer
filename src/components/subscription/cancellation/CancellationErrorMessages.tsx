
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Clock, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CancellationErrorMessagesProps {
  errorType: 'expired_period' | 'already_cancelled' | 'no_subscription' | 'no_guarantee' | 'general';
  subscriptionStart?: string;
  subscriptionEnd?: string;
}

export const CancellationErrorMessages = ({ 
  errorType, 
  subscriptionStart, 
  subscriptionEnd 
}: CancellationErrorMessagesProps) => {
  const { t } = useTranslation();
  
  const getErrorContent = () => {
    switch (errorType) {
      case 'expired_period':
        const daysSinceStart = subscriptionStart 
          ? Math.floor((Date.now() - new Date(subscriptionStart).getTime()) / (1000 * 60 * 60 * 24))
          : 0;
        
        return {
          icon: <Clock className="h-4 w-4" />,
          title: t('subscription.cancellation.errors.expiredPeriod.title'),
          description: t('subscription.cancellation.errors.expiredPeriod.description', { 
            days: daysSinceStart, 
            endDate: subscriptionEnd ? new Date(subscriptionEnd).toLocaleDateString('de-DE') : t('subscription.cancellation.errors.expiredPeriod.endDate')
          }),
          variant: "default" as const
        };
        
      case 'already_cancelled':
        return {
          icon: <Info className="h-4 w-4" />,
          title: t('subscription.cancellation.errors.alreadyCancelled.title'),
          description: t('subscription.cancellation.errors.alreadyCancelled.description'),
          variant: "default" as const
        };
        
      case 'no_subscription':
        return {
          icon: <AlertTriangle className="h-4 w-4" />,
          title: t('subscription.cancellation.errors.noSubscription.title'),
          description: t('subscription.cancellation.errors.noSubscription.description'),
          variant: "destructive" as const
        };
        
      case 'no_guarantee':
        return {
          icon: <Info className="h-4 w-4" />,
          title: t('subscription.cancellation.errors.noGuarantee.title'),
          description: t('subscription.cancellation.errors.noGuarantee.description', {
            endDate: subscriptionEnd ? new Date(subscriptionEnd).toLocaleDateString('de-DE') : t('subscription.cancellation.errors.noGuarantee.endDate')
          }),
          variant: "default" as const
        };
        
      default:
        return {
          icon: <AlertTriangle className="h-4 w-4" />,
          title: t('subscription.cancellation.errors.general.title'),
          description: t('subscription.cancellation.errors.general.description'),
          variant: "destructive" as const
        };
    }
  };

  const { icon, title, description, variant } = getErrorContent();

  return (
    <Alert variant={variant} className="mb-4">
      {icon}
      <AlertDescription>
        <div className="font-medium mb-1">{title}</div>
        <div className="text-sm">{description}</div>
      </AlertDescription>
    </Alert>
  );
};
