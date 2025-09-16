import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[AUTO-CONFIRM] ${step}${detailsStr}`);
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

    const { userEmail } = await req.json();

    if (!userEmail) {
      logStep("Missing required parameter: userEmail");
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameter: userEmail' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    logStep("Processing auto-confirm request", { userEmail });

    // Find the user by email
    const { data: usersData, error: userError } = await supabaseClient.auth.admin.listUsers({
      filter: {
        email: userEmail
      }
    });

    if (userError) {
      logStep("Error finding user", { error: userError.message, userEmail });
      return new Response(
        JSON.stringify({ 
          error: 'Failed to find user',
          details: userError.message
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const user = usersData?.users?.[0];
    if (!user) {
      logStep("User not found", { userEmail });
      return new Response(
        JSON.stringify({ 
          error: 'User not found',
          details: 'No user found with the provided email'
        }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    logStep("User found", { 
      userId: user.id, 
      email: user.email,
      emailConfirmed: !!user.email_confirmed_at
    });

    // Auto-confirm the user's email if not already confirmed
    if (!user.email_confirmed_at) {
      logStep("Auto-confirming user email", { userId: user.id, email: user.email });
      
      const { error: confirmError } = await supabaseClient.auth.admin.updateUserById(user.id, {
        email_confirm: true
      });

      if (confirmError) {
        logStep("Error auto-confirming user email", { error: confirmError.message, userId: user.id });
        return new Response(
          JSON.stringify({ 
            error: 'Failed to confirm email',
            details: confirmError.message
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      logStep("User email auto-confirmed successfully", { userId: user.id });
    } else {
      logStep("User email already confirmed", { userId: user.id, confirmedAt: user.email_confirmed_at });
    }

    // Create a session for the user using magic link
    logStep("Creating session for user", { userId: user.id });
    
    try {
      const { data: magicLinkData, error: magicLinkError } = await supabaseClient.auth.admin.generateLink({
        type: 'magiclink',
        email: user.email!,
        options: {
          redirectTo: `${req.headers.get('origin') || 'http://localhost:3000'}/`
        }
      });

      if (magicLinkError || !magicLinkData.properties?.action_link) {
        logStep("Magic link generation failed", { 
          error: magicLinkError?.message, 
          userId: user.id 
        });
        return new Response(
          JSON.stringify({ 
            error: 'Failed to create session',
            details: magicLinkError?.message || 'No action link generated'
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      logStep("Session created successfully", { 
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
          message: 'User auto-confirmed and session created successfully'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );

    } catch (error) {
      logStep("Session creation failed", { error: error.message, userId: user.id });
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create session',
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
