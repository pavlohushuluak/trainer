import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VALIDATE-DEVICE] ${step}${detailsStr}`);
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

    // Get request data
    const { deviceFingerprint, userEmail, userId, deviceInfo, action } = await req.json();
    
    if (!deviceFingerprint) {
      throw new Error("Device fingerprint is required");
    }

    if (!userEmail) {
      throw new Error("User email is required");
    }

    logStep("Validating device binding", { 
      deviceFingerprint: deviceFingerprint.substring(0, 16) + '...',
      userEmail,
      action: action || 'validate'
    });

    // Check if this device is already bound to an account
    const { data: existingBinding, error: fetchError } = await supabaseClient
      .from("device_bindings")
      .select("*")
      .eq("device_fingerprint", deviceFingerprint)
      .maybeSingle();

    if (fetchError) {
      logStep("Error fetching device binding", { error: fetchError });
      throw new Error(`Failed to check device binding: ${fetchError.message}`);
    }

    // If device exists but bound to different email
    if (existingBinding && existingBinding.email !== userEmail) {
      logStep("Device already bound to different account", {
        existingEmail: existingBinding.email,
        requestedEmail: userEmail,
        boundSince: existingBinding.first_login_at
      });

      return new Response(
        JSON.stringify({
          success: false,
          allowed: false,
          reason: "DEVICE_BOUND_TO_ANOTHER_ACCOUNT",
          message: "This device is already bound to another account. Each device can only be used with one account.",
          boundEmail: existingBinding.email.substring(0, 3) + '***' + existingBinding.email.split('@')[1], // Masked email
          boundSince: existingBinding.first_login_at
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 403, // Forbidden
        }
      );
    }

    // If device exists and bound to same email - update last login
    if (existingBinding && existingBinding.email === userEmail) {
      logStep("Device already bound to this account - updating last login", {
        email: userEmail
      });

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
          allowed: true,
          reason: "DEVICE_ALREADY_BOUND",
          message: "Device verified - bound to your account",
          boundSince: existingBinding.first_login_at
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // If device doesn't exist - create new binding
    if (!existingBinding) {
      logStep("Creating new device binding", {
        email: userEmail,
        userId
      });

      const { data: newBinding, error: insertError } = await supabaseClient
        .from("device_bindings")
        .insert({
          device_fingerprint: deviceFingerprint,
          user_id: userId,
          email: userEmail,
          first_login_at: new Date().toISOString(),
          last_login_at: new Date().toISOString(),
          device_info: deviceInfo || {},
          is_locked: true
        })
        .select()
        .single();

      if (insertError) {
        logStep("Error creating device binding", { error: insertError });
        throw new Error(`Failed to create device binding: ${insertError.message}`);
      }

      logStep("Device binding created successfully", {
        email: userEmail,
        boundAt: newBinding.first_login_at
      });

      return new Response(
        JSON.stringify({
          success: true,
          allowed: true,
          reason: "DEVICE_BOUND_SUCCESS",
          message: "Device successfully bound to your account",
          boundAt: newBinding.first_login_at
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Fallback - should not reach here
    throw new Error("Unexpected state in device validation");

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in validate-device-binding", { message: errorMessage });
    
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

