
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Crown, ChevronDown, ChevronUp, Clock, Users, Loader2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import SubscriptionManager from '@/components/SubscriptionManager';
import { useTranslation } from 'react-i18next';

export const SubscriptionManagementSection = () => {
  const { t } = useTranslation();
  const { 
    hasActiveSubscription, 
    subscription, 
    isLoading, 
    subscriptionTierName, 
    tierLimit, 
    isExpired,
    error 
  } = useSubscriptionStatus();
  const [isOpen, setIsOpen] = useState(false);

  // Update isOpen state when subscription status changes
  useEffect(() => {
    if (!isLoading) {
      setIsOpen(!hasActiveSubscription);
    }
  }, [hasActiveSubscription, isLoading]);

  // Show error state if there's an error
  if (error) {
    return (
      <div className="mt-8 subscription-management-section">
        <Card className="shadow-sm border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <CardTitle className="text-red-800">{t('training.subscriptionManagement.error.title')}</CardTitle>
            </div>
            <CardDescription className="text-red-700">
              {t('training.subscriptionManagement.error.description')}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Show loading state while subscription data is being fetched
  if (isLoading) {
    return (
      <div className="mt-8 subscription-management-section">
        <Card className="shadow-sm border-gray-100">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              <CardTitle>{t('training.subscriptionManagement.title')}</CardTitle>
            </div>
            <CardDescription>
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('training.subscriptionManagement.loading')}
              </div>
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="mt-8 subscription-management-section">
      <Card className="shadow-sm border-gray-100">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className={`cursor-pointer hover:bg-muted/50 transition-colors rounded-t-lg ${isOpen? null : 'rounded-b-lg'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  <CardTitle>{t('training.subscriptionManagement.title')}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  {hasActiveSubscription && subscriptionTierName && (
                    <div className="flex items-center gap-2">
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        isExpired 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {subscriptionTierName} {isExpired ? t('training.subscriptionManagement.expired') : t('training.subscriptionManagement.active')}
                      </span>
                      {tierLimit && tierLimit > 1 && (
                        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {tierLimit === 999 ? '♾️' : tierLimit} {t('training.subscriptionManagement.animals')}
                        </span>
                      )}
                    </div>
                  )}
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>
              <CardDescription>
                {hasActiveSubscription 
                  ? `${t('training.subscriptionManagement.currentPlan')}: ${subscriptionTierName}${tierLimit ? ` (${tierLimit} ${t('training.subscriptionManagement.animals')})` : ''}${isExpired ? ` - ${t('training.subscriptionManagement.expired')}` : ''}`
                  : t('training.subscriptionManagement.description')
                }
              </CardDescription>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <SubscriptionManager />
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
};
