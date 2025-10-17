import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GET-DEVICE-ACCOUNT] ${step}${detailsStr}`);
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

    // Get device fingerprint from request
    const { deviceFingerprint } = await req.json();
    
    if (!deviceFingerprint) {
      throw new Error("Device fingerprint is required");
    }

    logStep("Checking device binding", { 
      fingerprint: deviceFingerprint.substring(0, 16) + '...'
    });

    // Check if this device is bound to an account
    const { data: binding, error: fetchError } = await supabaseClient
      .from("device_bindings")
      .select("*")
      .eq("device_fingerprint", deviceFingerprint)
      .eq("is_locked", true)
      .maybeSingle();

    if (fetchError) {
      logStep("Error fetching device binding", { error: fetchError });
      throw new Error(`Failed to check device binding: ${fetchError.message}`);
    }

    // No binding found
    if (!binding) {
      logStep("No device binding found");
      
      return new Response(
        JSON.stringify({
          success: true,
          bound: false,
          message: "No account bound to this device"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Binding found - return account info
    logStep("Device binding found", {
      email: binding.email,
      userId: binding.user_id,
      boundSince: binding.first_login_at
    });

    // Update last login time
    await supabaseClient
      .from("device_bindings")
      .update({
        last_login_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("device_fingerprint", deviceFingerprint);

    return new Response(
      JSON.stringify({
        success: true,
        bound: true,
        email: binding.email,
        userId: binding.user_id,
        boundSince: binding.first_login_at,
        lastLogin: binding.last_login_at,
        message: "Device bound to account - ready for auto-login"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in get-device-account", { message: errorMessage });
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

