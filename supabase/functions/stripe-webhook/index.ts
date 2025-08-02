import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
const logStep = (step, details)=>{
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};
// Function to determine subscription tier based on amount and metadata
const getSubscriptionTier = (amount, interval, metadata)=>{
  // Convert yearly amounts to monthly equivalent for comparison
  const monthlyAmount = interval === 'year' ? Math.round(amount / 12) : amount;
  logStep("Determining subscription tier", {
    amount,
    interval,
    monthlyAmount,
    metadata
  });
  // Fallback to amount-based mapping for backward compatibility
  if (interval === 'monthly') {
    if (monthlyAmount >= 4990) return 'plan5'; // 49.90€ - Unbegrenzt
    if (monthlyAmount >= 2990) return 'plan4'; // 29.90€ - 5-8 Tiere
    if (monthlyAmount >= 1990) return 'plan3'; // 19.90€ - 3-4 Tiere
    if (monthlyAmount >= 1490) return 'plan2'; // 14.90€ - 2 Tiere
    if (monthlyAmount >= 990) return 'plan1'; // 9.90€ - 1 Tier
  } else {
    if (monthlyAmount >= 24950) return 'plan5'; // 49.90€ - Unbegrenzt
    if (monthlyAmount >= 14950) return 'plan4'; // 29.90€ - 5-8 Tiere
    if (monthlyAmount >= 9950) return 'plan3'; // 19.90€ - 3-4 Tiere
    if (monthlyAmount >= 7450) return 'plan2'; // 14.90€ - 2 Tiere
    if (monthlyAmount >= 5940) return 'plan1'; // 9.90€ - 1 Tier
  }
  // Default to plan1 for any paid subscription
  return 'plan1';
};
// Function to get tier limit based on subscription tier
const getTierLimit = (subscriptionTier)=>{
  switch(subscriptionTier){
    case 'plan1':
      return 1;
    case 'plan2':
      return 2;
    case 'plan3':
      return 4;
    case 'plan4':
      return 8;
    case 'plan5':
      return 999;
    default:
      return 1;
  }
};
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
    logStep("Webhook received");
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16"
    });
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    if (!signature) throw new Error("No stripe signature found");
    // Webhook-Signatur verifizieren
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
      console.log(event);
      logStep("Webhook signature verified", {
        eventType: event.type
      });
    } catch (err) {
      logStep("Webhook signature verification failed", {
        error: err.message
      });
      return new Response(`Webhook Error: ${err.message}`, {
        status: 400
      });
    }
    // Prüfe ob Event bereits verarbeitet wurde
    const { data: existingEvent } = await supabaseClient.from("stripe_webhooks").select("id").eq("stripe_event_id", event.id).single();
    if (existingEvent) {
      logStep("Event already processed", {
        eventId: event.id
      });
      return new Response("Event already processed", {
        status: 200
      });
    }
    // Speichere Webhook-Event
    await supabaseClient.from("stripe_webhooks").insert({
      stripe_event_id: event.id,
      event_type: event.type,
      data: event.data,
      processed: false
    });
    // Verarbeite verschiedene Event-Typen
    switch(event.type){
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionEvent(event, supabaseClient, stripe);
        break;
      case 'invoice.payment_succeeded':
      case 'invoice.payment_failed':
        {
          await handleInvoiceEvent(event, supabaseClient, stripe);
        }
        break;
      case 'customer.subscription.trial_will_end':
        await handleTrialEndingEvent(event, supabaseClient);
        break;
      default:
        logStep("Unhandled event type", {
          eventType: event.type
        });
    }
    // Markiere Event als verarbeitet
    await supabaseClient.from("stripe_webhooks").update({
      processed: true,
      processed_at: new Date().toISOString()
    }).eq("stripe_event_id", event.id);
    logStep("Webhook processed successfully", {
      eventType: event.type
    });
    return new Response("Webhook processed", {
      status: 200
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in stripe-webhook", {
      message: errorMessage
    });
    return new Response(`Webhook Error: ${errorMessage}`, {
      status: 500
    });
  }
});
// Subscription Events verarbeiten
async function handleSubscriptionEvent(event, supabaseClient, stripe) {
  const subscription = event.data.object;
  const customerId = subscription.customer;
  logStep("Processing subscription event", {
    subscriptionId: subscription.id,
    status: subscription.status
  });
  const customer = await stripe.customers.retrieve(customerId);
  if (!customer.email) {
    logStep("No email found for customer", {
      customerId
    });
    return;
  }
  const { data: existingProfile } = await supabaseClient.from('profiles').select('id').eq('email', customer.email).single();
  if (!existingProfile) {
    const placeholderUserId = `stripe_${customerId}`;
    await supabaseClient.from('profiles').upsert({
      id: placeholderUserId,
      email: customer.email,
      first_name: customer.name?.split(' ')[0] || '',
      last_name: customer.name?.split(' ').slice(1).join(' ') || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'email'
    });
  }
  let flag = 0;
  const priceData = subscription.items?.data?.[0]?.price;
  const amount = priceData?.unit_amount || 0;
  let interval;
  if (amount !== 0 && amount >= 5000) interval = 'halfyearly';
  else if (amount !== 0 && amount < 5000) interval = 'monthly';
  const metadata = subscription.metadata || {};
  let subscriptionTier;
  if (flag === 0 && amount !== 0) {
    subscriptionTier = subscription.status === 'canceled' ? null : getSubscriptionTier(amount, interval, metadata);
    flag = 1;
  }
  const tierLimit = subscriptionTier ? getTierLimit(subscriptionTier) : null;
  let billingCycle = interval;
  const secondsToAdd = interval === 'monthly' ? 30 * 24 * 3600 : 30 * 24 * 3600 * 6;
  const subscriptionData = {
    email: customer.email,
    stripe_customer_id: customerId,
    subscribed: [
      'active',
      'trialing'
    ].includes(subscription.status),
    subscription_tier: subscriptionTier,
    tier_limit: tierLimit,
    subscription_status: subscription.status,
    subscription_end: new Date(Date.now() + secondsToAdd * 1000).toISOString(),
    current_period_start: subscription.current_period_start ? new Date(subscription.current_period_start * 1000).toISOString() : null,
    current_period_end: subscription.current_period_end ? new Date((subscription.current_period_end + secondsToAdd) * 1000).toISOString() : null,
    cancel_at_period_end: subscription.cancel_at_period_end,
    billing_cycle: billingCycle,
    trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
    updated_at: new Date().toISOString(),
    admin_notes: `Webhook updated: ${event.type} at ${new Date().toISOString()}. Status: ${subscription.status}. Tier: ${subscriptionTier}. Amount: ${amount}`
  };
  console.log(subscriptionData);
  if (subscriptionData.subscription_status !== 'active' && subscriptionData.subscription_status !== 'trialing') return;
  const { error, data } = await supabaseClient.from("subscribers").update(subscriptionData).eq("email", subscriptionData.email);
  if (error) {
    console.error("Update failed:", error.message);
  } else {
    console.log("Update success:", data);
  }
  logStep("Subscription data updated in database", {
    email: customer.email,
    status: subscription.status,
    tier: subscriptionTier,
    tierLimit: tierLimit
  });
  if (subscription.status === 'trialing' && subscription.trial_end) {
    await updateTrialUsage(customer.email, supabaseClient);
  }
  await handleSubscriptionStatusChange(event.type, subscription, customer.email, supabaseClient);
}
// Invoice Events verarbeiten  
async function handleInvoiceEvent(event, supabaseClient, stripe) {
  console.log("!important: ", event);
  const invoice = event.data.object;
  if (invoice.status !== 'paid' && invoice.status !== 'active' && invoice.status !== 'trialing') return;
  const customerId = invoice.customer;
  logStep("Processing invoice event", {
    invoiceId: invoice.id,
    status: invoice.status
  });
  const customer = await stripe.customers.retrieve(customerId);
  if (!customer.email) return;
  const { data: subscriber } = await supabaseClient.from("subscribers").select("user_id").eq("email", customer.email).single();
  if (!subscriber?.user_id) {
    logStep("No user_id found for subscriber, using email as reference", {
      email: customer.email
    });
  }
  const invoiceData = {
    user_id: subscriber?.user_id || `stripe_${customerId}`,
    stripe_invoice_id: invoice.id,
    invoice_number: invoice.number,
    amount_total: invoice.amount_paid,
    currency: invoice.currency,
    status: invoice.status,
    invoice_pdf: invoice.invoice_pdf,
    hosted_invoice_url: invoice.hosted_invoice_url,
    created_at: invoice.created ? new Date(invoice.created * 1000).toISOString() : null,
    due_date: invoice.due_date ? new Date(invoice.due_date * 1000).toISOString() : null,
    paid_at: invoice.status_transitions?.paid_at ? new Date(invoice.status_transitions.paid_at * 1000).toISOString() : null
  };
  console.log(invoice.amount_paid);
  if (invoice.amount_paid !== 0 && (invoice.status !== 'paid' || invoice.status !== 'active' || invoice.status !== 'trialing')) {
    await supabaseClient.from("invoices").upsert(invoiceData, {
      onConflict: 'stripe_invoice_id'
    });
    logStep("Invoice data updated in database", {
      invoiceId: invoice.id,
      status: invoice.status,
      amount: invoice.amount_paid
    });
  }
  if (event.type === 'invoice.payment_failed') {
    await handlePaymentFailure(invoice, customer.email, supabaseClient);
  }
}
// Trial ending notification
async function handleTrialEndingEvent(event, supabaseClient) {
  const subscription = event.data.object;
  logStep("Processing trial ending event", {
    subscriptionId: subscription.id,
    trialEnd: subscription.trial_end
  });
// Hier könnte man E-Mail-Benachrichtigungen senden
// Für jetzt nur loggen
}
// Update trial usage for subscriber
async function updateTrialUsage(email, supabaseClient) {
  try {
    const { error } = await supabaseClient.from('subscribers').update({
      trial_used: true,
      updated_at: new Date().toISOString()
    }).eq('email', email);
    if (error) {
      logStep("Error updating trial usage", {
        error: error.message,
        email
      });
    } else {
      logStep("Trial usage updated", {
        email
      });
    }
  } catch (error) {
    logStep("Error in updateTrialUsage", {
      error: error.message,
      email
    });
  }
}
// Handle subscription status changes
async function handleSubscriptionStatusChange(eventType, subscription, email, supabaseClient) {
  try {
    let statusNote = '';
    switch(eventType){
      case 'customer.subscription.created':
        statusNote = `Subscription created on ${new Date().toISOString()}`;
        break;
      case 'customer.subscription.updated':
        statusNote = `Subscription updated on ${new Date().toISOString()}`;
        break;
      case 'customer.subscription.deleted':
        statusNote = `Subscription cancelled on ${new Date().toISOString()}`;
        break;
      default:
        statusNote = `Status change: ${eventType} on ${new Date().toISOString()}`;
    }
    // Update admin notes with status change
    const { error } = await supabaseClient.from('subscribers').update({
      admin_notes: statusNote,
      updated_at: new Date().toISOString()
    }).eq('email', email);
    if (error) {
      logStep("Error updating status change", {
        error: error.message,
        email,
        eventType
      });
    } else {
      logStep("Status change recorded", {
        email,
        eventType
      });
    }
  } catch (error) {
    logStep("Error in handleSubscriptionStatusChange", {
      error: error.message,
      email,
      eventType
    });
  }
}
// Handle payment failure
async function handlePaymentFailure(invoice, email, supabaseClient) {
  try {
    const failureNote = `Payment failed on ${new Date().toISOString()}. Invoice: ${invoice.id}. Amount: ${invoice.amount_due} ${invoice.currency}`;
    // Update subscriber with payment failure note
    const { error } = await supabaseClient.from('subscribers').update({
      admin_notes: failureNote,
      updated_at: new Date().toISOString()
    }).eq('email', email);
    if (error) {
      logStep("Error updating payment failure", {
        error: error.message,
        email
      });
    } else {
      logStep("Payment failure recorded", {
        email,
        invoiceId: invoice.id
      });
    }
  } catch (error) {
    logStep("Error in handlePaymentFailure", {
      error: error.message,
      email
    });
  }
}
