
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
      <div className="mt-6 sm:mt-8 subscription-management-section">
        <Card className="shadow-sm border-red-200 bg-red-50">
          <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <CardTitle className="text-red-800 text-lg sm:text-xl">{t('training.subscriptionManagement.error.title')}</CardTitle>
            </div>
            <CardDescription className="text-red-700 text-sm">
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
      <div className="mt-6 sm:mt-8 subscription-management-section">
        <Card className="shadow-sm border-gray-100">
          <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500 flex-shrink-0" />
              <CardTitle className="text-lg sm:text-xl">{t('training.subscriptionManagement.title')}</CardTitle>
            </div>
            <CardDescription className="flex items-center gap-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
              {t('training.subscriptionManagement.loading')}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="mt-6 sm:mt-8 subscription-management-section">
      <Card className="shadow-sm border-gray-100">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className={`cursor-pointer hover:bg-muted/50 transition-colors rounded-t-lg px-4 sm:px-6 py-4 sm:py-6 ${isOpen? null : 'rounded-b-lg'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                  <CardTitle className="text-lg sm:text-xl">{t('training.subscriptionManagement.title')}</CardTitle>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  {hasActiveSubscription && subscriptionTierName && (
                    <div className="flex items-start sm:items-center gap-2 w-full sm:w-auto">
                      <span className={`text-xs sm:text-sm px-2 py-1 rounded-full whitespace-nowrap ${
                        isExpired 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {subscriptionTierName} {isExpired ? t('training.subscriptionManagement.expired') : t('training.subscriptionManagement.active')}
                      </span>
                      {tierLimit && tierLimit > 1 && (
                        <span className="text-xs sm:text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center gap-1 whitespace-nowrap">
                          <Users className="h-3 w-3 flex-shrink-0" />
                          {tierLimit === 999 ? '♾️' : tierLimit} {t('training.subscriptionManagement.animals')}
                        </span>
                      )}
                    </div>
                  )}
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                </div>
              </div>
              <CardDescription className="text-sm">
                {hasActiveSubscription 
                  ? `${t('training.subscriptionManagement.currentPlan')}: ${subscriptionTierName}${tierLimit ? ` (${tierLimit} ${t('training.subscriptionManagement.animals')})` : ''}${isExpired ? ` - ${t('training.subscriptionManagement.expired')}` : ''}`
                  : t('training.subscriptionManagement.description')
                }
              </CardDescription>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="px-4 sm:px-6 py-4 sm:py-6">
              <SubscriptionManager />
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
};
