
import type { Plan, SixMonthPlan } from "./planData";

export const isSixMonthPlan = (plan: Plan): plan is SixMonthPlan => {
  return 'savings' in plan;
};

export const getCurrentPlanId = (subscription: any) => {
  if (!subscription.subscribed) return null;
  // Map subscription tier to plan ID based on current subscription
  const tier = subscription.subscription_tier;
  if (tier === "Premium") {
    // Need to determine which tier based on other data
    return "1-tier-monthly"; // Default fallback
  }
  return null;
};
