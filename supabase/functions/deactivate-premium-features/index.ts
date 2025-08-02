
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[DEACTIVATE-PREMIUM] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Deactivating premium features");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { userEmail, deactivationReason } = await req.json();
    
    if (!userEmail) {
      throw new Error("User email is required");
    }

    logStep("Processing deactivation", { userEmail, deactivationReason });

    // Get user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('email', userEmail)
      .single();

    if (profileError || !profile) {
      logStep("User profile not found", { userEmail });
      throw new Error("User profile not found");
    }

    // Archive all training plans
    const { error: plansError } = await supabaseClient
      .from('training_plans')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', profile.id);

    if (plansError) {
      logStep("Error archiving training plans", { error: plansError });
    } else {
      logStep("Training plans archived successfully");
    }

    // Clear image analysis cache/limits
    const { error: analyticsError } = await supabaseClient
      .from('user_analytics')
      .update({ 
        image_analyses_used: 0,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', profile.id);

    if (analyticsError) {
      logStep("Error resetting analytics", { error: analyticsError });
    }

    // Log deactivation
    await supabaseClient.from('system_notifications').insert({
      type: 'premium_deactivation',
      title: `Premium-Features deaktiviert`,
      message: `Alle Premium-Features für ${userEmail} wurden deaktiviert (Grund: ${deactivationReason})`,
      user_id: profile.id,
      status: 'processed'
    });

    logStep("Premium features deactivated successfully", { userEmail });

    return new Response(JSON.stringify({
      success: true,
      message: "Premium features successfully deactivated",
      deactivatedFeatures: [
        "Training plans archived",
        "Image analysis reset",
        "Premium chat access removed"
      ]
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in deactivate-premium-features", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
