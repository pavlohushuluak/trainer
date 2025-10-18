/**
 * @fileoverview Auto-Login Device - Automatically login user based on device fingerprint
 * This function validates a device fingerprint and creates a session for the associated user
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { deviceFingerprint } = await req.json();

    if (!deviceFingerprint) {
      return new Response(
        JSON.stringify({ error: 'Device fingerprint is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log('🔐 [Auto-Login] Checking device binding for fingerprint:', deviceFingerprint.substring(0, 20) + '...');

    // Check if device binding exists and is valid
    const { data: binding, error: bindingError } = await supabaseAdmin
      .from('device_bindings')
      .select('user_email, last_used_at, expires_at, is_active')
      .eq('device_fingerprint', deviceFingerprint)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .order('last_used_at', { desc: true })
      .limit(1)
      .maybeSingle();

    if (bindingError) {
      console.error('❌ [Auto-Login] Error checking device binding:', bindingError);
      return new Response(
        JSON.stringify({ error: 'Failed to check device binding', hasBinding: false }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!binding) {
      console.log('ℹ️ [Auto-Login] No device binding found for this fingerprint');
      return new Response(
        JSON.stringify({ hasBinding: false }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ [Auto-Login] Device binding found for:', binding.user_email);

    // Debug: Check what email we're working with
    console.log('🔍 [Auto-Login] Email details:', {
      original: binding.user_email,
      trimmed: binding.user_email.trim(),
      lowercase: binding.user_email.toLowerCase(),
      length: binding.user_email.length,
      hasWhitespace: binding.user_email !== binding.user_email.trim()
    });

    // Check if user exists in subscribers table (this is our source of truth)
    console.log('🔍 [Auto-Login] Checking if user exists in subscribers table...');
    const { data: subscriber, error: subError } = await supabaseAdmin
      .from('subscribers')
      .select('email, user_id')
      .ilike('email', binding.user_email)
      .maybeSingle();

    console.log('🔍 [Auto-Login] Subscriber check result:', {
      found: !!subscriber,
      email: subscriber?.email,
      user_id: subscriber?.user_id,
      error: subError?.message
    });

    let emailToUse = binding.user_email.toLowerCase().trim();
    
    if (subError) {
      console.log('⚠️ [Auto-Login] Error querying subscribers:', subError.message);
    } else if (subscriber?.email) {
      console.log('✅ [Auto-Login] User found in subscribers! Using email:', subscriber.email);
      emailToUse = subscriber.email; // Use exact email from subscribers
    } else {
      console.error('❌ [Auto-Login] User not found in subscribers table for:', binding.user_email);
      console.error('💡 [Auto-Login] Cleaning up orphaned device binding...');
      
      // Clean up orphaned binding
      await supabaseAdmin
        .from('device_bindings')
        .delete()
        .eq('user_email', binding.user_email)
        .eq('device_fingerprint', deviceFingerprint);
      
      return new Response(
        JSON.stringify({ 
          hasBinding: false,
          error: 'User account not found',
          message: 'The account for this device no longer exists. Please signup again.',
          cleared: true
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate magic link for automatic login
    console.log('🔑 [Auto-Login] Generating magic link for verified email:', emailToUse);
    
    const { data: tokenData, error: tokenError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: emailToUse,
      options: {
        redirectTo: `${req.headers.get('origin') || Deno.env.get('SUPABASE_URL')}/mein-tiertraining`
      }
    });

    if (tokenError) {
      console.error('❌ [Auto-Login] Error generating magic link:', tokenError);
      console.error('Error details:', {
        message: tokenError.message,
        status: tokenError.status,
        code: tokenError.code
      });
      
      // Check if it's because user doesn't exist
      if (tokenError.message?.includes('User not found') || tokenError.message?.includes('not found')) {
        console.error('💡 [Auto-Login] User account not found - cleaning up orphaned binding');
        
        // Clean up orphaned binding
        await supabaseAdmin
          .from('device_bindings')
          .delete()
          .eq('user_email', binding.user_email)
          .eq('device_fingerprint', deviceFingerprint);
        
        return new Response(
          JSON.stringify({ 
            hasBinding: false,
            error: 'User account not found',
            message: 'The account for this device no longer exists. You can now signup with any email.',
            cleared: true
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Other errors - allow manual login
      return new Response(
        JSON.stringify({ 
          hasBinding: true, 
          email: binding.user_email,
          error: 'Failed to generate auto-login link',
          actionLink: null
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!tokenData?.properties?.action_link) {
      console.error('❌ [Auto-Login] No action link in response');
      console.error('Token data:', tokenData);
      return new Response(
        JSON.stringify({ 
          hasBinding: true, 
          email: binding.user_email,
          error: 'No action link generated',
          actionLink: null
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅✅✅ [Auto-Login] Magic link generated successfully! ✅✅✅');
    console.log('🎉 [Auto-Login] Action link:', tokenData.properties.action_link?.substring(0, 80) + '...');

    // Update last_used_at for the device binding
    await supabaseAdmin
      .from('device_bindings')
      .update({ last_used_at: new Date().toISOString() })
      .eq('device_fingerprint', deviceFingerprint)
      .eq('user_email', binding.user_email);

    console.log('🚀 [Auto-Login] Returning success response for:', emailToUse);

    // Return the action link which will automatically log the user in
    return new Response(
      JSON.stringify({
        success: true,
        hasBinding: true,
        email: emailToUse,
        actionLink: tokenData.properties.action_link,
        hashed_token: tokenData.properties.hashed_token
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ [Auto-Login] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error.message, hasBinding: false }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

