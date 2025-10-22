
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Crown, ChevronDown, ChevronUp, Clock, Users, Loader2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import SubscriptionManager from '@/components/SubscriptionManager';
import { useTranslations } from '@/hooks/useTranslations';

export const SubscriptionManagementSection = () => {
  const { t, currentLanguage } = useTranslations();
  const { 
    hasActiveSubscription, 
    subscription, 
    isLoading, 
    subscriptionTierName, 
    tierLimit, 
    isExpired,
    subscriptionMode,
    isTrialing,
    trialEndDate, // Calculated trial end date (trial_start + 7 days)
    error 
  } = useSubscriptionStatus();
  const [isOpen, setIsOpen] = useState(false);
  
  // Calculate trial end from trial_start + 7 days
  const trialEnd = trialEndDate ? new Date(trialEndDate) : null;
  const isTrialActive = subscriptionMode === 'trial';
  const isTrialExpired = subscriptionMode === 'trial_expired';
  
  // For display: show expired only if it's actually expired (not active trial)
  const showAsExpired = isExpired && !isTrialActive;

  // Update isOpen state when subscription status changes
  useEffect(() => {
    if (!isLoading) {
      setIsOpen(!hasActiveSubscription);
    }
  }, [hasActiveSubscription, isLoading]);

  // Show error state if there's an error
  if (error) {
    return (
      <div id="subscription" className="mt-4 sm:mt-6 lg:mt-8 subscription-management-section">
        <Card className="shadow-sm border-red-200/50 bg-red-50/50 dark:border-red-400/30 dark:bg-red-950/20">
          <CardHeader className="px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-6">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 dark:text-red-400 flex-shrink-0" />
              <CardTitle className="text-red-800 dark:text-red-200 text-base sm:text-lg lg:text-xl truncate">{t('training.subscriptionManagement.error.title')}</CardTitle>
            </div>
            <CardDescription className="text-red-700 dark:text-red-300 text-xs sm:text-sm mt-1.5 sm:mt-2">
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
      <div id="subscription" className="mt-4 sm:mt-6 lg:mt-8 subscription-management-section">
        <Card className="shadow-sm border-gray-100 dark:border-gray-800">
          <CardHeader className="px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-6">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 flex-shrink-0" />
              <CardTitle className="text-base sm:text-lg lg:text-xl truncate">{t('training.subscriptionManagement.title')}</CardTitle>
            </div>
            <CardDescription className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm mt-1.5 sm:mt-2">
              <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin flex-shrink-0" />
              {t('training.subscriptionManagement.loading')}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div id="subscription" className="mt-4 sm:mt-6 lg:mt-8 subscription-management-section">
      <Card className="card-enhanced shadow-lg border-border/50 bg-gradient-to-br from-white via-yellow-50/30 to-orange-50/30 dark:from-gray-900 dark:via-yellow-900/20 dark:to-orange-900/20 overflow-hidden">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader 
              className={`header-enhanced bg-gradient-to-r from-yellow-100/80 dark:from-yellow-900/40 via-orange-100/80 dark:via-orange-900/40 to-yellow-100/80 dark:to-yellow-900/40 rounded-t-lg ${isOpen ? null : 'rounded-b-lg'} cursor-pointer transition-all duration-300 ease-out group px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-5 touch-manipulation`}
              aria-label={isOpen ? t('training.subscriptionManagement.collapseDetails') : t('training.subscriptionManagement.expandDetails')}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg flex-shrink-0">
                    <Crown className="h-4 w-4 sm:h-4.5 sm:w-4.5 lg:h-5 lg:w-5 text-white" />
                  </div>
                  <CardTitle className="text-base sm:text-lg lg:text-xl font-semibold text-yellow-900 dark:text-yellow-100 truncate">{t('training.subscriptionManagement.title')}</CardTitle>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-2 self-start sm:self-auto">
                  {hasActiveSubscription && subscriptionTierName && (
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
                      <span className={`text-[10px] sm:text-xs lg:text-sm px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full whitespace-nowrap ${
                        showAsExpired 
                          ? 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-300' 
                          : isTrialActive
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-300'
                          : 'bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-300'
                      }`}>
                        {subscriptionTierName} {showAsExpired ? t('training.subscriptionManagement.expired') : isTrialActive ? t('subscription.trial') : t('training.subscriptionManagement.active')}
                      </span>
                      {tierLimit && tierLimit > 1 && (
                        <span className="text-[10px] sm:text-xs lg:text-sm bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-300 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full flex items-center gap-1 whitespace-nowrap">
                          <Users className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
                          <span className="hidden xs:inline">{tierLimit === 999 ? t('training.subscriptionManagement.unlimitedAnimals') : tierLimit} {t('training.subscriptionManagement.animals')}</span>
                          <span className="xs:hidden">{tierLimit === 999 ? '∞' : tierLimit}</span>
                        </span>
                      )}
                    </div>
                  )}
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 dark:text-yellow-300 transition-all duration-300 ease-out group-hover:scale-110 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 dark:text-yellow-300 transition-all duration-300 ease-out group-hover:scale-110 flex-shrink-0" />
                  )}
                </div>
              </div>
              <CardDescription className="text-yellow-700 dark:text-yellow-300 text-xs sm:text-sm lg:text-base mt-1.5 sm:mt-2 font-medium leading-relaxed">
                {hasActiveSubscription 
                  ? (() => {
                      const planName = subscriptionTierName;
                      const status = showAsExpired 
                        ? t('training.subscriptionManagement.expired') 
                        : isTrialActive 
                        ? t('subscription.trial')
                        : t('training.subscriptionManagement.active');
                      
                      if (tierLimit && tierLimit > 1) {
                        if (showAsExpired) {
                          return t('training.subscriptionManagement.planWithLimitAndStatus', {
                            plan: planName,
                            limit: tierLimit === 999 ? t('training.subscriptionManagement.unlimitedAnimals') : tierLimit,
                            animals: t('training.subscriptionManagement.animals'),
                            status: status
                          });
                        } else if (isTrialActive) {
                          // Show trial with end date
                          const trialEndDate = trialEnd ? trialEnd.toLocaleDateString(currentLanguage === 'de' ? 'de-DE' : 'en-US') : '';
                          return t('training.subscriptionManagement.trialWithLimit', {
                            plan: planName,
                            limit: tierLimit === 999 ? t('training.subscriptionManagement.unlimitedAnimals') : tierLimit,
                            animals: t('training.subscriptionManagement.animals'),
                            endDate: trialEndDate
                          });
                        } else {
                          return t('training.subscriptionManagement.planWithLimit', {
                            plan: planName,
                            limit: tierLimit === 999 ? t('training.subscriptionManagement.unlimitedAnimals') : tierLimit,
                            animals: t('training.subscriptionManagement.animals')
                          });
                        }
                      } else {
                        if (showAsExpired) {
                          return t('training.subscriptionManagement.planWithStatus', {
                            plan: planName,
                            status: status
                          });
                        } else if (isTrialActive) {
                          // Show trial with end date
                          const trialEndDate = trialEnd ? trialEnd.toLocaleDateString(currentLanguage === 'de' ? 'de-DE' : 'en-US') : '';
                          return t('training.subscriptionManagement.trialPlan', {
                            plan: planName,
                            endDate: trialEndDate
                          });
                        } else {
                          return `${t('training.subscriptionManagement.currentPlan')}: ${planName}`;
                        }
                      }
                    })()
                  : t('training.subscriptionManagement.description')
                }
              </CardDescription>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent className="animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden">
            <CardContent className="py-3 sm:p-4 lg:p-6 xl:p-8 bg-gradient-to-br from-white/50 to-yellow-50/30 dark:from-gray-900/50 dark:to-yellow-900/10">
              <div className="animate-fade-in-up">
                <SubscriptionManager />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
};
