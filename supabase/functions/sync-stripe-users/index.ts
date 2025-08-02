
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SYNC-STRIPE-USERS] ${step}${detailsStr}`);
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
    logStep("Function started");

    // Verify admin access
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    // Check if user is admin
    const { data: isAdmin } = await supabaseClient.rpc('is_admin', { _user_id: user.id });
    if (!isAdmin) throw new Error("Access denied - admin required");

    logStep("Admin access verified", { userId: user.id });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2023-10-16" 
    });

    // Get all Stripe customers
    let allCustomers = [];
    let hasMore = true;
    let startingAfter = undefined;

    while (hasMore) {
      const customers = await stripe.customers.list({
        limit: 100,
        starting_after: startingAfter
      });
      
      allCustomers.push(...customers.data);
      hasMore = customers.has_more;
      if (hasMore && customers.data.length > 0) {
        startingAfter = customers.data[customers.data.length - 1].id;
      }
    }

    logStep("Retrieved Stripe customers", { count: allCustomers.length });

    let syncedUsers = 0;

    // Process each customer
    for (const customer of allCustomers) {
      if (!customer.email) continue;

      try {
        // Check if customer has subscriptions
        const subscriptions = await stripe.subscriptions.list({
          customer: customer.id,
          status: "all",
          limit: 10
        });

        // Find active subscription
        const activeSubscription = subscriptions.data.find(sub => 
          ['active', 'trialing', 'past_due'].includes(sub.status)
        );

        // Ensure profile exists
        const { error: profileError } = await supabaseClient
          .from('profiles')
          .upsert({
            id: `stripe_${customer.id}`,
            email: customer.email,
            first_name: customer.name?.split(' ')[0] || '',
            last_name: customer.name?.split(' ').slice(1).join(' ') || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, { onConflict: 'email' });

        if (profileError) {
          logStep("Profile creation error", { email: customer.email, error: profileError });
        }

        // Create/update subscriber record
        const subscriptionData = {
          email: customer.email,
          user_id: `stripe_${customer.id}`,
          stripe_customer_id: customer.id,
          subscribed: !!activeSubscription,
          subscription_tier: activeSubscription ? "premium" : null,
          subscription_status: activeSubscription?.status || 'inactive',
          subscription_end: activeSubscription ? new Date(activeSubscription.current_period_end * 1000).toISOString() : null,
          current_period_start: activeSubscription ? new Date(activeSubscription.current_period_start * 1000).toISOString() : null,
          current_period_end: activeSubscription ? new Date(activeSubscription.current_period_end * 1000).toISOString() : null,
          cancel_at_period_end: activeSubscription?.cancel_at_period_end || false,
          billing_cycle: activeSubscription?.items.data[0]?.price.recurring?.interval || 'monthly',
          trial_end: activeSubscription?.trial_end ? new Date(activeSubscription.trial_end * 1000).toISOString() : null,
          updated_at: new Date().toISOString(),
          admin_notes: `Synced from Stripe at ${new Date().toISOString()}`
        };

        const { error: subscriberError } = await supabaseClient
          .from('subscribers')
          .upsert(subscriptionData, { onConflict: 'email' });

        if (subscriberError) {
          logStep("Subscriber sync error", { email: customer.email, error: subscriberError });
        } else {
          syncedUsers++;
          logStep("User synced", { email: customer.email, hasSubscription: !!activeSubscription });
        }

      } catch (customerError) {
        logStep("Error processing customer", { customerId: customer.id, error: customerError });
      }
    }

    logStep("Sync completed", { totalCustomers: allCustomers.length, syncedUsers });

    return new Response(JSON.stringify({ 
      success: true,
      totalCustomers: allCustomers.length,
      syncedUsers
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in sync-stripe-users", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
