
export interface PricingConfig {
  name: string;
  nameEn: string;
  amount: number;
  interval: string;
  tierLimit: number;
  minimumCommitment: string;
  minimumCommitmentEn: string;
  description: string;
  descriptionEn: string;
}

export const getPricingConfig = (priceType: string, language: string = 'de'): PricingConfig => {
  // No trials - direct payment only

  switch (priceType) {
    // Plan 1: 1 Tier
    case "plan1-monthly":
      return {
        name: "1 Tier - Monatlich",
        nameEn: "1 Pet - Monthly",
        amount: 990, // 9.90€
        interval: "month",
        tierLimit: 1,
        minimumCommitment: "Monatlich kündbar",
        minimumCommitmentEn: "Cancel monthly",
        description: "Premium Tiertraining für 1 Tier",
        descriptionEn: "Premium pet training for 1 pet"
      };
    case "plan1-halfyearly":
      return {
        name: "1 Tier - 6 Monate",
        nameEn: "1 Pet - 6 Months",
        amount: 5940, // 59.40€
        interval: "month",
        tierLimit: 1,
        minimumCommitment: "6 Monate",
        minimumCommitmentEn: "6 months",
        description: "Premium Tiertraining für 1 Tier - 6 Monate",
        descriptionEn: "Premium pet training for 1 pet - 6 months"
      };
    
    // Plan 2: 2 Tiere
    case "plan2-monthly":
      return {
        name: "2 Tiere - Monatlich",
        nameEn: "2 Pets - Monthly",
        amount: 1490, // 14.90€
        interval: "month",
        tierLimit: 2,
        minimumCommitment: "Monatlich kündbar",
        minimumCommitmentEn: "Cancel monthly",
        description: "Premium Tiertraining für 2 Tiere",
        descriptionEn: "Premium pet training for 2 pets"
      };
    case "plan2-halfyearly":
      return {
        name: "2 Tiere - 6 Monate",
        nameEn: "2 Pets - 6 Months",
        amount: 7450, // 74.50€
        interval: "month",
        tierLimit: 2,
        minimumCommitment: "6 Monate",
        minimumCommitmentEn: "6 months",
        description: "Premium Tiertraining für 2 Tiere - 6 Monate",
        descriptionEn: "Premium pet training for 2 pets - 6 months"
      };
    
    // Plan 3: 3-4 Tiere
    case "plan3-monthly":
      return {
        name: "3-4 Tiere - Monatlich",
        nameEn: "3-4 Pets - Monthly",
        amount: 1990, // 19.90€
        interval: "month",
        tierLimit: 4,
        minimumCommitment: "Monatlich kündbar",
        minimumCommitmentEn: "Cancel monthly",
        description: "Premium Tiertraining für 3-4 Tiere",
        descriptionEn: "Premium pet training for 3-4 pets"
      };
    case "plan3-halfyearly":
      return {
        name: "3-4 Tiere - 6 Monate",
        nameEn: "3-4 Pets - 6 Months",
        amount: 9950, // 99.50€
        interval: "month",
        tierLimit: 4,
        minimumCommitment: "6 Monate",
        minimumCommitmentEn: "6 months",
        description: "Premium Tiertraining für 3-4 Tiere - 6 Monate",
        descriptionEn: "Premium pet training for 3-4 pets - 6 months"
      };
    
    // Plan 4: 5-8 Tiere
    case "plan4-monthly":
      return {
        name: "5-8 Tiere - Monatlich",
        nameEn: "5-8 Pets - Monthly",
        amount: 2990, // 29.90€
        interval: "month",
        tierLimit: 8,
        minimumCommitment: "Monatlich kündbar",
        minimumCommitmentEn: "Cancel monthly",
        description: "Premium Tiertraining für 5-8 Tiere",
        descriptionEn: "Premium pet training for 5-8 pets"
      };
    case "plan4-halfyearly":
      return {
        name: "5-8 Tiere - 6 Monate",
        nameEn: "5-8 Pets - 6 Months",
        amount: 14950, // 149.50€
        interval: "month",
        tierLimit: 8,
        minimumCommitment: "6 Monate",
        minimumCommitmentEn: "6 months",
        description: "Premium Tiertraining für 5-8 Tiere - 6 Monate",
        descriptionEn: "Premium pet training for 5-8 pets - 6 months"
      };
    
    // Plan 5: Unbegrenzt
    case "plan5-monthly":
      return {
        name: "Unbegrenzt - Monatlich",
        nameEn: "Unlimited - Monthly",
        amount: 4990, // 49.90€
        interval: "month",
        tierLimit: 999,
        minimumCommitment: "Monatlich kündbar",
        minimumCommitmentEn: "Cancel monthly",
        description: "Premium Tiertraining unbegrenzt",
        descriptionEn: "Premium pet training unlimited"
      };
    case "plan5-halfyearly":
      return {
        name: "Unbegrenzt - 6 Monate",
        nameEn: "Unlimited - 6 Months",
        amount: 24950, // 249.50€
        interval: "month",
        tierLimit: 999,
        minimumCommitment: "6 Monate",
        minimumCommitmentEn: "6 months",
        description: "Premium Tiertraining unbegrenzt - 6 Monate",
        descriptionEn: "Premium pet training unlimited - 6 months"
      };
    
    // Legacy support for old pricing (backward compatibility)
    case "1-tier-monthly":
      return {
        name: "1 Tier - Monatlich",
        nameEn: "1 Pet - Monthly",
        amount: 990,
        interval: "month",
        tierLimit: 1,
        minimumCommitment: "Monatlich kündbar",
        minimumCommitmentEn: "Cancel monthly",
        description: "Premium Tiertraining für 1 Tier",
        descriptionEn: "Premium pet training for 1 pet"
      };
    case "1-tier-sixmonth":
      return {
        name: "1 Tier - 6 Monate",
        nameEn: "1 Pet - 6 Months",
        amount: 5940,
        interval: "month",
        tierLimit: 1,
        minimumCommitment: "6 Monate",
        minimumCommitmentEn: "6 months",
        description: "Premium Tiertraining für 1 Tier - 6 Monate",
        descriptionEn: "Premium pet training for 1 pet - 6 months"
      };
    case "2-tier-monthly":
      return {
        name: "2 Tiere - Monatlich",
        nameEn: "2 Pets - Monthly",
        amount: 1490,
        interval: "month",
        tierLimit: 2,
        minimumCommitment: "Monatlich kündbar",
        minimumCommitmentEn: "Cancel monthly",
        description: "Premium Tiertraining für 2 Tiere",
        descriptionEn: "Premium pet training for 2 pets"
      };
    case "2-tier-sixmonth":
      return {
        name: "2 Tiere - 6 Monate",
        nameEn: "2 Pets - 6 Months",
        amount: 7450,
        interval: "month",
        tierLimit: 2,
        minimumCommitment: "6 Monate",
        minimumCommitmentEn: "6 months",
        description: "Premium Tiertraining für 2 Tiere - 6 Monate",
        descriptionEn: "Premium pet training for 2 pets - 6 months"
      };
    case "3-4-tier-monthly":
      return {
        name: "3-4 Tiere - Monatlich",
        nameEn: "3-4 Pets - Monthly",
        amount: 1990,
        interval: "month",
        tierLimit: 4,
        minimumCommitment: "Monatlich kündbar",
        minimumCommitmentEn: "Cancel monthly",
        description: "Premium Tiertraining für 3-4 Tiere",
        descriptionEn: "Premium pet training for 3-4 pets"
      };
    case "3-4-tier-sixmonth":
      return {
        name: "3-4 Tiere - 6 Monate",
        nameEn: "3-4 Pets - 6 Months",
        amount: 9950,
        interval: "month",
        tierLimit: 4,
        minimumCommitment: "6 Monate",
        minimumCommitmentEn: "6 months",
        description: "Premium Tiertraining für 3-4 Tiere - 6 Monate",
        descriptionEn: "Premium pet training for 3-4 pets - 6 months"
      };
    case "5-8-tier-monthly":
      return {
        name: "5-8 Tiere - Monatlich",
        nameEn: "5-8 Pets - Monthly",
        amount: 2990,
        interval: "month",
        tierLimit: 8,
        minimumCommitment: "Monatlich kündbar",
        minimumCommitmentEn: "Cancel monthly",
        description: "Premium Tiertraining für 5-8 Tiere",
        descriptionEn: "Premium pet training for 5-8 pets"
      };
    case "5-8-tier-sixmonth":
      return {
        name: "5-8 Tiere - 6 Monate",
        nameEn: "5-8 Pets - 6 Months",
        amount: 14950,
        interval: "month",
        tierLimit: 8,
        minimumCommitment: "6 Monate",
        minimumCommitmentEn: "6 months",
        description: "Premium Tiertraining für 5-8 Tiere - 6 Monate",
        descriptionEn: "Premium pet training for 5-8 pets - 6 months"
      };
    case "unlimited-tier-monthly":
      return {
        name: "Unbegrenzt - Monatlich",
        nameEn: "Unlimited - Monthly",
        amount: 4990,
        interval: "month",
        tierLimit: 999,
        minimumCommitment: "Monatlich kündbar",
        minimumCommitmentEn: "Cancel monthly",
        description: "Premium Tiertraining unbegrenzt",
        descriptionEn: "Premium pet training unlimited"
      };
    case "unlimited-tier-sixmonth":
      return {
        name: "Unbegrenzt - 6 Monate",
        nameEn: "Unlimited - 6 Months",
        amount: 24950,
        interval: "month",
        tierLimit: 999,
        minimumCommitment: "6 Monate",
        minimumCommitmentEn: "6 months",
        description: "Premium Tiertraining unbegrenzt - 6 Monate",
        descriptionEn: "Premium pet training unlimited - 6 months"
      };
    case "monthly":
      return {
        name: "1 Tier - Monatlich (Legacy)",
        nameEn: "1 Pet - Monthly (Legacy)",
        amount: 990,
        interval: "month",
        tierLimit: 1,
        minimumCommitment: "Monatlich kündbar",
        minimumCommitmentEn: "Cancel monthly",
        description: "Premium Tiertraining für 1 Tier",
        descriptionEn: "Premium pet training for 1 pet"
      };
    case "yearly":
      return {
        name: "1 Tier - Jährlich (Legacy)",
        nameEn: "1 Pet - Yearly (Legacy)",
        amount: 8900, // 89€ yearly
        interval: "year",
        tierLimit: 1,
        minimumCommitment: "Jährlich",
        minimumCommitmentEn: "Yearly",
        description: "Premium Tiertraining für 1 Tier - Jährlich",
        descriptionEn: "Premium pet training for 1 pet - Yearly"
      };
    default:
      return {
        name: "1 Tier - Monatlich",
        nameEn: "1 Pet - Monthly",
        amount: 990,
        interval: "month",
        tierLimit: 1,
        minimumCommitment: "Monatlich kündbar",
        minimumCommitmentEn: "Cancel monthly",
        description: "Premium Tiertraining für 1 Tier",
        descriptionEn: "Premium pet training for 1 pet"
      };
  }
};

// Helper function to get localized pricing config
export const getLocalizedPricingConfig = (priceType: string, language: string = 'de') => {
  const config = getPricingConfig(priceType, language);
  
  return {
    amount: config.amount,
    currency: "eur",
    interval: config.interval,
    name: language === 'en' ? config.nameEn : config.name,
    description: language === 'en' ? config.descriptionEn : config.description,
    tierLimit: config.tierLimit,
    minimumCommitment: language === 'en' ? config.minimumCommitmentEn : config.minimumCommitment
  };
};
