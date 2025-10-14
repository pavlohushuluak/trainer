/**
 * @fileoverview Edge Function to send email notifications for manual support responses
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import React from "npm:react@18.3.1";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { ManualSupportEmail } from "./_templates/manual-support-email.tsx";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-MANUAL-SUPPORT-RESPONSE] ${step}${detailsStr}`);
};

// Get user language preference from database
const getUserLanguage = async (email: string): Promise<string> => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data, error } = await supabase.rpc('get_language_support', {
      user_email: email
    });

    if (error) {
      logStep('Language query error', { error, email });
      return 'de'; // Default to German
    }

    const language = data || 'de';
    logStep('Retrieved user language', { email, language });
    return language;
  } catch (error) {
    logStep('Language query exception', { error, email });
    return 'de'; // Default to German
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Check for Resend API key
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      logStep("RESEND_API_KEY missing");
      throw new Error("RESEND_API_KEY is not configured");
    }

    logStep("RESEND_API_KEY found");
    const resend = new Resend(resendKey);

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Parse request body
    const requestBody = await req.json();
    const { 
      userEmail, 
      userName, 
      subject,
      userMessage,
      adminResponse,
      priority,
      requestId
    } = requestBody;

    // Validate required fields
    if (!userEmail || !requestId || !adminResponse) {
      throw new Error("User email, request ID, and admin response are required");
    }

    logStep("Manual support response email request received", { 
      userEmail, 
      requestId, 
      priority,
      hasAdminResponse: !!adminResponse 
    });

    // Get user language preference
    const userLanguage = await getUserLanguage(userEmail);
    logStep("Using language for email", { userEmail, language: userLanguage });

    // Get user profile for personalization
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('first_name')
      .eq('email', userEmail)
      .single();

    const finalUserName = userName || profile?.first_name || (userLanguage === 'en' ? 'Customer' : 'Kunde');

    // Generate email HTML using React template
    const html = await renderAsync(
      React.createElement(ManualSupportEmail, {
        userName: finalUserName,
        userMessage: userMessage || 'No message provided',
        subject: subject || 'Support Request',
        adminResponse,
        priority: priority || 'normal',
        requestId,
        language: userLanguage
      })
    );

    // Determine test mode and recipient
    const testMode = true; // Set to false for production
    const testEmail = "owydwaldt12@gmail.com";
    const finalRecipient = testMode ? testEmail : userEmail;

    // Generate email subject based on language
    const shortId = requestId.slice(-8);
    const emailSubject = userLanguage === 'en'
      ? `Response to Your Support Request #${shortId}`
      : `Antwort auf Ihre Support-Anfrage #${shortId}`;

    const finalSubject = testMode 
      ? `[TEST for ${userEmail}] ${emailSubject}`
      : emailSubject;

    logStep("Sending manual support response email", { 
      to: finalRecipient, 
      subject: finalSubject, 
      testMode,
      originalEmail: userEmail 
    });

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: "TierTrainer24 Support <support@mail.tiertrainer24.com>",
      to: [finalRecipient],
      subject: finalSubject,
      html,
    });

    if (error) {
      logStep("Resend error", { error });
      throw new Error(`Failed to send email: ${error.message}`);
    }

    // Log email for tracking
    await supabaseClient.from('system_notifications').insert({
      type: 'manual_support_response',
      title: emailSubject,
      message: `Manual support response email sent to ${userEmail}`,
      user_id: null,
      status: 'sent'
    });

    logStep("Manual support response email sent successfully", { 
      emailId: data?.id, 
      testMode, 
      finalRecipient,
      originalRecipient: userEmail 
    });

    return new Response(JSON.stringify({
      success: true,
      emailId: data?.id,
      testMode,
      originalRecipient: userEmail,
      finalRecipient,
      message: testMode 
        ? `Test email sent to ${testEmail} (original recipient: ${userEmail})` 
        : "Email sent successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in send-manual-support-response", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

