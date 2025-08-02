
export interface PricingConfig {
  name: string;
  amount: number;
  interval: string;
  tierLimit: number;
  minimumCommitment: string;
}

export const getPricingConfig = (priceType: string): PricingConfig => {
  // No trials - direct payment only

  switch (priceType) {
    // Plan 1: 1 Tier
    case "plan1-monthly":
      return {
        name: "1 Tier - Monatlich",
        amount: 990, // 9.90€
        interval: "month",
        tierLimit: 1,
        minimumCommitment: "Monatlich kündbar"
      };
    case "plan1-halfyearly":
      return {
        name: "1 Tier - 6 Monate",
        amount: 5940, // 59.40€
        interval: "month",
        tierLimit: 1,
        minimumCommitment: "6 Monate"
      };
    
    // Plan 2: 2 Tiere
    case "plan2-monthly":
      return {
        name: "2 Tiere - Monatlich",
        amount: 1490, // 14.90€
        interval: "month",
        tierLimit: 2,
        minimumCommitment: "Monatlich kündbar"
      };
    case "plan2-halfyearly":
      return {
        name: "2 Tiere - 6 Monate",
        amount: 7450, // 74.50€
        interval: "month",
        tierLimit: 2,
        minimumCommitment: "6 Monate"
      };
    
    // Plan 3: 3-4 Tiere
    case "plan3-monthly":
      return {
        name: "3-4 Tiere - Monatlich",
        amount: 1990, // 19.90€
        interval: "month",
        tierLimit: 4,
        minimumCommitment: "Monatlich kündbar"
      };
    case "plan3-halfyearly":
      return {
        name: "3-4 Tiere - 6 Monate",
        amount: 9950, // 99.50€
        interval: "month",
        tierLimit: 4,
        minimumCommitment: "6 Monate"
      };
    
    // Plan 4: 5-8 Tiere
    case "plan4-monthly":
      return {
        name: "5-8 Tiere - Monatlich",
        amount: 2990, // 29.90€
        interval: "month",
        tierLimit: 8,
        minimumCommitment: "Monatlich kündbar"
      };
    case "plan4-halfyearly":
      return {
        name: "5-8 Tiere - 6 Monate",
        amount: 14950, // 149.50€
        interval: "month",
        tierLimit: 8,
        minimumCommitment: "6 Monate"
      };
    
    // Plan 5: Unbegrenzt
    case "plan5-monthly":
      return {
        name: "Unbegrenzt - Monatlich",
        amount: 4990, // 49.90€
        interval: "month",
        tierLimit: 999,
        minimumCommitment: "Monatlich kündbar"
      };
    case "plan5-halfyearly":
      return {
        name: "Unbegrenzt - 6 Monate",
        amount: 24950, // 249.50€
        interval: "month",
        tierLimit: 999,
        minimumCommitment: "6 Monate"
      };
    
    // Legacy support for old pricing (backward compatibility)
    case "1-tier-monthly":
      return {
        name: "1 Tier - Monatlich",
        amount: 990,
        interval: "month",
        tierLimit: 1,
        minimumCommitment: "Monatlich kündbar"
      };
    case "1-tier-sixmonth":
      return {
        name: "1 Tier - 6 Monate",
        amount: 5940,
        interval: "month",
        tierLimit: 1,
        minimumCommitment: "6 Monate"
      };
    case "2-tier-monthly":
      return {
        name: "2 Tiere - Monatlich",
        amount: 1490,
        interval: "month",
        tierLimit: 2,
        minimumCommitment: "Monatlich kündbar"
      };
    case "2-tier-sixmonth":
      return {
        name: "2 Tiere - 6 Monate",
        amount: 7450,
        interval: "month",
        tierLimit: 2,
        minimumCommitment: "6 Monate"
      };
    case "3-4-tier-monthly":
      return {
        name: "3-4 Tiere - Monatlich",
        amount: 1990,
        interval: "month",
        tierLimit: 4,
        minimumCommitment: "Monatlich kündbar"
      };
    case "3-4-tier-sixmonth":
      return {
        name: "3-4 Tiere - 6 Monate",
        amount: 9950,
        interval: "month",
        tierLimit: 4,
        minimumCommitment: "6 Monate"
      };
    case "5-8-tier-monthly":
      return {
        name: "5-8 Tiere - Monatlich",
        amount: 2990,
        interval: "month",
        tierLimit: 8,
        minimumCommitment: "Monatlich kündbar"
      };
    case "5-8-tier-sixmonth":
      return {
        name: "5-8 Tiere - 6 Monate",
        amount: 14950,
        interval: "month",
        tierLimit: 8,
        minimumCommitment: "6 Monate"
      };
    case "unlimited-tier-monthly":
      return {
        name: "Unbegrenzt - Monatlich",
        amount: 4990,
        interval: "month",
        tierLimit: 999,
        minimumCommitment: "Monatlich kündbar"
      };
    case "unlimited-tier-sixmonth":
      return {
        name: "Unbegrenzt - 6 Monate",
        amount: 24950,
        interval: "month",
        tierLimit: 999,
        minimumCommitment: "6 Monate"
      };
    case "monthly":
      return {
        name: "1 Tier - Monatlich (Legacy)",
        amount: 990,
        interval: "month",
        tierLimit: 1,
        minimumCommitment: "Monatlich kündbar"
      };
    case "yearly":
      return {
        name: "1 Tier - Jährlich (Legacy)",
        amount: 8900, // 89€ yearly
        interval: "year",
        tierLimit: 1,
        minimumCommitment: "Jährlich"
      };
    default:
      return {
        name: "1 Tier - Monatlich",
        amount: 990,
        interval: "month",
        tierLimit: 1,
        minimumCommitment: "Monatlich kündbar"
      };
  }
};
