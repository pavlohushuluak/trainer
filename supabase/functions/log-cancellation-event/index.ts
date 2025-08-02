
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

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    const { event, metadata } = await req.json();

    console.log(`[LOG-CANCELLATION] ${event} for user ${user.id}`, metadata);

    // Log to analytics events for compliance and tracking
    try {
      const { error: analyticsError } = await supabaseClient.from('analytics_events').insert({
        user_id: user.id,
        event_type: event,
        metadata: {
          ...metadata,
          user_email: user.email,
          logged_at: new Date().toISOString()
        }
      });

      if (analyticsError) {
        console.warn(`[LOG-CANCELLATION] Analytics logging failed:`, analyticsError);
        // Continue execution even if analytics fails
      }
    } catch (analyticsError) {
      console.warn(`[LOG-CANCELLATION] Analytics logging error:`, analyticsError);
      // Continue execution even if analytics fails
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[LOG-CANCELLATION] ERROR:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
