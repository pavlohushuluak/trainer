import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailChangeConfirmation {
  token: string;
  userId: string;
  newEmail: string;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CONFIRM-EMAIL-CHANGE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    logStep('Starting email change confirmation function');
    
    // Check for required environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !serviceRoleKey) {
      logStep('Missing environment variables', { 
        hasSupabaseUrl: !!supabaseUrl, 
        hasServiceRoleKey: !!serviceRoleKey 
      });
      return new Response(
        JSON.stringify({ 
          error: 'Missing required environment variables',
          success: false 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse request body
    const requestBody: EmailChangeConfirmation = await req.json();
    logStep('Received confirmation request', { 
      userId: requestBody.userId,
      newEmail: requestBody.newEmail,
      hasToken: !!requestBody.token
    });

    // Validate required fields
    if (!requestBody.userId || !requestBody.newEmail || !requestBody.token) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: userId, newEmail, token',
          success: false 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // First, verify the user exists and get current email
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(requestBody.userId);
    
    if (userError || !user) {
      logStep('User not found', { error: userError, userId: requestBody.userId });
      return new Response(
        JSON.stringify({ 
          error: 'User not found',
          success: false 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verify the confirmation token from the profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email_change_token, pending_email')
      .eq('id', requestBody.userId)
      .single();

    if (profileError || !profile) {
      logStep('Profile not found', { error: profileError, userId: requestBody.userId });
      return new Response(
        JSON.stringify({ 
          error: 'Profile not found',
          success: false 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if the token matches and if the pending email matches
    if (profile.email_change_token !== requestBody.token) {
      logStep('Invalid confirmation token', { 
        providedToken: requestBody.token,
        storedToken: profile.email_change_token,
        userId: requestBody.userId
      });
      return new Response(
        JSON.stringify({ 
          error: 'Invalid or expired confirmation token',
          success: false 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (profile.pending_email !== requestBody.newEmail) {
      logStep('Email mismatch', { 
        providedEmail: requestBody.newEmail,
        pendingEmail: profile.pending_email,
        userId: requestBody.userId
      });
      return new Response(
        JSON.stringify({ 
          error: 'Email address mismatch',
          success: false 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    logStep('Found user', { 
      userId: user.id, 
      currentEmail: user.email,
      newEmail: requestBody.newEmail
    });

    // Check if the new email is already in use by another user
    const { data: existingUser, error: checkError } = await supabase.auth.admin.listUsers();
    
    if (checkError) {
      logStep('Error checking existing users', { error: checkError });
      return new Response(
        JSON.stringify({ 
          error: 'Failed to check email availability',
          success: false 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const emailAlreadyExists = existingUser.users.some(u => 
      u.email === requestBody.newEmail && u.id !== requestBody.userId
    );

    if (emailAlreadyExists) {
      logStep('Email already in use', { newEmail: requestBody.newEmail });
      return new Response(
        JSON.stringify({ 
          error: 'Email address is already in use by another account',
          success: false 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Update the user's email in Supabase Auth
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      requestBody.userId,
      { email: requestBody.newEmail, email_confirm: true }
    );

    if (updateError) {
      logStep('Auth update error', { error: updateError });
      return new Response(
        JSON.stringify({ 
          error: `Failed to update email in authentication: ${updateError.message}`,
          success: false 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    logStep('Auth email updated successfully');

    // Update the email in the profiles table
    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({
        email: requestBody.newEmail,
        updated_at: new Date().toISOString()
      })
      .eq('id', requestBody.userId);

    if (profileUpdateError) {
      logStep('Profile update error', { error: profileUpdateError });
      // Even if profile update fails, the auth email was updated
      // We'll log this but still return success
      logStep('Warning: Profile update failed but auth email was updated', { error: profileUpdateError });
    } else {
      logStep('Profile email updated successfully');
    }

    // Update the email in the subscribers table
    try {
      const { error: subscriberUpdateError } = await supabase
        .from('subscribers')
        .update({
          email: requestBody.newEmail,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', requestBody.userId);

      if (subscriberUpdateError) {
        logStep('Warning: Could not update subscribers table', { error: subscriberUpdateError });
      } else {
        logStep('Subscribers table email updated successfully');
      }
    } catch (subscriberError) {
      logStep('Warning: Exception while updating subscribers table', { error: subscriberError });
    }

    // Update the email in the admin_users table if user is an admin
    try {
      const { error: adminUpdateError } = await supabase
        .from('admin_users')
        .update({
          email: requestBody.newEmail,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', requestBody.userId);

      if (adminUpdateError) {
        logStep('Warning: Could not update admin_users table', { error: adminUpdateError });
      } else {
        logStep('Admin_users table email updated successfully');
      }
    } catch (adminError) {
      logStep('Warning: Exception while updating admin_users table', { error: adminError });
    }

    // Update any other tables that might reference the user's email
    // This is a catch-all for any future tables that might be added
    try {
      // Update language_support table if it exists and has user_email field
      const { error: languageUpdateError } = await supabase
        .from('language_support')
        .update({
          user_email: requestBody.newEmail,
          updated_at: new Date().toISOString()
        })
        .eq('user_email', user.email);

      if (languageUpdateError) {
        // This is expected if the table doesn't exist or the field doesn't exist
        logStep('Info: language_support table update not needed or not possible', { error: languageUpdateError });
      } else {
        logStep('Language_support table email updated successfully');
      }
    } catch (languageError) {
      // This is expected if the table doesn't exist
      logStep('Info: language_support table update not needed', { error: languageError });
    }

    // Clear any pending email change data if it exists
    try {
      await supabase
        .from('profiles')
        .update({
          pending_email: null,
          email_change_requested_at: null,
          email_change_token: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestBody.userId);
      
      logStep('Cleared pending email change data');
    } catch (clearError) {
      logStep('Warning: Could not clear pending email change data', { error: clearError });
    }

    // Force logout all user sessions by invalidating refresh tokens
    try {
      const { error: logoutError } = await supabase.auth.admin.invalidateUserSessions(requestBody.userId);
      
      if (logoutError) {
        logStep('Warning: Could not invalidate user sessions', { error: logoutError });
      } else {
        logStep('Successfully invalidated all user sessions - user will need to login again');
      }
    } catch (logoutError) {
      logStep('Warning: Exception while invalidating user sessions', { error: logoutError });
    }

    logStep('Email change confirmation completed successfully', {
      userId: requestBody.userId,
      oldEmail: user.email,
      newEmail: requestBody.newEmail
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email changed successfully',
        oldEmail: user.email,
        newEmail: requestBody.newEmail
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    logStep('Error in email change confirmation function', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
