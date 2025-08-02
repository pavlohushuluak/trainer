
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import React from "npm:react@18.3.1";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { PaymentNotificationEmail } from "./_templates/payment-notification-email.tsx";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-PAYMENT-NOTIFICATION] ${step}${detailsStr}`);
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
    logStep("Payment notification function started");

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY is not set");

    const resend = new Resend(resendKey);
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { 
      userEmail,
      userName, 
      paymentType,
      amount,
      currency,
      nextRetry,
      failureReason
    } = await req.json();
    
    if (!userEmail) throw new Error("User email is required");

    logStep("Processing payment notification", { paymentType, userEmail, amount });

    // Get user language preference
    const userLanguage = await getUserLanguage(userEmail);
    logStep("Using language for payment notification", { userEmail, language: userLanguage });

    // Get user profile for personalization
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('first_name')
      .eq('email', userEmail)
      .single();

    const finalUserName = userName || profile?.first_name || (userLanguage === 'en' ? 'Customer' : 'Kunde');

    // Generate email HTML using React template
    const html = await renderAsync(
      React.createElement(PaymentNotificationEmail, {
        userName: finalUserName,
        paymentType,
        amount,
        currency: currency || 'EUR',
        nextRetry,
        failureReason
      })
    );

    // Determine test mode and recipient
    const testMode = true; // TODO: Set to false for production
    const testEmail = "owydwaldt12@gmail.com";
    const finalRecipient = testMode ? testEmail : userEmail;

    let subject = '';
    if (userLanguage === 'en') {
      switch (paymentType) {
        case 'payment_failed':
          subject = '⚠️ Payment Issue with Your TierTrainer Subscription';
          break;
        case 'payment_retry':
          subject = '🔄 Payment Retry Attempt - TierTrainer';
          break;
        case 'payment_method_required':
          subject = '💳 Update Payment Method - TierTrainer';
          break;
        default:
          subject = '💰 Payment Required - TierTrainer';
      }
    } else {
      switch (paymentType) {
        case 'payment_failed':
          subject = '⚠️ Zahlungsproblem bei Ihrem TierTrainer-Abo';
          break;
        case 'payment_retry':
          subject = '🔄 Zahlung wird erneut versucht - TierTrainer';
          break;
        case 'payment_method_required':
          subject = '💳 Zahlungsmethode aktualisieren - TierTrainer';
          break;
        default:
          subject = '💰 Zahlung erforderlich - TierTrainer';
      }
    }

    if (testMode) {
      subject = `[TEST für ${userEmail}] ${subject}`;
    }

    logStep("Sending payment notification", { to: finalRecipient, subject, testMode });

    const { data, error } = await resend.emails.send({
      from: "TierTrainer24 <noreply@send.tiertrainer24.com>",
      to: [finalRecipient],
      subject,
      html,
    });

    if (error) {
      logStep("Resend error", { error });
      throw new Error(`Failed to send email: ${error.message}`);
    }

    // Log email for tracking
    await supabaseClient.from('system_notifications').insert({
      type: 'payment_notification',
      title: subject,
      message: `Zahlungs-E-Mail versendet an ${userEmail}`,
      user_id: null,
      status: 'sent'
    });

    logStep("Payment notification sent successfully", { emailId: data?.id, testMode, finalRecipient });

    return new Response(JSON.stringify({
      success: true,
      emailId: data?.id,
      testMode,
      originalRecipient: userEmail,
      finalRecipient,
      message: testMode ? `Test email sent to ${testEmail}` : "Email sent successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in send-payment-notification", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
