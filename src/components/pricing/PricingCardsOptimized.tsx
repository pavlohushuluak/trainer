
import { getMonthlyPlans, getSixMonthPlans } from "./planData";
import { PricingPlanCard } from "./PricingPlanCard";
import { useTranslations } from "@/hooks/useTranslations";

interface PricingCardsOptimizedProps {
  isYearly: boolean;
}

export const PricingCardsOptimized = ({ isYearly }: PricingCardsOptimizedProps) => {
  const { t } = useTranslations();
  const plans = isYearly ? getSixMonthPlans(t) : getMonthlyPlans(t);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-6">
        {plans.map((plan) => (
          <PricingPlanCard key={plan.id} plan={plan} />
        ))}
      </div>
    </div>
  );
};
