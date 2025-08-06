
import { useState } from "react";
import { PricingToggle } from "@/components/pricing/PricingToggle";
import { PlanCard } from "./PlanCard";
import { getMonthlyPlans, getSixMonthPlans, type PricingPlan } from "../pricing/planData";
import { getCurrentPlanId } from "./planUtils";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { usePetLimitChecker } from "./PetLimitChecker";
import { useTranslations } from "@/hooks/useTranslations";

interface SubscriptionStatus {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
  subscription_status?: string;
  trial_end?: string;
  cancel_at_period_end?: boolean;
  billing_cycle?: string;
}

interface SubscriptionPlansProps {
  subscription: SubscriptionStatus;
  checkingOut: boolean;
  onCheckout: (priceType: string) => void;
}

export const SubscriptionPlans = ({ subscription, checkingOut, onCheckout }: SubscriptionPlansProps) => {
  const [isYearly, setIsYearly] = useState(false);
  const { maxPetsAllowed } = usePetLimitChecker();
  const { t } = useTranslations();

  const getPlans = (): PricingPlan[] => {
    const allPlans = isYearly ? getSixMonthPlans(t) : getMonthlyPlans(t);
    
    // Wenn der Nutzer bereits ein Premium-Abonnement hat, nur größere Pakete anzeigen
    if (subscription.subscribed && maxPetsAllowed) {
      return allPlans.filter(plan => {
        // Extrahiere die Anzahl der erlaubten Tiere aus dem Plan
        const planPets = getPlanMaxPets(plan.id);
        return planPets > maxPetsAllowed;
      });
    }
    
    return allPlans;
  };

  // Hilfsfunktion um die maximale Anzahl Tiere aus der Plan-ID zu extrahieren
  const getPlanMaxPets = (planId: string): number => {
    if (planId.includes('unlimited')) return 999;
    if (planId.includes('5-8')) return 8;
    if (planId.includes('3-4')) return 4;
    if (planId.includes('2-tier')) return 2;
    if (planId.includes('1-tier')) return 1;
    return 0;
  };

  const plans = getPlans();
  const currentPlanId = getCurrentPlanId(subscription);

  // Wenn keine Upgrades verfügbar sind
  if (subscription.subscribed && plans.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="mb-4">
          <span className="text-4xl">👑</span>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {t('subscription.maxPlanReached')}
        </h3>
        <p className="text-muted-foreground">
          {t('subscription.maxPlanDescription', { max: maxPetsAllowed === 999 ? t('subscription.unlimited') : maxPetsAllowed })}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PricingToggle isYearly={isYearly} onToggle={setIsYearly} />
      
      {subscription.subscribed && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 mb-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
            📈 {t('subscription.availableUpgrades')}
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-300">
            {maxPetsAllowed === 999 
              ? t('subscription.unlimitedPetSlots')
              : t('subscription.currentPetSlots', { count: maxPetsAllowed })
            }
            {' '}
            {t('subscription.availableUpgradeOptions')}
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlanId === plan.id;
          
          return (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrentPlan={isCurrentPlan}
              checkingOut={checkingOut}
              onCheckout={onCheckout}
              isSubscribed={subscription.subscribed}
              showUpgradeBadge={subscription.subscribed}
            />
          );
        })}
      </div>
    </div>
  );
};
