
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import React from "npm:react@18.3.1";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { SupportTicketEmail } from "./_templates/support-ticket-email.tsx";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-SUPPORT-NOTIFICATION] ${step}${detailsStr}`);
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

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      logStep("RESEND_API_KEY missing");
      throw new Error("RESEND_API_KEY ist nicht konfigriert");
    }

    logStep("RESEND_API_KEY found", { keyExists: !!resendKey, keyLength: resendKey.length });

    const resend = new Resend(resendKey);
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const requestBody = await req.json();
    const { 
      emailType, 
      userEmail, 
      userName, 
      ticketId, 
      ticketSubject, 
      adminMessage,
      ticketStatus 
    } = requestBody;
    
    if (!userEmail || !ticketId) {
      throw new Error("User email and ticket ID are required");
    }

    logStep("Support notification request received", { emailType, userEmail, ticketId });

    // Get user language preference
    const userLanguage = await getUserLanguage(userEmail);
    logStep("Using language for support notification", { userEmail, language: userLanguage });

    // Get user profile for personalization
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('first_name')
      .eq('email', userEmail)
      .single();

    const finalUserName = userName || profile?.first_name || (userLanguage === 'en' ? 'Customer' : 'Kunde');

    // Generate email HTML using React template
    const html = await renderAsync(
      React.createElement(SupportTicketEmail, {
        emailType,
        userName: finalUserName,
        ticketId,
        ticketSubject,
        adminMessage,
        ticketStatus
      })
    );

    // Determine test mode and recipient
    const testMode = true; // TODO: Set to false for production
    const testEmail = "owydwaldt12@gmail.com";
    const finalRecipient = testMode ? testEmail : userEmail;

    let subject = '';
    if (userLanguage === 'en') {
      switch (emailType) {
        case 'ticket_created':
          subject = `Support Ticket #${ticketId.slice(-8)} Created`;
          break;
        case 'ticket_response':
          subject = `Response to Your Support Ticket #${ticketId.slice(-8)}`;
          break;
        case 'ticket_resolved':
          subject = `Support Ticket #${ticketId.slice(-8)} Resolved`;
          break;
        default:
          subject = `Update on Your Support Ticket #${ticketId.slice(-8)}`;
      }
    } else {
      switch (emailType) {
        case 'ticket_created':
          subject = `Support-Ticket #${ticketId.slice(-8)} erstellt`;
          break;
        case 'ticket_response':
          subject = `Antwort auf Ihr Support-Ticket #${ticketId.slice(-8)}`;
          break;
        case 'ticket_resolved':
          subject = `Support-Ticket #${ticketId.slice(-8)} wurde gelöst`;
          break;
        default:
          subject = `Update zu Ihrem Support-Ticket #${ticketId.slice(-8)}`;
      }
    }

    if (testMode) {
      subject = `[TEST für ${userEmail}] ${subject}`;
      logStep("TEST MODE: Redirecting email", { originalEmail: userEmail, testEmail });
    }

    logStep("Sending support notification", { to: finalRecipient, subject, testMode });

    const { data, error } = await resend.emails.send({
      from: "TierTrainer24 Support <noreply@send.tiertrainer24.com>",
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
      type: 'support_notification',
      title: subject,
      message: `Support-E-Mail versendet an ${userEmail}`,
      user_id: null,
      status: 'sent'
    });

    logStep("Support notification sent successfully", { emailId: data?.id, testMode, finalRecipient });

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
    logStep("ERROR in send-support-notification", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
