/**
 * @fileoverview Expire Trials Edge Function
 * Automatically expires trials that have passed their trial_end date
 * Can be called manually or via cron job
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[EXPIRE-TRIALS] ${step}${detailsStr}`);
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

    const now = new Date();
    logStep("Current time", { now: now.toISOString() });

    // Find all active trials that have expired
    const { data: expiredTrials, error: fetchError } = await supabaseClient
      .from("subscribers")
      .select("id, user_id, email, trial_end, trial_start, subscription_tier")
      .eq("subscription_status", "trialing")
      .eq("subscribed", true)
      .lt("trial_end", now.toISOString());

    if (fetchError) {
      logStep("Error fetching expired trials", { error: fetchError });
      throw new Error(`Failed to fetch expired trials: ${fetchError.message}`);
    }

    logStep("Found expired trials", { count: expiredTrials?.length || 0 });

    if (!expiredTrials || expiredTrials.length === 0) {
      logStep("No expired trials to process");
      return new Response(
        JSON.stringify({
          success: true,
          message: "No expired trials found",
          processed: 0
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Update all expired trials to inactive status
    const userIds = expiredTrials.map(t => t.user_id);
    
    logStep("Expiring trials for users", { userIds });

    const { data: updatedRecords, error: updateError } = await supabaseClient
      .from("subscribers")
      .update({
        subscribed: false,
        subscription_status: 'inactive',
        subscription_tier: null,
        updated_at: now.toISOString()
      })
      .in('user_id', userIds)
      .select();

    if (updateError) {
      logStep("Error updating expired trials", { error: updateError });
      throw new Error(`Failed to update expired trials: ${updateError.message}`);
    }

    logStep("Successfully expired trials", { 
      count: updatedRecords?.length || 0,
      userIds 
    });

    // Track analytics for expired trials
    try {
      const analyticsEvents = expiredTrials.map(trial => ({
        user_id: trial.user_id,
        event_type: 'trial_expired',
        metadata: {
          trial_start: trial.trial_start,
          trial_end: trial.trial_end,
          subscription_tier: trial.subscription_tier,
          expired_at: now.toISOString()
        }
      }));

      await supabaseClient
        .from('analytics_events')
        .insert(analyticsEvents);
      
      logStep("Analytics events tracked for expired trials");
    } catch (analyticsError) {
      logStep("Warning: Failed to track analytics", { error: analyticsError });
      // Don't fail the request if analytics fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully expired ${expiredTrials.length} trial(s)`,
        processed: expiredTrials.length,
        users: expiredTrials.map(t => ({
          email: t.email,
          trial_end: t.trial_end
        }))
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in expire-trials", { 
      message: errorMessage, 
      stack: error instanceof Error ? error.stack : undefined 
    });
    
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

