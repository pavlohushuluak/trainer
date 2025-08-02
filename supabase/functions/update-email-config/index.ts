
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { testMode } = await req.json();
    
    // Upsert email configuration in system_notifications as a config entry
    const { error: upsertError } = await supabaseClient
      .from('system_notifications')
      .upsert({
        id: '00000000-0000-0000-0000-000000000001', // Fixed UUID for email config
        type: 'email_config',
        title: 'E-Mail Configuration',
        message: JSON.stringify({ testMode, updatedAt: new Date().toISOString() }),
        user_id: null,
        status: 'active'
      }, {
        onConflict: 'id'
      });

    if (upsertError) {
      console.error('Error upserting config:', upsertError);
      throw upsertError;
    }

    // Log the configuration change
    await supabaseClient.from('system_notifications').insert({
      type: 'email_config_change',
      title: `E-Mail Modus geändert zu: ${testMode ? 'Test' : 'Produktion'}`,
      message: `E-Mail-Konfiguration aktualisiert durch Admin`,
      user_id: null,
      status: 'processed'
    });

    // Email config updated successfully

    return new Response(JSON.stringify({
      success: true,
      testMode,
      message: `E-Mail-Modus erfolgreich auf ${testMode ? 'Test' : 'Produktion'} geändert`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('Error updating email config:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Unknown error occurred'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
