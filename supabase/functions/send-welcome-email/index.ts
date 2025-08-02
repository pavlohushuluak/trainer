
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { validateEmailSetup } from "./utils/emailValidation.ts";
import { testEmailFunction } from "./utils/testEmailFunction.ts";
import { logStep } from "./utils/logger.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Standardized email sender - using consistent verified domain
const EMAIL_FROM = "TierTrainer24 <noreply@mail.tiertrainer24.com>";

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

    const requestBody = await req.json();
    logStep("Request body received", requestBody);

    // Handle validation request
    if (requestBody.validate) {
      logStep("Email validation requested");
      
      const resendKey = Deno.env.get("RESEND_API_KEY");
      logStep("Checking RESEND_API_KEY", { 
        keyExists: !!resendKey, 
        keyLength: resendKey?.length,
        keyPrefix: resendKey ? resendKey.substring(0, 8) + "..." : "not_found"
      });
      
      if (!resendKey) {
        logStep("RESEND_API_KEY missing - returning validation error");
        return new Response(JSON.stringify({
          valid: false,
          error: "RESEND_API_KEY ist nicht in den Supabase Secrets konfiguriert",
          details: {
            apiKeyValid: false,
            apiKeyType: "missing",
            domainsConfigured: false,
            canSendEmails: false,
            troubleshooting: "Bitte überprüfen Sie die Edge Function Secrets in Supabase"
          }
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
      try {
        const validationResult = await validateEmailSetup(resendKey);
        logStep("Validation completed", { valid: validationResult.valid });
        return new Response(JSON.stringify(validationResult), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      } catch (validationError) {
        logStep("Validation error caught", { error: validationError.message });
        return new Response(JSON.stringify({
          valid: false,
          error: `Validation failed: ${validationError.message}`,
          details: {
            apiKeyValid: false,
            apiKeyType: "validation_failed",
            domainsConfigured: false,
            canSendEmails: false
          }
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
    }

    // Handle test request
    if (requestBody.test) {
      logStep("Function test requested");
      try {
        const testResult = await testEmailFunction();
        return new Response(JSON.stringify(testResult), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      } catch (testError) {
        logStep("Test function error", { error: testError.message });
        return new Response(JSON.stringify({
          success: false,
          error: `Test failed: ${testError.message}`
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
    }

    // Check if RESEND_API_KEY exists for regular email sending
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      logStep("RESEND_API_KEY missing for email send");
      return new Response(JSON.stringify({ 
        error: "RESEND_API_KEY ist nicht konfiguriert",
        code: "MISSING_API_KEY"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    logStep("RESEND_API_KEY found for email send", { 
      keyExists: !!resendKey, 
      keyLength: resendKey.length,
      keyPrefix: resendKey.substring(0, 8) + "..."
    });

    const resend = new Resend(resendKey);
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { 
      emailType,
      userEmail, 
      userName, 
      planName,
      amount,
      interval,
      trialEndDate,
      magicLink,
      confirmationLink,
      inviteLink,
      invitedBy,
      bypassTestMode = false
    } = requestBody;
    
    if (!userEmail) {
      logStep("Missing userEmail parameter");
      return new Response(JSON.stringify({ 
        error: "User email is required",
        code: "MISSING_EMAIL"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    logStep("Email request received", { emailType, userEmail, planName, bypassTestMode });

    // Get user language preference
    const userLanguage = await getUserLanguage(userEmail);
    logStep("Using language for email", { userEmail, language: userLanguage });

    // Get user profile for personalization
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('first_name')
      .eq('email', userEmail)
      .single();

    const finalUserName = userName || profile?.first_name || (userLanguage === 'en' ? 'Pet Friend' : 'Tierfreund');

    // Generate simple email template based on language
    const content = userLanguage === 'en' ? {
      subject: `🐾 Welcome to TierTrainer24, ${finalUserName}!`,
      title: `Welcome, ${finalUserName}! 🎉`,
      subtitle: 'Your professional dog training journey starts now',
      mainText: `Thank you for joining TierTrainer24! We're excited to help you and your four-legged friend build a strong and happy relationship.`,
      planInfo: `Your plan: ${planName || 'TierTrainer'} - €${amount || '19.99'}/${interval || 'month'}`,
      trialInfo: trialEndDate ? `Your trial period ends: ${trialEndDate}` : '',
      dashboardText: 'Start your training journey now:',
      buttonText: 'Go to Dashboard',
      footerText: 'Welcome to the TierTrainer24 family! 🐕❤️'
    } : {
      subject: `🐾 Willkommen bei TierTrainer24, ${finalUserName}!`,
      title: `Willkommen, ${finalUserName}! 🎉`,
      subtitle: 'Ihre professionelle Hundeerziehung beginnt jetzt',
      mainText: `Vielen Dank, dass Sie sich für TierTrainer24 entschieden haben! Wir freuen uns darauf, Ihnen und Ihrem Vierbeiner zu einer starken und glücklichen Beziehung zu verhelfen.`,
      planInfo: `Ihr Plan: ${planName || 'TierTrainer'} - €${amount || '19.99'}/${interval || 'Monat'}`,
      trialInfo: trialEndDate ? `Ihre Testphase endet: ${trialEndDate}` : '',
      dashboardText: 'Starten Sie jetzt Ihre Trainingsreise:',
      buttonText: 'Zum Dashboard',
      footerText: 'Willkommen in der TierTrainer24-Familie! 🐕❤️'
    };

    const emailTemplate = {
      subject: content.subject,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0;">🐾 TierTrainer24</h1>
              <p style="color: #666; margin: 5px 0;">Professional Dog Training</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
              <h2 style="margin: 0 0 15px 0;">${content.title}</h2>
              <p style="margin: 0; font-size: 16px;">${content.subtitle}</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0;">
              <p style="margin: 0 0 20px 0; font-size: 16px;">${content.mainText}</p>
              <p style="margin: 0 0 15px 0; font-size: 16px; color: #2563eb; font-weight: bold;">${content.planInfo}</p>
              ${content.trialInfo ? `<p style="margin: 0 0 15px 0; font-size: 14px; color: #666;">${content.trialInfo}</p>` : ''}
              <p style="margin: 0; font-size: 16px;">${content.dashboardText}</p>
            </div>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="https://tiertrainer24.com/mein-tiertraining" 
                 style="display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                ${content.buttonText}
              </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px;">
              <p style="margin: 0;">${content.footerText}</p>
              <p style="margin: 15px 0 0 0;">© 2024 TierTrainer24</p>
            </div>
          </body>
        </html>
      `
    };

    // Determine test mode and recipient
    const testMode = !bypassTestMode;
    const testEmail = "owydwaldt12@gmail.com";
    const finalRecipient = testMode ? testEmail : userEmail;

    logStep("Sending email", { 
      to: finalRecipient, 
      subject: emailTemplate.subject, 
      testMode, 
      emailType,
      fromAddress: EMAIL_FROM,
      bypassTestMode,
      userLanguage: userLanguage
    });

    try {
      const { data, error } = await resend.emails.send({
        from: EMAIL_FROM,
        to: [finalRecipient],
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      });

      if (error) {
        logStep("Resend error", { error });
        
        // Enhanced error handling for common issues
        if (error.message?.includes('API key is invalid') || error.message?.includes('Invalid API key')) {
          return new Response(JSON.stringify({ 
            error: "Invalid API key. Please check your Resend API key configuration.",
            code: "INVALID_API_KEY",
            resendError: error.message,
            troubleshooting: "1. Check RESEND_API_KEY in Supabase Edge Function Secrets\n2. Verify the API key is active in Resend dashboard\n3. Restart Edge Functions after updating"
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 401,
          });
        }
        
        if (error.message?.includes('domain') || error.message?.includes('verified')) {
          return new Response(JSON.stringify({ 
            error: "Domain verification required. mail.tiertrainer24.com must be verified in Resend.",
            code: "DOMAIN_NOT_VERIFIED",
            resendError: error.message,
            troubleshooting: "1. Go to https://resend.com/domains\n2. Add mail.tiertrainer24.com\n3. Complete DNS verification\n4. Try sending again"
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          });
        }
        
        return new Response(JSON.stringify({ 
          error: `Failed to send email: ${error.message}`,
          code: "EMAIL_SEND_FAILED",
          resendError: error.message
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      // Note: Email logging removed since we're using simplified approach
      logStep("Email sent successfully", { 
        emailId: data?.id, 
        testMode, 
        finalRecipient, 
        emailType,
        fromAddress: EMAIL_FROM,
        bypassTestMode,
        userLanguage: userLanguage
      });

      return new Response(JSON.stringify({
        success: true,
        emailId: data?.id,
        testMode,
        originalRecipient: userEmail,
        finalRecipient,
        emailType,
        fromAddress: EMAIL_FROM,
        bypassTestMode,
        userLanguage: userLanguage,
        message: testMode ? `Test email sent to ${testEmail}` : "Email sent successfully"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });

    } catch (sendError) {
      logStep("Email sending exception", { error: sendError.message });
      return new Response(JSON.stringify({ 
        error: `Email sending failed: ${sendError.message}`,
        code: "SEND_EXCEPTION",
        troubleshooting: "Check network connectivity and API key validity"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in send-welcome-email", { message: errorMessage, stack: error?.stack });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      code: "INTERNAL_ERROR"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
