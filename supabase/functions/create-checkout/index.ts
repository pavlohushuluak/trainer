import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { getPricingConfig } from "./utils/pricing.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
// Enhanced logging function
const logStep = (step, details)=>{
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};
// Get or create Stripe customer
async function getOrCreateCustomer(stripe, email, userId, customerInfo) {
  logStep("Searching for existing customer", {
    email
  });
  const customers = await stripe.customers.list({
    email,
    limit: 1
  });
  if (customers.data.length > 0) {
    logStep("Existing customer found", {
      customerId: customers.data[0].id
    });
    return customers.data[0].id;
  }
  const customerData = {
    email,
    metadata: {
      user_id: userId
    }
  };
  if (customerInfo?.name) {
    customerData.name = customerInfo.name;
  }
  logStep("Creating new customer", {
    email,
    metadata: customerData.metadata
  });
  const customer = await stripe.customers.create(customerData);
  logStep("New customer created", {
    customerId: customer.id
  });
  return customer.id;
}
// Helper function to convert pricing config to Stripe format
function convertPricingConfigToStripe(pricingConfig) {
  const config = getPricingConfig(pricingConfig);
  return {
    amount: config.amount,
    currency: "eur",
    interval: config.interval,
    name: config.name,
    description: `${config.name} - ${config.minimumCommitment}`,
    tierLimit: config.tierLimit
  };
}
// Create Stripe checkout session config with enhanced logging
function createSessionConfig(customerId, priceConfig, priceType, userId, userEmail, successUrl, cancelUrl, origin) {
  console.log(priceType);
  const defaultOrigin = origin || "https://tiertrainer24.com";
  const finalSuccessUrl = successUrl || `${defaultOrigin}/mein-tiertraining?success=true&session_id={CHECKOUT_SESSION_ID}`;
  const finalCancelUrl = cancelUrl || `${defaultOrigin}/?canceled=true`;
  logStep("Creating session config", {
    customerId,
    priceType,
    amount: priceConfig.amount,
    successUrl: finalSuccessUrl,
    cancelUrl: finalCancelUrl
  });
  const sessionConfig = {
    customer: customerId,
    payment_method_types: [
      'card'
    ],
    line_items: [
      {
        price_data: {
          currency: priceConfig.currency,
          product_data: {
            name: priceConfig.name,
            description: priceConfig.description || "Premium Tiertraining Features"
          },
          unit_amount: priceConfig.amount,
          ...priceConfig.interval && {
            recurring: {
              interval: priceConfig.interval
            }
          }
        },
        quantity: 1
      }
    ],
    mode: priceConfig.interval ? 'subscription' : 'payment',
    success_url: finalSuccessUrl,
    cancel_url: finalCancelUrl,
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    metadata: {
      user_id: userId,
      user_email: userEmail,
      price_type: priceType
    },
    locale: 'de',
    billing_address_collection: 'required',
    phone_number_collection: {
      enabled: false
    }
  };
  // No trial periods - direct payment only
  return sessionConfig;
}
serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  const supabaseClient = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", {
    auth: {
      persistSession: false
    }
  });
  try {
    logStep("Function started", {
      method: req.method,
      url: req.url,
      timestamp: new Date().toISOString(),
      userAgent: req.headers.get("user-agent"),
      origin: req.headers.get("origin")
    });
    // Validate Stripe key is available
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("ERROR: STRIPE_SECRET_KEY not configured");
      throw new Error("STRIPE_SECRET_KEY not configured");
    }
    logStep("Stripe key validated");
    let user = null;
    let userEmail = "";
    let userId = "";
    // Try to get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      try {
        const token = authHeader.replace("Bearer ", "");
        logStep("Authenticating user with token");
        const { data } = await supabaseClient.auth.getUser(token);
        user = data.user;
        if (user?.email) {
          userEmail = user.email;
          userId = user.id;
          logStep("User authenticated", {
            userId: user.id,
            email: user.email
          });
        }
      } catch (authError) {
        logStep("Authentication failed", {
          error: authError
        });
        throw new Error("User not authenticated");
      }
    } else {
      logStep("ERROR: No authorization header provided");
      throw new Error("No authorization header provided");
    }
    if (!userEmail) {
      logStep("ERROR: No user email available");
      throw new Error("No user email available for checkout");
    }
    const requestBody = await req.json();
    const { priceType = "monthly", successUrl, cancelUrl } = requestBody;
    logStep("Request parsed", {
      priceType,
      successUrl,
      cancelUrl
    });
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16"
    });
    // Get or create customer
    const customerId = await getOrCreateCustomer(stripe, userEmail, userId);
    // Ensure user profile exists
    if (user) {
      const { error: profileError } = await supabaseClient.from('profiles').upsert({
        id: user.id,
        email: user.email,
        first_name: user.user_metadata?.full_name?.split(' ')[0] || '',
        last_name: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      });
      if (profileError) {
        logStep("Profile upsert error", {
          error: profileError
        });
      } else {
        logStep("Profile ensured for user", {
          userId: user.id
        });
      }
    }
    // Get pricing configuration - no trials
    const selectedPrice = convertPricingConfigToStripe(priceType);
    // Create checkout session
    const sessionConfig = createSessionConfig(customerId, selectedPrice, priceType, userId, userEmail, successUrl || "", cancelUrl || "", req.headers.get("origin") || "");
    // Add tier limit to metadata
    sessionConfig.metadata = {
      ...sessionConfig.metadata,
      tier_limit: selectedPrice.tierLimit.toString()
    };
    logStep("Creating Stripe checkout session", {
      customerId,
      sessionConfig: {
        mode: sessionConfig.mode,
        expiresAt: sessionConfig.expires_at
      }
    });
    const session = await stripe.checkout.sessions.create(sessionConfig);
    logStep("Stripe checkout session created successfully", {
      sessionId: session.id,
      url: session.url,
      mode: session.mode,
      status: session.status,
      expiresAt: session.expires_at
    });
    // Validate session URL
    if (!session.url) {
      logStep("ERROR: No session URL returned from Stripe", {
        sessionId: session.id
      });
      throw new Error("No checkout URL received from Stripe");
    }
    return new Response(JSON.stringify({
      url: session.url,
      sessionId: session.id
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 200
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    return new Response(JSON.stringify({
      error: errorMessage
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 500
    });
  }
});
