import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GET-PAYMENT-DATA] ${step}${detailsStr}`);
};

// Function to get plan name from metadata or line items
const getPlanName = (session: any) => {
  // Try to get from metadata first
  if (session.metadata?.price_type) {
    const priceType = session.metadata.price_type;
    
    // Map price types to user-friendly names
    const planNames: { [key: string]: string } = {
      'tier1-monthly': '1 Tier Monthly',
      'tier1-halfyearly': '1 Tier Half-Yearly',
      'tier2-monthly': '2 Tiere Monthly',
      'tier2-halfyearly': '2 Tiere Half-Yearly',
      'tier3-monthly': '3-4 Tiere Monthly',
      'tier3-halfyearly': '3-4 Tiere Half-Yearly',
      'tier4-monthly': '5-8 Tiere Monthly',
      'tier4-halfyearly': '5-8 Tiere Half-Yearly',
      'tier5-monthly': 'Unbegrenzt Monthly',
      'tier5-halfyearly': 'Unbegrenzt Half-Yearly'
    };
    
    return planNames[priceType] || priceType;
  }
  
  // Fallback to line items
  if (session.line_items?.data?.[0]?.price?.product?.name) {
    return session.line_items.data[0].price.product.name;
  }
  
  // Final fallback
  return 'Subscription Plan';
};

// Function to get billing cycle from metadata or amount
const getBillingCycle = (session: any) => {
  if (session.metadata?.price_type) {
    return session.metadata.price_type.includes('halfyearly') ? 'halfyearly' : 'monthly';
  }
  
  // Fallback: determine by amount (assuming monthly < 5000 cents, halfyearly >= 5000 cents)
  const amount = session.amount_total || 0;
  return amount >= 5000 ? 'halfyearly' : 'monthly';
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    logStep("Function started", { method: req.method });

    // Validate request method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse request body
    const { sessionId } = await req.json();
    
    logStep("Request received", { sessionId });

    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: 'Session ID is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Initialize Stripe
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      logStep("Stripe secret key missing");
      return new Response(
        JSON.stringify({ error: 'Stripe configuration error' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    logStep("Stripe initialized");

    // Retrieve Stripe session with line items
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'line_items.data.price.product']
    });

    logStep("Stripe session retrieved", {
      sessionId,
      paymentStatus: session.payment_status,
      sessionStatus: session.status,
      amountTotal: session.amount_total,
      currency: session.currency,
      hasLineItems: !!session.line_items?.data?.length
    });

    // Verify payment was successful
    if (session.payment_status !== 'paid') {
      return new Response(
        JSON.stringify({ 
          error: 'Payment not completed',
          status: session.payment_status 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Extract payment data for GTM tracking
    const lineItem = session.line_items?.data?.[0];
    const planName = getPlanName(session);
    const billingCycle = getBillingCycle(session);
    const priceType = session.metadata?.price_type || 'subscription';

    const paymentData = {
      sessionId: session.id,
      transactionId: session.id,
      amount: session.amount_total, // Amount in cents
      amountEuros: session.amount_total ? (session.amount_total / 100) : 0, // Amount in euros
      currency: session.currency?.toUpperCase() || 'EUR',
      planName,
      planType: priceType,
      planId: priceType.split('-')[0] || priceType, // Extract tier from price_type
      billingCycle,
      customerEmail: session.customer_details?.email,
      paymentStatus: session.payment_status,
      sessionStatus: session.status,
      items: [
        {
          item_id: priceType,
          item_name: planName,
          category: 'subscription',
          quantity: lineItem?.quantity || 1,
          price: session.amount_total ? (session.amount_total / 100) : 0
        }
      ],
      metadata: session.metadata || {},
      timestamp: new Date().toISOString()
    };

    logStep("Payment data prepared", {
      amount: paymentData.amount,
      amountEuros: paymentData.amountEuros,
      planName: paymentData.planName,
      planType: paymentData.planType,
      billingCycle: paymentData.billingCycle
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: paymentData
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    logStep("Error occurred", { 
      error: error.message,
      stack: error.stack 
    });
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
