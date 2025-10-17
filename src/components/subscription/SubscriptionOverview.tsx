
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Crown, Calendar, Clock } from "lucide-react";
import { CancellationMoneyBackFlow } from "./CancellationMoneyBackFlow";
import { MoneyBackStatus } from "./MoneyBackStatus";
import { useTranslation } from "react-i18next";

interface SubscriptionStatus {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
  subscription_status?: string;
  trial_end?: string;
  cancel_at_period_end?: boolean;
  billing_cycle?: string;
  current_period_start?: string;
}

interface SubscriptionOverviewProps {
  subscription: SubscriptionStatus;
  onManageSubscription: () => void;
}

export const SubscriptionOverview = ({ subscription, onManageSubscription }: SubscriptionOverviewProps) => {
  const { t } = useTranslation();
  const [isCancellationFlowOpen, setIsCancellationFlowOpen] = useState(false);
  
  const isTrialing = subscription.subscription_status === 'trialing';
  const trialEndsAt = subscription.trial_end ? new Date(subscription.trial_end) : null;
  
  // Check if trial has expired
  const now = new Date();
  const isTrialExpired = isTrialing && trialEndsAt && trialEndsAt < now;
  
  // Get formatted tier name
  const getTierDisplayName = (tier?: string) => {
    switch (tier) {
      case 'plan1': return t('subscription.modeDisplay.onePet');
      case 'plan2': return t('subscription.modeDisplay.twoPets');
      case 'plan3': return t('subscription.modeDisplay.threeFourPets');
      case 'plan4': return t('subscription.modeDisplay.fiveEightPets');
      case 'plan5': return t('subscription.modeDisplay.unlimited');
      default: return tier || t('subscription.overview.plan');
    }
  };

  const handleCancelSubscription = async () => {
    setIsCancellationFlowOpen(false);
    
    // Delay reload to ensure cancellation is processed
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  return (
    <>
      {/* Geld-zurück-Garantie Status */}
      <MoneyBackStatus 
        subscriptionStart={subscription.current_period_start}
        isTrialing={isTrialing}
      />

      <Card>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="subscription" className="border-none">
            <CardHeader>
              <AccordionTrigger className="hover:no-underline p-0">
                <div className="flex items-center gap-2 text-left">
                  <Crown className="h-5 w-5" />
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {t('subscription.overview.currentStatus')}
                    </CardTitle>
                    <CardDescription>
                      {t('subscription.overview.currentStatusDescription')}
                    </CardDescription>
                  </div>
                </div>
              </AccordionTrigger>
            </CardHeader>
            
            <AccordionContent>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>{t('subscription.overview.status')}:</span>
                    <Badge variant={subscription.subscribed && !isTrialExpired ? "default" : "secondary"}>
                      {isTrialExpired ? t('subscription.overview.inactive') : isTrialing ? t('subscription.overview.sevenDayTrial') : subscription.subscribed ? t('subscription.overview.active') : t('subscription.overview.inactive')}
                    </Badge>
                  </div>
                  
                  {subscription.subscription_tier && !isTrialExpired && (
                    <div className="flex items-center justify-between">
                      <span>{t('subscription.overview.plan')}:</span>
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getTierDisplayName(subscription.subscription_tier)}
                        {isTrialing && <span className="text-xs text-muted-foreground ml-1">({t('subscription.trial')})</span>}
                      </Badge>
                    </div>
                  )}
                  
                  {subscription.billing_cycle && (
                    <div className="flex items-center justify-between">
                      <span>{t('subscription.overview.billing')}:</span>
                      <span className="text-sm capitalize">
                        {subscription.billing_cycle === 'year' ? t('subscription.overview.yearly') : t('subscription.overview.monthly')}
                      </span>
                    </div>
                  )}
                  
                  {isTrialing && trialEndsAt && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {t('subscription.overview.trialEnds')}:
                      </span>
                      <span className="text-sm">
                        {trialEndsAt.toLocaleDateString('de-DE')}
                      </span>
                    </div>
                  )}
                  
                  {subscription.subscription_end && !isTrialing && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {subscription.cancel_at_period_end ? t('subscription.overview.expires') : t('subscription.overview.renews')}:
                      </span>
                      <span className="text-sm">
                        {new Date(subscription.subscription_end).toLocaleDateString('de-DE')}
                      </span>
                    </div>
                  )}
                  
                  {subscription.cancel_at_period_end && (
                    <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
                      ⚠️ {t('subscription.overview.cancellationWarning')}
                    </div>
                  )}
                  
                  {isTrialExpired && (
                    <div className="text-sm text-blue-600 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400 p-3 rounded border border-blue-200 dark:border-blue-800">
                      ℹ️ {t('subscription.trialExpiredMessage', 'Your trial has ended. Upgrade to continue using premium features.')}
                    </div>
                  )}
                </div>
                
                {subscription.subscribed && !subscription.cancel_at_period_end && !isTrialExpired && (
                  <div className="mt-6 space-y-3">
                    {/* "Subscription verwalten" Button temporär ausgeblendet */}
                    {/* <Button onClick={onManageSubscription} variant="outline" className="w-full">
                      {t('subscription.overview.manageSubscription')}
                    </Button> */}
                    
                    {/* Dezenter Kündigungslink */}
                    <div className="text-center">
                      <button 
                        onClick={() => setIsCancellationFlowOpen(true)}
                        className="text-sm text-gray-500 underline hover:text-gray-700 transition-colors"
                      >
                        {t('subscription.overview.cancelSubscription')}
                      </button>
                    </div>
                  </div>
                )}
              </CardContent>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>

      <CancellationMoneyBackFlow
        isOpen={isCancellationFlowOpen}
        onClose={() => setIsCancellationFlowOpen(false)}
        onCancelSubscription={handleCancelSubscription}
        subscriptionStart={subscription.current_period_start}
        subscriptionEnd={subscription.subscription_end}
      />
    </>
  );
};
