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

    // CRITICAL FIX: Verify payment success directly with Stripe using session ID
    // This is more reliable than checking subscription data which might not be processed yet
    logStep("Verifying payment success with Stripe", { userEmail, sessionId });
    
    // Import Stripe to verify the session
    const Stripe = (await import('https://esm.sh/stripe@14.21.0')).default;
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    
    if (!stripeKey) {
      logStep("Stripe secret key not found", { userEmail, sessionId });
      return new Response(
        JSON.stringify({ 
          error: 'Payment verification failed',
          details: 'Stripe configuration error',
          retry: false
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16"
    });
    
    try {
      // Verify the checkout session with Stripe
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      if (!session || session.payment_status !== 'paid') {
        logStep("Payment not successful according to Stripe", { 
          userEmail, 
          sessionId,
          paymentStatus: session?.payment_status,
          sessionStatus: session?.status
        });
        return new Response(
          JSON.stringify({ 
            error: 'Payment not successful',
            details: 'Payment was not completed successfully',
            retry: false
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      logStep("Payment verified successfully with Stripe", { 
        userEmail, 
        sessionId,
        paymentStatus: session.payment_status,
        sessionStatus: session.status,
        customerEmail: session.customer_details?.email
      });
      
    } catch (stripeError) {
      logStep("Error verifying payment with Stripe", { 
        userEmail, 
        sessionId,
        error: stripeError.message 
      });
      return new Response(
        JSON.stringify({ 
          error: 'Payment verification failed',
          details: 'Could not verify payment with Stripe',
          retry: true
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // CRITICAL FIX: Get the user by email using getUserByEmail (more reliable)
    const { data: authUser, error: userError } = await supabaseClient.auth.admin.getUserByEmail(userEmail);
    
    if (userError || !authUser.user) {
      logStep("User not found in auth system", { 
        userEmail, 
        error: userError?.message 
      });
      return new Response(
        JSON.stringify({ 
          error: 'User not found',
          details: 'The user account does not exist in the authentication system',
          retry: false
        }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const user = authUser.user;
    logStep("User found", { 
      userId: user.id, 
      email: user.email,
      emailConfirmed: !!user.email_confirmed_at
    });

    // CRITICAL FIX: Always ensure the user's email is confirmed for checkout flow
    // This handles cases where users signed up through SmartLoginModal without email confirmation
    if (!user.email_confirmed_at) {
      logStep("User email not confirmed, auto-confirming for checkout flow", { userId: user.id, email: user.email });
      const { error: confirmError } = await supabaseClient.auth.admin.updateUserById(user.id, {
        email_confirm: true
      });

      if (confirmError) {
        logStep("Error auto-confirming user email", { error: confirmError.message, userId: user.id });
        return new Response(
          JSON.stringify({ 
            error: 'Failed to confirm email',
            details: confirmError.message,
            retry: true
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      logStep("User email auto-confirmed successfully for checkout flow", { userId: user.id });
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
      hasAccessToken: !!linkData.properties?.access_token,
      hasRefreshToken: !!linkData.properties?.refresh_token
    });

    // CRITICAL FIX: Return session data in the format expected by the client
    // The client expects access_token and refresh_token for direct session setting
    return new Response(
      JSON.stringify({ 
        success: true,
        user: {
          id: user.id,
          email: user.email,
          email_confirmed_at: user.email_confirmed_at
        },
        session: {
          access_token: linkData.properties?.access_token,
          refresh_token: linkData.properties?.refresh_token,
          expires_at: linkData.properties?.expires_at,
          token_type: 'bearer',
          user: {
            id: user.id,
            email: user.email,
            email_confirmed_at: user.email_confirmed_at
          }
        },
        action_link: linkData.properties?.action_link, // Keep for fallback
        message: 'Auto-login successful - session created and email confirmed'
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
