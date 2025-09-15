import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyCodeRequest {
  email: string;
  code: string;
}

interface VerifyCodeResponse {
  success: boolean;
  message?: string;
  user?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, code }: VerifyCodeRequest = await req.json();

    if (!email || !code) {
      return new Response(
        JSON.stringify({ success: false, message: 'Email and code are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if the code exists and is valid
    const { data: verificationData, error: verificationError } = await supabase
      .from('signup_verification_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .eq('used', false)
      .single();

    if (verificationError || !verificationData) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid verification code' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if code has expired (1 hour = 3600000 ms)
    const now = new Date();
    const createdAt = new Date(verificationData.created_at);
    const timeDiff = now.getTime() - createdAt.getTime();
    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

    if (timeDiff > oneHour) {
      return new Response(
        JSON.stringify({ success: false, message: 'Verification code has expired' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Mark the code as used
    await supabase
      .from('signup_verification_codes')
      .update({ used: true, used_at: new Date().toISOString() })
      .eq('id', verificationData.id);

    // Get the user from auth.users
    const { data: userData, error: userError } = await supabase.auth.admin.getUserByEmail(email);

    if (userError || !userData.user) {
      return new Response(
        JSON.stringify({ success: false, message: 'User not found' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Confirm the user's email
    const { error: confirmError } = await supabase.auth.admin.updateUserById(
      userData.user.id,
      { email_confirm: true }
    );

    if (confirmError) {
      console.error('Error confirming user email:', confirmError);
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to confirm email' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email verified successfully',
        user: userData.user
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in verify-signup-code:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
