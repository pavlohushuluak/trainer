
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CANCEL-SUBSCRIPTION] ${step}${detailsStr}`);
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
    logStep("Cancellation function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const authenticatedUser = userData.user;
    if (!authenticatedUser?.email) throw new Error("User not authenticated");

    const { immediateRefund, adminUserId } = await req.json();
    
    // Determine target user (admin cancellation vs self-cancellation)
    let targetUserEmail = authenticatedUser.email;
    if (adminUserId) {
      // This is an admin cancellation - get the target user's email
      const { data: targetUser } = await supabaseClient
        .from('profiles')
        .select('email')
        .eq('id', adminUserId)
        .single();
      
      if (!targetUser) {
        // Try to get email from subscribers table
        const { data: subscriber } = await supabaseClient
          .from('subscribers')
          .select('email')
          .eq('user_id', adminUserId)
          .single();
        
        if (!subscriber) throw new Error("Target user not found");
        targetUserEmail = subscriber.email;
      } else {
        targetUserEmail = targetUser.email;
      }
      
      logStep("Admin cancellation", { adminEmail: authenticatedUser.email, targetEmail: targetUserEmail });
    }

    logStep("Processing cancellation for user", { email: targetUserEmail });
    
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Get customer
    const customers = await stripe.customers.list({ email: targetUserEmail, limit: 1 });
    if (customers.data.length === 0) {
      throw new Error("No Stripe customer found");
    }
    
    const customer = customers.data[0];
    logStep("Found customer", { customerId: customer.id });

    // Get active subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      throw new Error("No active subscription found");
    }

    const subscription = subscriptions.data[0];
    logStep("Found active subscription", { subscriptionId: subscription.id });

    let cancelledSubscription;
    let refundAmount = 0;

    if (immediateRefund) {
      // Cancel immediately for money-back guarantee
      cancelledSubscription = await stripe.subscriptions.cancel(subscription.id);
      
      // Get the latest invoice and refund it
      const invoices = await stripe.invoices.list({
        subscription: subscription.id,
        limit: 1,
      });

      if (invoices.data.length > 0) {
        const invoice = invoices.data[0];
        if (invoice.paid && invoice.amount_paid > 0) {
          const refund = await stripe.refunds.create({
            payment_intent: invoice.payment_intent as string,
            amount: invoice.amount_paid,
            reason: 'requested_by_customer',
            metadata: {
              refund_reason: adminUserId ? 'admin_money_back_guarantee' : 'money_back_guarantee',
              user_email: targetUserEmail,
              admin_email: adminUserId ? authenticatedUser.email : null,
            },
          });
          refundAmount = refund.amount;
          logStep("Refund created", { refundId: refund.id, amount: refundAmount });
        }
      }
    } else {
      // Cancel at period end for regular cancellation
      cancelledSubscription = await stripe.subscriptions.update(subscription.id, {
        cancel_at_period_end: true,
      });
    }

    logStep("Subscription cancelled", { 
      subscriptionId: cancelledSubscription.id, 
      immediate: immediateRefund,
      refunded: refundAmount > 0 
    });

    // Update database
    await supabaseClient
      .from('subscribers')
      .update({
        subscription_status: immediateRefund ? 'canceled' : 'active',
        cancel_at_period_end: !immediateRefund,
        subscribed: immediateRefund ? false : true,
        updated_at: new Date().toISOString(),
        admin_notes: immediateRefund 
          ? `${adminUserId ? 'Admin-' : ''}Cancelled with money-back guarantee. Refund: €${(refundAmount / 100).toFixed(2)}`
          : `${adminUserId ? 'Admin-' : ''}Cancelled - active until period end`
      })
      .eq('email', targetUserEmail);

    // Log admin action if this was an admin cancellation
    if (adminUserId) {
      await supabaseClient
        .from('admin_activity_log')
        .insert({
          admin_id: authenticatedUser.id,
          action: immediateRefund ? 'subscription_cancelled_with_refund' : 'subscription_cancelled',
          target_user_id: adminUserId,
          details: { 
            immediate: immediateRefund, 
            refunded: refundAmount > 0,
            refund_amount: refundAmount 
          }
        });
    }

    return new Response(JSON.stringify({
      success: true,
      cancelled: true,
      immediate: immediateRefund,
      refunded: refundAmount > 0,
      refundAmount: refundAmount,
      periodEnd: cancelledSubscription.current_period_end,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in cancel-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
