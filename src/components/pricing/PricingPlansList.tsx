
import { PricingPlanCard } from "./PricingPlanCard";
import { useTranslation } from "react-i18next";

interface PricingPlanOld {
  id: string;
  name: string;
  monthlyPrice: string;
  sixMonthPrice: string;
  tierLimit: string;
  description: string;
  popular?: boolean;
}

interface PricingPlansListProps {
  plans: PricingPlanOld[];
  isYearly: boolean;
  selectedPlan: string;
  onPlanSelect: (planId: string) => void;
}

export const PricingPlansList = ({ plans, isYearly, selectedPlan, onPlanSelect }: PricingPlansListProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <div key={plan.id} className="p-4 border rounded-lg">
          <h3>{plan.name}</h3>
          <p>{t('pricing.price')}: {isYearly ? plan.sixMonthPrice : plan.monthlyPrice}</p>
          <p>{plan.description}</p>
          <button 
            onClick={() => onPlanSelect(plan.id)}
            className={selectedPlan === plan.id ? "bg-blue-500 text-white p-2 rounded" : "bg-gray-200 p-2 rounded"}
          >
            {t('pricing.selectPlan')}
          </button>
        </div>
      ))}
    </div>
  );
};
