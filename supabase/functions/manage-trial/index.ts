
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[MANAGE-TRIAL] ${step}${detailsStr}`);
};

// Trial utility functions
const checkTrialStatus = async (
  supabaseClient: any,
  userEmail: string
): Promise<boolean> => {
  const { data: subscriber } = await supabaseClient
    .from("subscribers")
    .select("trial_used")
    .eq("email", userEmail)
    .single();

  const hasUsedTrial = subscriber?.trial_used || false;
  logStep("Trial status checked", { email: userEmail, hasUsedTrial });
  return hasUsedTrial;
};

const resetTrialStatus = async (
  supabaseClient: any,
  userEmail: string
): Promise<void> => {
  await supabaseClient
    .from("subscribers")
    .update({
      trial_used: false,
      trial_start: null,
      trial_end: null,
      updated_at: new Date().toISOString(),
    })
    .eq("email", userEmail);
  
  logStep("Trial status reset", { email: userEmail });
};

const grantSpecialTrial = async (
  supabaseClient: any,
  userEmail: string,
  trialDays: number = 7
): Promise<void> => {
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + trialDays);
  
  await supabaseClient
    .from("subscribers")
    .update({
      trial_used: false,
      trial_end: trialEnd.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("email", userEmail);
  
  logStep("Special trial granted", { email: userEmail, trialDays, trialEnd: trialEnd.toISOString() });
};

const getEnhancedTrialStatus = async (
  supabaseClient: any,
  userEmail: string
): Promise<{
  hasUsedTrial: boolean;
  isEligibleForTrial: boolean;
  specialTrialEnd?: string;
  trialDaysRemaining?: number;
}> => {
  const { data: subscriber } = await supabaseClient
    .from("subscribers")
    .select("trial_used, trial_end")
    .eq("email", userEmail)
    .single();

  const hasUsedTrial = subscriber?.trial_used || false;
  const specialTrialEnd = subscriber?.trial_end;
  
  let isEligibleForTrial = !hasUsedTrial;
  let trialDaysRemaining = 0;
  
  // Check if special trial period is still active
  if (specialTrialEnd) {
    const trialEndDate = new Date(specialTrialEnd);
    const now = new Date();
    
    if (trialEndDate > now) {
      isEligibleForTrial = true;
      trialDaysRemaining = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }
  }
  
  logStep("Enhanced trial status checked", { 
    email: userEmail, 
    hasUsedTrial, 
    isEligibleForTrial, 
    trialDaysRemaining 
  });
  
  return {
    hasUsedTrial,
    isEligibleForTrial,
    specialTrialEnd,
    trialDaysRemaining
  };
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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const requestBody = await req.json();
    const { action, targetEmail, trialDays = 7 } = requestBody;

    // Use authenticated user's email unless explicitly targeting another email
    const emailToProcess = targetEmail || user.email;
    
    logStep("Processing trial action", { action, emailToProcess, trialDays });

    switch (action) {
      case "check":
        const status = await getEnhancedTrialStatus(supabaseClient, emailToProcess);
        return new Response(JSON.stringify(status), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });

      case "reset":
        await resetTrialStatus(supabaseClient, emailToProcess);
        return new Response(JSON.stringify({ 
          success: true, 
          message: "Trial status reset successfully",
          email: emailToProcess 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });

      case "grant":
        await grantSpecialTrial(supabaseClient, emailToProcess, trialDays);
        return new Response(JSON.stringify({ 
          success: true, 
          message: `Special ${trialDays}-day trial granted successfully`,
          email: emailToProcess,
          trialDays 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });

      default:
        throw new Error("Invalid action. Use 'check', 'reset', or 'grant'");
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in manage-trial", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
