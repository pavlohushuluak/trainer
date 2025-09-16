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
    logStep("Request details", { 
      method: req.method,
      headers: Object.fromEntries(req.headers.entries()),
      url: req.url
    });

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
      logStep("Retrieving Stripe session", { sessionId });
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      logStep("Stripe session retrieved", { 
        sessionId,
        sessionExists: !!session,
        paymentStatus: session?.payment_status,
        sessionStatus: session?.status,
        customerEmail: session?.customer_details?.email,
        amountTotal: session?.amount_total,
        currency: session?.currency
      });
      
      if (!session || session.payment_status !== 'paid') {
        logStep("Payment not successful according to Stripe", { 
          userEmail, 
          sessionId,
          paymentStatus: session?.payment_status,
          sessionStatus: session?.status,
          sessionExists: !!session
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
        error: stripeError.message,
        errorStack: stripeError.stack
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

    // CRITICAL FIX: Create a session using multiple approaches for maximum reliability
    logStep("Creating session for user using multiple approaches", { userId: user.id });
    
    try {
      // Approach 1: Try magic link first
      const { data: magicLinkData, error: magicLinkError } = await supabaseClient.auth.admin.generateLink({
        type: 'magiclink',
        email: user.email!,
        options: {
          redirectTo: `${req.headers.get('origin') || 'http://localhost:3000'}/mein-tiertraining`
        }
      });

      if (!magicLinkError && magicLinkData.properties?.action_link) {
        logStep("Magic link generated successfully", { 
          userId: user.id,
          actionLink: magicLinkData.properties.action_link
        });

        return new Response(
          JSON.stringify({ 
            success: true,
            user: {
              id: user.id,
              email: user.email,
              email_confirmed_at: user.email_confirmed_at
            },
            action_link: magicLinkData.properties.action_link,
            message: 'Auto-login successful - magic link generated'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      logStep("Magic link failed, trying signup link", { 
        error: magicLinkError?.message, 
        userId: user.id 
      });

      // Approach 2: Try signup link (for already confirmed users)
      const { data: signupData, error: signupError } = await supabaseClient.auth.admin.generateLink({
        type: 'signup',
        email: user.email!,
        options: {
          redirectTo: `${req.headers.get('origin') || 'http://localhost:3000'}/mein-tiertraining`
        }
      });

      if (!signupError && signupData.properties?.action_link) {
        logStep("Signup link generated successfully", { 
          userId: user.id,
          actionLink: signupData.properties.action_link
        });

        return new Response(
          JSON.stringify({ 
            success: true,
            user: {
              id: user.id,
              email: user.email,
              email_confirmed_at: user.email_confirmed_at
            },
            action_link: signupData.properties.action_link,
            message: 'Auto-login successful - signup link generated'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      logStep("Signup link failed, trying recovery link", { 
        error: signupError?.message, 
        userId: user.id 
      });

      // Approach 3: Try recovery link as final fallback
      const { data: recoveryData, error: recoveryError } = await supabaseClient.auth.admin.generateLink({
        type: 'recovery',
        email: user.email!,
        options: {
          redirectTo: `${req.headers.get('origin') || 'http://localhost:3000'}/mein-tiertraining`
        }
      });

      if (!recoveryError && recoveryData.properties?.action_link) {
        logStep("Recovery link generated successfully", { 
          userId: user.id,
          actionLink: recoveryData.properties.action_link
        });

        return new Response(
          JSON.stringify({ 
            success: true,
            user: {
              id: user.id,
              email: user.email,
              email_confirmed_at: user.email_confirmed_at
            },
            action_link: recoveryData.properties.action_link,
            message: 'Auto-login successful - recovery link generated'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // All approaches failed
      logStep("All auto-login approaches failed", { 
        magicLinkError: magicLinkError?.message,
        signupError: signupError?.message,
        recoveryError: recoveryError?.message,
        userId: user.id 
      });

      return new Response(
        JSON.stringify({ 
          error: 'Failed to create auto-login link',
          details: 'All auto-login methods failed',
          retry: true
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );

    } catch (error) {
      logStep("Exception during session creation", { 
        error: error.message, 
        userId: user.id 
      });
      return new Response(
        JSON.stringify({ 
          error: 'Session creation failed',
          details: error.message
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

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
