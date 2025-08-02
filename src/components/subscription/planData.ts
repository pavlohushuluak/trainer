
// Re-export the main pricing data to maintain consistency
export { 
  getMonthlyPlans, 
  getSixMonthPlans, 
  type PricingPlan 
} from '../pricing/planData';

// Type alias for backward compatibility in subscription components
export type Plan = PricingPlan;

// For backward compatibility, create a SixMonthPlan type that extends PricingPlan
import type { PricingPlan } from '../pricing/planData';

export type SixMonthPlan = PricingPlan & {
  savings?: string;
  originalPrice?: string;
};
