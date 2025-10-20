/**
 * @fileoverview Send Trial Expiration Email Edge Function
 * Sends professional email notification when user's trial expires
 * Note: trial_confirm is NOT updated here - only when user clicks "View Subscription Plans" button
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, data?: any) => {
  console.log(`[send-trial-expiration-email] ${step}`, data ? JSON.stringify(data, null, 2) : "");
};

/**
 * Get user language preference from profile or default to German
 */
const getUserLanguage = async (userEmail: string, supabaseClient: any): Promise<'de' | 'en'> => {
  try {
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('language')
      .eq('email', userEmail)
      .single();

    return profile?.language === 'en' ? 'en' : 'de';
  } catch (error) {
    logStep("Error getting user language, defaulting to German", { error: error.message });
    return 'de';
  }
};

/**
 * Format date for display in email
 */
const formatDate = (dateString: string, language: 'de' | 'en'): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  return date.toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', options);
};

/**
 * Generate email HTML (simple version without React)
 */
const generateEmailHTML = (userName: string, trialEndDate: string, language: 'de' | 'en'): string => {
  const isGerman = language === 'de';
  
  const content = isGerman ? {
    heading: 'Ihre kostenlose Testphase ist abgelaufen',
    greeting: `Hallo ${userName},`,
    paragraph1: 'Ihre 7-tägige kostenlose Testphase für TierTrainer24 ist am',
    paragraph2: 'abgelaufen. Wir hoffen, Sie konnten unsere professionellen Trainingsservices genießen!',
    featuresTitle: 'Was Sie mit einem Abo erhalten:',
    feature1: '✅ Unbegrenzter Chat mit professionellen Trainern',
    feature2: '✅ Personalisierte Trainingspläne von Experten-Trainern',
    feature3: '✅ Foto-Analyse mit Verhaltensbeurteilung durch Trainer',
    feature4: '✅ Fortschrittsverfolgung mit Trainer-Unterstützung',
    feature5: '✅ 24/7 Zugang zu professionellem Trainer-Support',
    priceInfo: 'Unsere Pläne beginnen ab',
    priceValue: '9,99€ / Monat',
    ctaButton: 'Abo-Pläne ansehen',
    guaranteeTitle: '14-Tage-Geld-zurück-Garantie',
    guaranteeText: 'Wenn Sie nicht 100% zufrieden sind, erhalten Sie Ihr Geld zurück. Keine Fragen gestellt.',
    footer1: 'Vielen Dank, dass Sie TierTrainer24 ausprobiert haben!',
    footer2: 'Ihr TierTrainer24 Team - Echte Trainer, echte Ergebnisse',
  } : {
    heading: 'Your Free Trial Has Expired',
    greeting: `Hello ${userName},`,
    paragraph1: 'Your 7-day free trial for TierTrainer24 ended on',
    paragraph2: 'We hope you enjoyed our professional training services!',
    featuresTitle: 'What you get with a subscription:',
    feature1: '✅ Unlimited chat with professional trainers',
    feature2: '✅ Personalized training plans from expert trainers',
    feature3: '✅ Photo analysis with behavior assessment by trainers',
    feature4: '✅ Progress tracking with trainer support',
    feature5: '✅ 24/7 access to professional trainer support',
    priceInfo: 'Plans starting from',
    priceValue: '€9.99 / month',
    ctaButton: 'View Subscription Plans',
    guaranteeTitle: '14-Day Money-Back Guarantee',
    guaranteeText: 'If you\'re not 100% satisfied, get your money back. No questions asked.',
    footer1: 'Thank you for trying TierTrainer24!',
    footer2: 'Your TierTrainer24 Team - Real Trainers, Real Results',
  };

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                <tr>
                  <td style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); padding: 40px 30px; text-align: center;">
                    <div style="font-size: 60px; margin-bottom: 20px;">⏰</div>
                    <h1 style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0 0 10px 0;">
                      ${content.heading}
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      ${content.greeting}
                    </p>
                    <p style="color: #666666; font-size: 15px; line-height: 1.6; margin: 0 0 10px 0;">
                      ${content.paragraph1} <strong>${trialEndDate}</strong> ${content.paragraph2}
                    </p>
                    <div style="background-color: #f9fafb; border: 2px solid #e5e7eb; border-radius: 8px; padding: 25px; margin: 30px 0;">
                      <h2 style="color: #1f2937; font-size: 18px; font-weight: bold; margin: 0 0 20px 0;">
                        ⭐ ${content.featuresTitle}
                      </h2>
                      <p style="color: #374151; font-size: 14px; margin: 0 0 12px 0; line-height: 1.5;">${content.feature1}</p>
                      <p style="color: #374151; font-size: 14px; margin: 0 0 12px 0; line-height: 1.5;">${content.feature2}</p>
                      <p style="color: #374151; font-size: 14px; margin: 0 0 12px 0; line-height: 1.5;">${content.feature3}</p>
                      <p style="color: #374151; font-size: 14px; margin: 0 0 12px 0; line-height: 1.5;">${content.feature4}</p>
                      <p style="color: #374151; font-size: 14px; margin: 0; line-height: 1.5;">${content.feature5}</p>
                    </div>
                    <div style="background-color: #fef3c7; border: 2px solid #fbbf24; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
                      <p style="color: #78350f; font-size: 14px; margin: 0 0 8px 0;">${content.priceInfo}</p>
                      <p style="color: #78350f; font-size: 32px; font-weight: bold; margin: 0;">${content.priceValue}</p>
                    </div>
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="https://tiertrainer24.com/#pricing" style="display: inline-block; background-color: #f59e0b; color: #ffffff; font-size: 16px; font-weight: bold; padding: 16px 40px; text-decoration: none; border-radius: 8px;">
                        👑 ${content.ctaButton}
                      </a>
                    </div>
                    <div style="background-color: #ecfdf5; border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
                      <p style="color: #065f46; font-size: 16px; font-weight: bold; margin: 0 0 8px 0;">✅ ${content.guaranteeTitle}</p>
                      <p style="color: #047857; font-size: 14px; margin: 0;">${content.guaranteeText}</p>
                    </div>
                    <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0; text-align: center;">
                      ${content.footer1}<br><strong>${content.footer2}</strong>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                      © 2025 TierTrainer24. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      throw new Error("RESEND_API_KEY is not set");
    }

    const resend = new Resend(resendKey);
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { userEmail } = await req.json();
    
    if (!userEmail) {
      throw new Error("User email is required");
    }

    logStep("Processing trial expiration notification", { userEmail });

    // Get user profile and subscription data
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('first_name, email')
      .eq('email', userEmail)
      .maybeSingle();

    if (profileError && profileError.code !== 'PGRST116') {
      logStep("Error fetching profile", { error: profileError });
      throw profileError;
    }

    logStep("Profile data fetched", { profile });

    // Get subscription data to find trial end date
    const { data: subscription, error: subscriptionError } = await supabaseClient
      .from('subscribers')
      .select('trial_start, trial_used, trial_confirm')
      .eq('email', userEmail)
      .maybeSingle();

    if (subscriptionError && subscriptionError.code !== 'PGRST116') {
      logStep("Error fetching subscription", { error: subscriptionError });
      throw subscriptionError;
    }

    if (!subscription) {
      logStep("No subscription found for user", { userEmail });
      throw new Error("No subscription found for user");
    }

    logStep("Subscription data fetched", { subscription });

    // Calculate trial end date (trial_start + 7 days)
    let trialEndDate = '';
    if (subscription?.trial_start) {
      const trialStart = new Date(subscription.trial_start);
      const trialEnd = new Date(trialStart);
      trialEnd.setDate(trialEnd.getDate() + 7);
      trialEndDate = trialEnd.toISOString();
    }

    // Get user language preference
    const userLanguage = await getUserLanguage(userEmail, supabaseClient);
    logStep("Using language for trial expiration email", { userEmail, language: userLanguage });

    const userName = profile?.first_name || (userLanguage === 'en' ? 'Valued Customer' : 'Geschätzter Kunde');
    const formattedTrialEndDate = formatDate(trialEndDate, userLanguage);

    // Generate email HTML
    const html = generateEmailHTML(userName, formattedTrialEndDate, userLanguage);

    // Determine test mode and recipient
    const testMode = true; // TODO: Set to false for production
    const testEmail = "owydwaldt12@gmail.com";
    const finalRecipient = testMode ? testEmail : userEmail;

    const subject = userLanguage === 'en' 
      ? '⏰ Your Free Trial Has Expired - TierTrainer24'
      : '⏰ Ihre kostenlose Testphase ist abgelaufen - TierTrainer24';

    const finalSubject = testMode ? `[TEST für ${userEmail}] ${subject}` : subject;

    logStep("Sending trial expiration email", { 
      to: finalRecipient, 
      subject: finalSubject, 
      testMode,
      originalEmail: userEmail 
    });

    // Send email via Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "TierTrainer24 <noreply@mail.tiertrainer24.com>",
      to: [finalRecipient],
      subject: finalSubject,
      html,
    });

    if (emailError) {
      logStep("Resend error", { error: emailError });
      throw new Error(`Failed to send email: ${emailError.message}`);
    }

    logStep("Email sent successfully", { emailId: emailData?.id });

    // NOTE: trial_confirm is NOT updated here
    // It will be updated to true only when user clicks "View Subscription Plans" button in the modal
    // This ensures we only track users who actively chose to view the plans

    // Log email for tracking
    await supabaseClient.from('system_notifications').insert({
      type: 'trial_expiration',
      title: subject,
      message: `Trial expiration email sent to ${userEmail}`,
      user_id: null,
      status: 'sent'
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Trial expiration email sent successfully',
        emailId: emailData?.id 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 200 
      }
    );

  } catch (error) {
    logStep("Error in trial expiration email function", { 
      error: error.message, 
      stack: error.stack 
    });
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 500 
      }
    );
  }
});