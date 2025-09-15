import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

// Enhanced logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[AUTO-LOGIN] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { userEmail, sessionId } = await req.json();

    if (!userEmail || !sessionId) {
      logStep("Missing required parameters", { userEmail: !!userEmail, sessionId: !!sessionId });
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters: userEmail and sessionId' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    logStep("Processing auto-login request", { userEmail, sessionId });

    // Verify the payment was successful by checking if the user has an active subscription
    logStep("Verifying payment success", { userEmail, sessionId });
    
    const { data: subscriptionData, error: subscriptionError } = await supabaseClient
      .from('subscribers')
      .select('*')
      .eq('email', userEmail)
      .eq('subscribed', true)
      .single();

    if (subscriptionError || !subscriptionData) {
      logStep("No active subscription found, payment may not be processed yet", { 
        userEmail, 
        error: subscriptionError?.message 
      });
      return new Response(
        JSON.stringify({ 
          error: 'Payment not yet processed',
          details: 'Please wait a moment and try again',
          retry: true
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    logStep("Payment verified successfully", { 
      userEmail, 
      subscriptionStatus: subscriptionData.subscription_status,
      tier: subscriptionData.subscription_tier
    });
    
    // Get the user by email using listUsers
    const { data: usersData, error: userError } = await supabaseClient.auth.admin.listUsers({
      filter: {
        email: userEmail
      }
    });
    
    if (userError) {
      logStep("Error getting user data", { error: userError.message, userEmail });
      return new Response(
        JSON.stringify({ 
          error: 'User not found',
          details: userError.message,
          retry: true
        }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!usersData.users || usersData.users.length === 0) {
      logStep("User not found in auth system", { userEmail });
      return new Response(
        JSON.stringify({ 
          error: 'User not found',
          details: 'User does not exist in authentication system',
          retry: true
        }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const user = usersData.users[0];
    logStep("User found", { 
      userId: user.id, 
      email: user.email,
      emailConfirmed: !!user.email_confirmed_at
    });

    // Ensure the user's email is confirmed (should already be done by webhook)
    if (!user.email_confirmed_at) {
      logStep("User email not confirmed, confirming now", { userId: user.id, email: user.email });
      const { error: confirmError } = await supabaseClient.auth.admin.updateUserById(user.id, {
        email_confirm: true
      });

      if (confirmError) {
        logStep("Error confirming user email", { error: confirmError.message, userId: user.id });
        return new Response(
          JSON.stringify({ 
            error: 'Email not confirmed',
            details: confirmError.message,
            retry: true
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      logStep("User email confirmed successfully", { userId: user.id });
    } else {
      logStep("User email already confirmed", { userId: user.id, confirmedAt: user.email_confirmed_at });
    }

    // Create a session for the user using Admin API
    logStep("Creating session for user", { userId: user.id });
    
    // Generate a magic link that will automatically log the user in
    const { data: linkData, error: linkError } = await supabaseClient.auth.admin.generateLink({
      type: 'magiclink',
      email: user.email!,
      options: {
        redirectTo: `${req.headers.get('origin') || 'http://localhost:3000'}/mein-tiertraining`
      }
    });

    if (linkError) {
      logStep("Error generating magic link", { error: linkError.message, userId: user.id });
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create session',
          details: linkError.message
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    logStep("Magic link generated successfully", { 
      userId: user.id,
      hasActionLink: !!linkData.properties?.action_link,
      hasAccessToken: !!linkData.properties?.access_token
    });

    // Return the session data with both magic link and tokens
    return new Response(
      JSON.stringify({ 
        success: true,
        user: {
          id: user.id,
          email: user.email,
          email_confirmed_at: user.email_confirmed_at
        },
        session: {
          action_link: linkData.properties?.action_link,
          access_token: linkData.properties?.access_token,
          refresh_token: linkData.properties?.refresh_token,
          expires_at: linkData.properties?.expires_at
        },
        message: 'Auto-login successful - session created'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    logStep("Unexpected error", { error: error.message });
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
