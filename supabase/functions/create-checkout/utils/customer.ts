
import Stripe from "https://esm.sh/stripe@14.21.0";
import { logStep } from "./logger.ts";

export const getOrCreateCustomer = async (
  stripe: Stripe, 
  userEmail: string, 
  userId: string,
  customerInfo?: any
): Promise<string> => {
  // Check for existing customer
  const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
  
  if (customers.data.length > 0) {
    const customerId = customers.data[0].id;
    logStep("Existing customer found", { customerId });
    return customerId;
  }

  // Create new customer with extended data
  const customer = await stripe.customers.create({
    email: userEmail,
    name: customerInfo?.name || `${customerInfo?.firstName || ''} ${customerInfo?.lastName || ''}`.trim(),
    metadata: {
      user_id: userId,
      source: 'tiertrainer_app'
    }
  });
  
  logStep("New customer created", { customerId: customer.id });
  return customer.id;
};
