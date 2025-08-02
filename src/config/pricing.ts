export interface PricingPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  halfYearlyPrice: number;
  tierLimit: number;
  features: string[];
  popular?: boolean;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'plan1',
    name: '1 Tier',
    monthlyPrice: 9.90,
    halfYearlyPrice: 59.40,
    tierLimit: 1,
    features: [
      'Unbegrenzter Chat mit KI-Trainer',
      'Individuelle Trainingspläne',
      'Bildanalyse für Verhaltenserkennung',
      'Fortschrittsverfolgung',
      '7 Tage kostenlose Testphase'
    ]
  },
  {
    id: 'plan2',
    name: '2 Tiere',
    monthlyPrice: 14.90,
    halfYearlyPrice: 74.50,
    tierLimit: 2,
    features: [
      'Alles aus Plan 1',
      'Bis zu 2 Tiere verwalten',
      'Individuelle Pläne pro Tier',
      'Vergleichende Fortschrittsanalyse'
    ]
  },
  {
    id: 'plan3',
    name: '3-4 Tiere',
    monthlyPrice: 19.90,
    halfYearlyPrice: 99.50,
    tierLimit: 4,
    popular: true,
    features: [
      'Alles aus Plan 2',
      'Bis zu 4 Tiere verwalten',
      'Gruppentraining-Features',
      'Erweiterte Analysen'
    ]
  },
  {
    id: 'plan4',
    name: '5-8 Tiere',
    monthlyPrice: 29.90,
    halfYearlyPrice: 149.50,
    tierLimit: 8,
    features: [
      'Alles aus Plan 3',
      'Bis zu 8 Tiere verwalten',
      'Professionelle Trainingswerkzeuge',
      'Detaillierte Berichte'
    ]
  },
  {
    id: 'plan5',
    name: 'Unbegrenzt',
    monthlyPrice: 49.90,
    halfYearlyPrice: 249.50,
    tierLimit: 999,
    features: [
      'Alles aus Plan 4',
      'Unbegrenzte Anzahl Tiere',
      'Enterprise-Features',
      'Prioritäts-Support'
    ]
  }
];

export const getPlanById = (id: string): PricingPlan | undefined => {
  return PRICING_PLANS.find(plan => plan.id === id);
};

export const getPriceType = (planId: string, isHalfYearly: boolean): string => {
  return `${planId}-${isHalfYearly ? 'halfyearly' : 'monthly'}`;
};

export const getPrice = (planId: string, isHalfYearly: boolean): number => {
  const plan = getPlanById(planId);
  if (!plan) return 0;
  return isHalfYearly ? plan.halfYearlyPrice : plan.monthlyPrice;
};

export const getSavings = (planId: string): number => {
  const plan = getPlanById(planId);
  if (!plan) return 0;
  const monthlyTotal = plan.monthlyPrice * 6;
  const savings = monthlyTotal - plan.halfYearlyPrice;
  return Math.round((savings / monthlyTotal) * 100);
}; 