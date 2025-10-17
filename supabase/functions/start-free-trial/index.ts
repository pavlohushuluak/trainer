/**
 * @fileoverview Start Free Trial Edge Function
 * Handles the initiation of a 7-day free trial for Plan 1 for eligible users
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[START-FREE-TRIAL] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight
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

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError) {
      throw new Error(`Authentication error: ${userError.message}`);
    }
    
    const user = userData.user;
    if (!user?.email) {
      throw new Error("User not authenticated or email not available");
    }
    
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Check if user has already used trial
    const { data: subscriber, error: fetchError } = await supabaseClient
      .from("subscribers")
      .select("trial_used, trial_start, trial_end, subscribed, subscription_status")
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchError) {
      logStep("Error fetching subscriber", { error: fetchError });
      throw new Error(`Failed to check trial eligibility: ${fetchError.message}`);
    }

    logStep("Current subscriber data", { subscriber });

    // Check if user already used trial
    if (subscriber?.trial_used === true) {
      logStep("Trial already used", { userId: user.id });
      return new Response(
        JSON.stringify({
          success: false,
          message: "Trial has already been used for this account",
          code: "TRIAL_ALREADY_USED"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Check if user already has an active subscription
    if (subscriber?.subscribed === true && 
        (subscriber?.subscription_status === 'active' || subscriber?.subscription_status === 'trialing')) {
      logStep("User already has active subscription", { userId: user.id });
      return new Response(
        JSON.stringify({
          success: false,
          message: "You already have an active subscription",
          code: "ALREADY_SUBSCRIBED"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Calculate trial period (7 days)
    const trialStart = new Date();
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 7);

    logStep("Starting trial", {
      userId: user.id,
      trialStart: trialStart.toISOString(),
      trialEnd: trialEnd.toISOString()
    });

    // Update or create subscriber record with trial information
    const subscriberData = {
      user_id: user.id,
      email: user.email,
      trial_used: true,
      trial_start: trialStart.toISOString(),
      trial_end: trialEnd.toISOString(),
      subscribed: true,
      subscription_status: 'trialing',
      subscription_tier: 'plan1',
      tier_limit: 1,
      updated_at: new Date().toISOString()
    };

    // Use email as conflict target since it has a unique constraint
    const { data: updatedSubscriber, error: updateError } = await supabaseClient
      .from("subscribers")
      .upsert(subscriberData, { 
        onConflict: 'email',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (updateError) {
      logStep("Error updating subscriber", { error: updateError });
      throw new Error(`Failed to start trial: ${updateError.message}`);
    }

    logStep("Trial started successfully", { 
      userId: user.id,
      subscriber: updatedSubscriber 
    });

    // Track analytics event
    try {
      await supabaseClient
        .from('analytics_events')
        .insert({
          user_id: user.id,
          event_type: 'trial_started',
          metadata: {
            trial_start: trialStart.toISOString(),
            trial_end: trialEnd.toISOString(),
            subscription_tier: 'plan1'
          }
        });
      logStep("Analytics event tracked");
    } catch (analyticsError) {
      logStep("Warning: Failed to track analytics", { error: analyticsError });
      // Don't fail the request if analytics fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Free trial started successfully",
        data: {
          trial_start: trialStart.toISOString(),
          trial_end: trialEnd.toISOString(),
          trial_days: 7,
          subscription_tier: 'plan1'
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in start-free-trial", { message: errorMessage, stack: error instanceof Error ? error.stack : undefined });
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage,
        code: "INTERNAL_ERROR"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

