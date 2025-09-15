import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-VERIFICATION-AFTER-CANCELLATION] ${step}${detailsStr}`);
};

// Generate a random 6-digit verification code
const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate signup confirmation email template with verification code
const generateSignupConfirmationEmail = (userEmail: string, userName: string, verificationCode: string, language: string = 'de') => {
  const content = language === 'en' ? {
    subject: '🐾 Complete Your TierTrainer24 Registration',
    title: `Complete Your Registration, ${userName}! 🎉`,
    subtitle: 'Your verification code for TierTrainer24',
    description: 'To complete your registration, please enter the verification code below:',
    codeLabel: 'Your verification code:',
    code: verificationCode,
    instructions: 'Enter this code in the verification form to activate your free account.',
    benefitsTitle: '🚀 What awaits you at TierTrainer24?',
    benefits: [
      'Professional training methods for your pet',
      'Step-by-step instructions',
      'Community with other pet owners',
      'Personal AI trainer for individual questions'
    ],
    footerText: `This email was sent to <strong>${userEmail}</strong>.<br>If you didn't sign up for TierTrainer24, please ignore this email.`,
    copyright: '© 2024 TierTrainer24 - Your partner for professional pet training'
  } : {
    subject: '🐾 Registrierung bei TierTrainer24 abschließen',
    title: `Registrierung abschließen, ${userName}! 🎉`,
    subtitle: 'Ihr Bestätigungscode für TierTrainer24',
    description: 'Um Ihre Registrierung abzuschließen, geben Sie bitte den Bestätigungscode unten ein:',
    codeLabel: 'Ihr Bestätigungscode:',
    code: verificationCode,
    instructions: 'Geben Sie diesen Code im Bestätigungsformular ein, um Ihr kostenloses Konto zu aktivieren.',
    benefitsTitle: '🚀 Was erwartet Sie bei TierTrainer24?',
    benefits: [
      'Professionelle Trainingsmethoden für Ihr Haustier',
      'Schritt-für-Schritt Anleitungen',
      'Community mit anderen Tierbesitzern',
      'Persönlicher KI-Trainer für individuelle Fragen'
    ],
    footerText: `Diese E-Mail wurde an <strong>${userEmail}</strong> gesendet.<br>Falls Sie sich nicht bei TierTrainer24 registriert haben, ignorieren Sie diese E-Mail bitte.`,
    copyright: '© 2024 TierTrainer24 - Ihr Partner für professionelle Haustiererziehung'
  };

  return {
    subject: content.subject,
    html: `
      <!DOCTYPE html>
      <html lang="${language}">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${content.title}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc; }
            .container { background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 32px; font-weight: bold; color: #3b82f6; margin-bottom: 10px; }
            .title { font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 10px; }
            .subtitle { font-size: 18px; color: #6b7280; margin-bottom: 20px; }
            .description { font-size: 16px; color: #4b5563; margin-bottom: 30px; text-align: center; }
            .code-container { background: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; border: 2px dashed #d1d5db; }
            .code-label { font-size: 14px; color: #6b7280; margin-bottom: 10px; }
            .verification-code { font-size: 32px; font-weight: bold; color: #1f2937; letter-spacing: 4px; font-family: monospace; }
            .instructions { font-size: 14px; color: #6b7280; margin-top: 15px; text-align: center; }
            .benefits { margin: 30px 0; }
            .benefits-title { font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 15px; }
            .benefits-list { list-style: none; padding: 0; }
            .benefits-list li { padding: 8px 0; color: #4b5563; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🐾 TierTrainer24</div>
              <h1 class="title">${content.title}</h1>
              <p class="subtitle">${content.subtitle}</p>
            </div>
            
            <p class="description">${content.description}</p>
            
            <div class="code-container">
              <div class="code-label">${content.codeLabel}</div>
              <div class="verification-code">${content.code}</div>
              <p class="instructions">${content.instructions}</p>
            </div>
            
            <div class="benefits">
              <h2 class="benefits-title">${content.benefitsTitle}</h2>
              <ul class="benefits-list">
                ${content.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
              </ul>
            </div>
            
            <div class="footer">
              <p>${content.footerText}</p>
              <p style="margin: 15px 0 0 0;">${content.copyright}</p>
            </div>
          </div>
        </body>
      </html>
    `
  };
};

// Get user language preference from database
const getUserLanguage = async (email: string): Promise<string> => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data, error } = await supabase
      .from('user_language_support')
      .select('user_language')
      .eq('user_email', email)
      .single();

    if (error || !data) {
      logStep('No language preference found, using default', { email, error: error?.message });
      return 'de'; // Default to German
    }

    return data.user_language || 'de';
  } catch (error) {
    logStep('Error getting user language', { email, error: error.message });
    return 'de'; // Default to German
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    logStep('Starting send verification after cancellation');
    
    const { resendKey } = validateEnvironment();
    
    const { email } = await req.json();
    
    if (!email) {
      throw new Error('Email is required');
    }

    logStep('Processing verification email request', { email });

    // Get user language preference
    const userLanguage = await getUserLanguage(email);
    
    // Get user data from Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: userData, error: userError } = await supabase.auth.admin.getUserByEmail(email);
    
    if (userError || !userData.user) {
      throw new Error(`User not found: ${userError?.message}`);
    }

    const user = userData.user;
    const userName = user.user_metadata?.first_name || 
                     user.user_metadata?.full_name || 
                     (userLanguage === 'en' ? 'Pet Friend' : 'Tierfreund');

    // Generate verification code
    const verificationCode = generateVerificationCode();
    
    // Store verification code in database
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
    
    const { error: dbError } = await supabase
      .from('signup_verification_codes')
      .upsert({
        user_id: user.id,
        email: user.email,
        code: verificationCode,
        expires_at: expiresAt,
        used: false
      });

    if (dbError) {
      throw new Error(`Failed to store verification code: ${dbError.message}`);
    }

    logStep('Verification code stored successfully', { 
      email: user.email,
      code: verificationCode,
      expiresAt: expiresAt
    });

    // Generate email template
    const emailTemplate = generateSignupConfirmationEmail(user.email, userName, verificationCode, userLanguage);

    // Send email via Resend
    const resend = new Resend(resendKey);
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'TierTrainer24 <noreply@mail.tiertrainer24.com>',
      to: [user.email],
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });

    if (emailError) {
      throw new Error(`Failed to send email: ${emailError.message}`);
    }

    logStep('Verification email sent successfully', { 
      emailId: emailData?.id,
      email: user.email,
      language: userLanguage
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: emailData?.id,
        message: 'Verification email sent successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    logStep('Error in send verification after cancellation', { 
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

// Validate environment variables
function validateEnvironment() {
  const resendKey = Deno.env.get('RESEND_API_KEY');
  
  if (!resendKey) {
    throw new Error('RESEND_API_KEY environment variable is required');
  }

  return { resendKey };
}
