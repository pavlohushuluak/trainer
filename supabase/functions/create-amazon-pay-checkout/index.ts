import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[AMAZON-PAY-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Amazon Pay checkout function started", {
      method: req.method,
      url: req.url,
      timestamp: new Date().toISOString()
    });

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user?.email) {
      throw new Error("User not authenticated or email not available");
    }

    logStep("User authenticated", { userId: user.id, email: user.email });

    const requestBody = await req.json();
    const { priceType = "plan1-monthly", successUrl, cancelUrl, language = 'de' } = requestBody;
    
    // Validate language parameter
    const validLanguages = ['de', 'en'];
    const finalLanguage = validLanguages.includes(language) ? language : 'de';
    
    // Map language to Amazon Pay checkout language
    const amazonPayLanguage = finalLanguage === 'en' ? 'en_US' : 'de_DE';

    logStep("Request parsed", { priceType, language: finalLanguage, successUrl, cancelUrl });

    // Amazon Pay integration would go here
    // For now, we'll simulate the Amazon Pay button generation
    const amazonPayButtonConfig = {
      merchantId: Deno.env.get("AMAZON_PAY_MERCHANT_ID"),
      publicKeyId: Deno.env.get("AMAZON_PAY_PUBLIC_KEY_ID"),
      ledgerCurrency: "EUR",
      checkoutLanguage: amazonPayLanguage,
      productType: "PayAndShip",
      placement: "Checkout",
      buttonColor: "Gold"
    };

    // Generate a session ID for Amazon Pay
    const amazonPaySessionId = `amzn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Store the pending payment in our database
    const { error: subscriberError } = await supabaseClient
      .from('subscribers')
      .upsert({
        email: user.email,
        user_id: user.id,
        subscribed: false,
        subscription_status: 'pending_amazon_pay',
        billing_cycle: priceType,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'email' });

    if (subscriberError) {
      logStep("Subscriber pre-creation error", { error: subscriberError });
    }

    // Add language parameter to URLs
    const langParam = finalLanguage === 'en' ? '&lang=en' : '&lang=de';
    const defaultOrigin = req.headers.get("origin") || "https://tiertrainer24.com";
    const finalSuccessUrl = successUrl || `${defaultOrigin}/mein-tiertraining?success=true&payment=amazon${langParam}`;
    const finalCancelUrl = cancelUrl || `${defaultOrigin}/?canceled=true${langParam}`;

    // Return Amazon Pay configuration
    return new Response(JSON.stringify({
      paymentMethod: "amazon_pay",
      sessionId: amazonPaySessionId,
      buttonConfig: amazonPayButtonConfig,
      priceType,
      language: finalLanguage,
      successUrl: finalSuccessUrl,
      cancelUrl: finalCancelUrl
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in Amazon Pay checkout", {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });

    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
});