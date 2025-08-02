
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-CANCELLATION-EMAIL] ${step}${detailsStr}`);
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
    logStep("Cancellation email function started");

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      logStep("RESEND_API_KEY missing");
      throw new Error("RESEND_API_KEY ist nicht konfiguriert");
    }

    logStep("RESEND_API_KEY found", { keyExists: !!resendKey, keyLength: resendKey.length });

    const resend = new Resend(resendKey);
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const requestBody = await req.json();
    const { 
      userEmail, 
      userName,
      isRefund = false,
      refundAmount = 0,
      subscriptionEnd,
      cancellationReason = 'Nutzerwunsch'
    } = requestBody;
    
    if (!userEmail) {
      throw new Error("User email is required");
    }

    logStep("Processing cancellation email", { userEmail, isRefund, refundAmount });

    // Get user language preference
    const userLanguage = await getUserLanguage(userEmail);
    logStep("Using language for cancellation email", { userEmail, language: userLanguage });

    // Get user profile for personalization
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('first_name')
      .eq('email', userEmail)
      .single();

    const finalUserName = userName || profile?.first_name || (userLanguage === 'en' ? 'Pet Friend' : 'Tierfreund');

    // Generate cancellation email content based on language
    const content = userLanguage === 'en' ? {
      subject: isRefund ? 
        "🔄 Your Refund from TierTrainer24" : 
        "📧 Cancellation Confirmation - TierTrainer24",
      title: isRefund ? "Refund Processed" : "Cancellation Confirmed",
      greeting: `Hello ${finalUserName},`,
      mainMessage: isRefund ? 
        `We have processed your refund of €${(refundAmount / 100).toFixed(2)}.` :
        "We have successfully processed your cancellation.",
      accessInfo: subscriptionEnd ? 
        `You can continue using TierTrainer24 until ${new Date(subscriptionEnd).toLocaleDateString('en-US')}.` :
        "Your access has been terminated.",
      supportText: "If you have any questions, please contact our support team.",
      dashboardLink: "Visit Dashboard",
      footerText: "Thank you for using TierTrainer24. We hope to see you again soon!",
      cancellationReason: cancellationReason ? `Reason: ${cancellationReason}` : ''
    } : {
      subject: isRefund ? 
        "🔄 Ihre Rückerstattung von TierTrainer24" : 
        "📧 Kündigungsbestätigung - TierTrainer24",
      title: isRefund ? "Rückerstattung bearbeitet" : "Kündigung bestätigt",
      greeting: `Hallo ${finalUserName},`,
      mainMessage: isRefund ? 
        `Wir haben Ihre Rückerstattung über €${(refundAmount / 100).toFixed(2)} bearbeitet.` :
        "Wir haben Ihre Kündigung erfolgreich bearbeitet.",
      accessInfo: subscriptionEnd ? 
        `Sie können TierTrainer24 noch bis zum ${new Date(subscriptionEnd).toLocaleDateString('de-DE')} nutzen.` :
        "Ihr Zugang wurde beendet.",
      supportText: "Bei Fragen wenden Sie sich gerne an unser Support-Team.",
      dashboardLink: "Zum Dashboard",
      footerText: "Vielen Dank für die Nutzung von TierTrainer24. Wir hoffen, Sie bald wieder begrüßen zu dürfen!",
      cancellationReason: cancellationReason ? `Grund: ${cancellationReason}` : ''
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
            
            <div style="background: ${isRefund ? '#10b981' : '#f59e0b'}; color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
              <h2 style="margin: 0 0 15px 0;">${content.title}</h2>
            </div>
            
            <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0;">
              <p style="margin: 0 0 15px 0; font-size: 16px;">${content.greeting}</p>
              <p style="margin: 0 0 15px 0; font-size: 16px;">${content.mainMessage}</p>
              <p style="margin: 0 0 15px 0; font-size: 16px;">${content.accessInfo}</p>
              ${content.cancellationReason ? `<p style="margin: 0 0 15px 0; font-size: 14px; color: #666;">${content.cancellationReason}</p>` : ''}
              <p style="margin: 0; font-size: 16px;">${content.supportText}</p>
            </div>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="https://tiertrainer24.com/mein-tiertraining" 
                 style="display: inline-block; background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                ${content.dashboardLink}
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
    const testMode = true; // TODO: Set to false for production
    const testEmail = "owydwaldt12@gmail.com";
    const finalRecipient = testMode ? testEmail : userEmail;

    let subject = emailTemplate.subject;

    if (testMode) {
      subject = `[TEST für ${userEmail}] ${subject}`;
      logStep("TEST MODE: Redirecting email", { originalEmail: userEmail, testEmail });
    }

    logStep("Sending cancellation email", { 
      to: finalRecipient, 
      subject, 
      testMode,
      userLanguage: userLanguage
    });

    const { data, error } = await resend.emails.send({
      from: "TierTrainer24 <noreply@mail.tiertrainer24.com>",
      to: [finalRecipient],
      subject,
      html: emailTemplate.html,
    });

    if (error) {
      logStep("Resend error", { error });
      throw new Error(`Failed to send email: ${error.message}`);
    }

    // Note: Email logging removed since we're using simplified approach
    logStep("Cancellation email sent successfully", { 
      emailId: data?.id, 
      testMode, 
      finalRecipient,
      userLanguage: userLanguage
    });

    return new Response(JSON.stringify({
      success: true,
      emailId: data?.id,
      testMode,
      originalRecipient: userEmail,
      finalRecipient,
      userLanguage: userLanguage,
      message: testMode ? `Test cancellation email sent to ${testEmail}` : "Cancellation email sent successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in send-cancellation-email", { message: errorMessage, stack: error?.stack });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      code: "INTERNAL_ERROR"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
