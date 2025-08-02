
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Standardized email sender - using consistent verified domain
const EMAIL_FROM = "TierTrainer24 <noreply@mail.tiertrainer24.com>";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-TEST-EMAIL] ${step}${detailsStr}`);
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
    logStep("Test email function started");

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      logStep("RESEND_API_KEY missing");
      return new Response(JSON.stringify({ 
        success: false,
        error: "RESEND_API_KEY ist nicht konfiguriert",
        troubleshooting: "Bitte RESEND_API_KEY in Supabase Edge Function Secrets hinzufügen"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    logStep("RESEND_API_KEY found", { 
      keyExists: !!resendKey, 
      keyLength: resendKey.length,
      keyPrefix: resendKey.substring(0, 8) + "..."
    });

    const resend = new Resend(resendKey);
    
    const requestBody = await req.json();
    const { recipientEmail } = requestBody;
    
    if (!recipientEmail) {
      return new Response(JSON.stringify({ 
        success: false,
        error: "Recipient email is required" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Get user language preference
    const userLanguage = await getUserLanguage(recipientEmail);
    logStep("Using language for test email", { email: recipientEmail, language: userLanguage });

    // Generate content based on language
    const content = userLanguage === 'en' ? {
      subject: "🧪 Test Email - TierTrainer24 Configuration",
      title: "🐾 Email Configuration Test",
      greeting: "Hello!",
      description: "This is a test email to verify the email configuration of TierTrainer24.",
      detailsTitle: "✅ Test Details:",
      details: [
        `Sender Domain: ${EMAIL_FROM}`,
        `Test Recipient: ${recipientEmail}`,
        `Date: ${new Date().toLocaleString('en-US')}`,
        `Edge Function: send-test-email`
      ],
      successMessage: "If you receive this email, the basic configuration is working correctly.",
      footer: "TierTrainer24 - System Test"
    } : {
      subject: "🧪 Test E-Mail - TierTrainer24 Konfiguration",
      title: "🐾 E-Mail-Konfiguration Test",
      greeting: "Hallo!",
      description: "Dies ist eine Test-E-Mail zur Überprüfung der E-Mail-Konfiguration von TierTrainer24.",
      detailsTitle: "✅ Test Details:",
      details: [
        `Sender-Domain: ${EMAIL_FROM}`,
        `Test-Empfänger: ${recipientEmail}`,
        `Datum: ${new Date().toLocaleString('de-DE')}`,
        `Edge Function: send-test-email`
      ],
      successMessage: "Wenn Sie diese E-Mail erhalten, funktioniert die Grundkonfiguration korrekt.",
      footer: "TierTrainer24 - System Test"
    };

    logStep("Sending test email", { recipientEmail, fromAddress: EMAIL_FROM, language: userLanguage });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #22c55e;">${content.title}</h1>
        <p>${content.greeting}</p>
        <p>${content.description}</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #333;">${content.detailsTitle}</h3>
          <ul style="color: #666; margin: 0;">
            ${content.details.map(detail => `<li>${detail}</li>`).join('')}
          </ul>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          ${content.successMessage}
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #898989; font-size: 12px; text-align: center;">
          ${content.footer}
        </p>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: [recipientEmail],
      subject: content.subject,
      html,
    });

    if (error) {
      logStep("Resend error", { error });
      
      // Enhanced error handling with specific messages
      let errorMessage = error.message || 'Unknown error';
      let troubleshooting = '';
      
      if (errorMessage.includes('API key is invalid') || errorMessage.includes('Invalid API key')) {
        troubleshooting = "1. Überprüfen Sie RESEND_API_KEY in Supabase Edge Function Secrets\n2. Erstellen Sie einen neuen API-Key in Resend\n3. Warten Sie 1-2 Minuten nach dem Update";
      } else if (errorMessage.includes('domain') || errorMessage.includes('verified')) {
        troubleshooting = "1. Gehen Sie zu https://resend.com/domains\n2. Verifizieren Sie mail.tiertrainer24.com\n3. Stellen Sie sicher, dass DNS-Einträge korrekt sind";
      } else {
        troubleshooting = "Überprüfen Sie die Netzwerkverbindung und Resend-Status";
      }
      
      return new Response(JSON.stringify({ 
        success: false,
        error: errorMessage,
        troubleshooting,
        resendError: error
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    logStep("Test email sent successfully", { 
      emailId: data?.id, 
      recipientEmail,
      fromAddress: EMAIL_FROM
    });

    return new Response(JSON.stringify({
      success: true,
      emailId: data?.id,
      recipientEmail,
      fromAddress: EMAIL_FROM,
      subject: content.subject,
      message: "Test email sent successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in send-test-email", { message: errorMessage });
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage,
      troubleshooting: errorMessage.includes('domain') ? 
        "Verify mail.tiertrainer24.com in Resend dashboard" :
        errorMessage.includes('API key') ?
        "Check RESEND_API_KEY in Supabase Edge Function Secrets" :
        "Check network connectivity and configuration"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
