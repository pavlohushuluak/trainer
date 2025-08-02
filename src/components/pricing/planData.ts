
export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  originalPrice?: string;
  savings?: string;
  maxPets: number;
  features: string[];
  isPopular: boolean;
}

// Utility function to check if a plan has money-back guarantee
export const hasMoneyBackGuarantee = (planId: string): boolean => {
  return planId === "1-tier-monthly" || planId === "1-tier-sixmonth";
};

// Helper function to get features for a plan based on guarantee eligibility
const getPlanFeatures = (planId: string, baseFeatures: string[], t: (key: string) => string): string[] => {
  const features = [...baseFeatures];
  if (hasMoneyBackGuarantee(planId)) {
    features.push(t('pricing.planCard.guarantee'));
  }
  return features;
};

export const getMonthlyPlans = (t: (key: string) => string): PricingPlan[] => [
  {
    id: "1-tier-monthly",
    name: t('pricing.plans.names.onePet'),
    price: "9,90€",
    period: t('pricing.plans.periods.month'),
    maxPets: 1,
    features: getPlanFeatures("1-tier-monthly", [
      t('pricing.plans.features.unlimitedConsultation'),
      t('pricing.plans.features.unlimitedImageAnalysis'),
      t('pricing.plans.features.onePetProfile')
    ], t),
    isPopular: false
  },
  {
    id: "2-tier-monthly", 
    name: t('pricing.plans.names.twoPets'),
    price: "14,90€",
    period: t('pricing.plans.periods.month'),
    maxPets: 2,
    features: getPlanFeatures("2-tier-monthly", [
      t('pricing.plans.features.unlimitedConsultation'),
      t('pricing.plans.features.unlimitedImageAnalysis'),
      t('pricing.plans.features.twoPetProfiles')
    ], t),
    isPopular: false
  },
  {
    id: "3-4-tier-monthly",
    name: t('pricing.plans.names.threeFourPets'), 
    price: "19,90€",
    period: t('pricing.plans.periods.month'),
    maxPets: 4,
    features: getPlanFeatures("3-4-tier-monthly", [
      t('pricing.plans.features.unlimitedConsultation'),
      t('pricing.plans.features.unlimitedImageAnalysis'),
      t('pricing.plans.features.upToFourPetProfiles')
    ], t),
    isPopular: true
  },
  {
    id: "5-8-tier-monthly",
    name: t('pricing.plans.names.fiveEightPets'),
    price: "29,90€", 
    period: t('pricing.plans.periods.month'),
    maxPets: 8,
    features: getPlanFeatures("5-8-tier-monthly", [
      t('pricing.plans.features.unlimitedConsultation'),
      t('pricing.plans.features.unlimitedImageAnalysis'),
      t('pricing.plans.features.upToEightPetProfiles')
    ], t),
    isPopular: false
  },
  {
    id: "unlimited-tier-monthly",
    name: t('pricing.plans.names.unlimited'),
    price: "49,90€",
    period: t('pricing.plans.periods.month'), 
    maxPets: 999,
    features: getPlanFeatures("unlimited-tier-monthly", [
      t('pricing.plans.features.unlimitedConsultation'),
      t('pricing.plans.features.unlimitedImageAnalysis'),
      t('pricing.plans.features.unlimitedPetProfiles'),
      t('pricing.plans.features.prioritySupport')
    ], t),
    isPopular: false
  }
];

export const getSixMonthPlans = (t: (key: string) => string): PricingPlan[] => [
  {
    id: "1-tier-sixmonth",
    name: t('pricing.plans.names.onePet'),
    price: "59,40€",
    period: t('pricing.plans.periods.sixMonths'),
    originalPrice: "59,40€",
    savings: "0€",
    maxPets: 1,
    features: getPlanFeatures("1-tier-sixmonth", [
      t('pricing.plans.features.unlimitedConsultation'),
      t('pricing.plans.features.unlimitedImageAnalysis'),
      t('pricing.plans.features.onePetProfile')
    ], t),
    isPopular: false
  },
  {
    id: "2-tier-sixmonth", 
    name: t('pricing.plans.names.twoPets'),
    price: "74,50€",
    period: t('pricing.plans.periods.sixMonths'),
    originalPrice: "89,40€",
    savings: "14,90€",
    maxPets: 2,
    features: getPlanFeatures("2-tier-sixmonth", [
      t('pricing.plans.features.unlimitedConsultation'),
      t('pricing.plans.features.unlimitedImageAnalysis'),
      t('pricing.plans.features.twoPetProfiles')
    ], t),
    isPopular: false
  },
  {
    id: "3-4-tier-sixmonth",
    name: t('pricing.plans.names.threeFourPets'), 
    price: "99,50€",
    period: t('pricing.plans.periods.sixMonths'),
    originalPrice: "119,40€",
    savings: "19,90€",
    maxPets: 4,
    features: getPlanFeatures("3-4-tier-sixmonth", [
      t('pricing.plans.features.unlimitedConsultation'),
      t('pricing.plans.features.unlimitedImageAnalysis'),
      t('pricing.plans.features.upToFourPetProfiles')
    ], t),
    isPopular: true
  },
  {
    id: "5-8-tier-sixmonth",
    name: t('pricing.plans.names.fiveEightPets'),
    price: "149,50€", 
    period: t('pricing.plans.periods.sixMonths'),
    originalPrice: "179,40€",
    savings: "29,90€",
    maxPets: 8,
    features: getPlanFeatures("5-8-tier-sixmonth", [
      t('pricing.plans.features.unlimitedConsultation'),
      t('pricing.plans.features.unlimitedImageAnalysis'),
      t('pricing.plans.features.upToEightPetProfiles')
    ], t),
    isPopular: false
  },
  {
    id: "unlimited-tier-sixmonth",
    name: t('pricing.plans.names.unlimited'),
    price: "249,50€",
    period: t('pricing.plans.periods.sixMonths'), 
    originalPrice: "299,40€",
    savings: "49,90€",
    maxPets: 999,
    features: getPlanFeatures("unlimited-tier-sixmonth", [
      t('pricing.plans.features.unlimitedConsultation'),
      t('pricing.plans.features.unlimitedImageAnalysis'),
      t('pricing.plans.features.unlimitedPetProfiles'),
      t('pricing.plans.features.prioritySupport')
    ], t),
    isPopular: false
  }
];
