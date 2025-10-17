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

    // Find all users with trial_used = true to check expiration
    // Use trial_start + 7 days instead of trial_end
    const { data: allTrials, error: fetchError } = await supabaseClient
      .from("subscribers")
      .select("id, user_id, email, trial_start, trial_used, subscription_tier")
      .eq("trial_used", true)
      .not("trial_start", "is", null);

    if (fetchError) {
      logStep("Error fetching trials", { error: fetchError });
      throw new Error(`Failed to fetch trials: ${fetchError.message}`);
    }

    logStep("Found trials to check", { count: allTrials?.length || 0 });

    if (!allTrials || allTrials.length === 0) {
      logStep("No trials to process");
      return new Response(
        JSON.stringify({
          success: true,
          message: "No trials found",
          processed: 0
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Filter trials that have expired (trial_start + 7 days < now)
    const expiredTrials = allTrials.filter(trial => {
      if (!trial.trial_start) return false;
      
      const trialStart = new Date(trial.trial_start);
      const trialExpiration = new Date(trialStart);
      trialExpiration.setDate(trialExpiration.getDate() + 7);
      
      const isExpired = now >= trialExpiration;
      
      logStep("Checking trial expiration (trial_start + 7 days)", {
        email: trial.email,
        trialStart: trial.trial_start,
        trialExpiration: trialExpiration.toISOString(),
        now: now.toISOString(),
        isExpired,
        daysElapsed: Math.floor((now.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24))
      });
      
      return isExpired;
    });

    logStep("Found expired trials (trial_start + 7 days)", { count: expiredTrials.length });

    if (expiredTrials.length === 0) {
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
        subscribed: false,                    // Set to free user
        subscription_status: 'inactive',      // Mark as inactive
        subscription_tier: null,              // Remove tier (free plan)
        tier_limit: null,                     // Remove tier limit
        current_period_start: null,           // Clear subscription period
        current_period_end: null,             // Clear subscription period
        subscription_end: null,               // Clear subscription end
        cancel_at_period_end: false,          // Reset cancellation flag
        billing_cycle: null,                  // Clear billing cycle
        stripe_customer_id: null,             // Clear Stripe customer (they can subscribe again)
        updated_at: now.toISOString(),
        admin_notes: `Trial expired on ${now.toISOString()} - automatically converted to free plan`
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
      const analyticsEvents = expiredTrials.map(trial => {
        const trialStart = new Date(trial.trial_start);
        const trialExpiration = new Date(trialStart);
        trialExpiration.setDate(trialExpiration.getDate() + 7);
        
        return {
          user_id: trial.user_id,
          event_type: 'trial_expired',
          metadata: {
            trial_start: trial.trial_start,
            trial_expiration: trialExpiration.toISOString(),
            subscription_tier: trial.subscription_tier,
            expired_at: now.toISOString(),
            days_elapsed: Math.floor((now.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24))
          }
        };
      });

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
        users: expiredTrials.map(t => {
          const trialStart = new Date(t.trial_start);
          const trialExpiration = new Date(trialStart);
          trialExpiration.setDate(trialExpiration.getDate() + 7);
          
          return {
            email: t.email,
            trial_start: t.trial_start,
            trial_expiration: trialExpiration.toISOString()
          };
        })
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

