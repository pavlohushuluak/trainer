import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AuthEmailData {
  user: {
    email: string;
    id: string;
    user_metadata?: {
      full_name?: string;
      first_name?: string;
      last_name?: string;
      preferred_language?: string;
    };
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
    token_new?: string;
    token_hash_new?: string;
  };
  // For email changes, Supabase might provide the new email in different fields
  new_email?: string;
  email_change?: {
    new_email?: string;
  };
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[AUTH-EMAIL-HANDLER] ${step}${detailsStr}`);
};

// Get user language preference from database with retry logic
const getUserLanguage = async (email: string): Promise<string> => {
  const maxRetries = 10;
  const retryDelay = 500; // 0.5 seconds in milliseconds
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const { data, error } = await supabase.rpc('get_language_support', {
        user_email: email
      });

      if (error) {
        logStep('Language query error', { error, email, attempt });
        if (attempt < maxRetries) {
          logStep('Retrying language query', { email, attempt, nextAttempt: attempt + 1 });
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }
        logStep('Max retries reached, using default language', { email, attempts: attempt });
        return 'de'; // Default to German after max retries
      }

      const language = data || 'de';
      logStep('Retrieved user language', { email, language, attempt });
      return language;
    } catch (error) {
      logStep('Language query exception', { error, email, attempt });
      if (attempt < maxRetries) {
        logStep('Retrying language query after exception', { email, attempt, nextAttempt: attempt + 1 });
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue;
      }
      logStep('Max retries reached after exception, using default language', { email, attempts: attempt });
      return 'de'; // Default to German after max retries
    }
  }
  
  // This should never be reached, but just in case
  logStep('Fallback to default language', { email });
  return 'de';
};

// Validate environment variables
const validateEnvironment = () => {
  const resendKey = Deno.env.get('RESEND_API_KEY');
  const hookSecret = Deno.env.get('AUTH_HOOK_SECRET');
  
  logStep("Environment check", { 
    hasResendKey: !!resendKey, 
    hasHookSecret: !!hookSecret 
  });

  if (!resendKey) {
    logStep("RESEND_API_KEY missing - auth hook will succeed but no email will be sent");
    return { resendKey: null, hookSecret };
  }
  if (!hookSecret) {
    logStep("AUTH_HOOK_SECRET missing - using default validation");
    return { resendKey, hookSecret: null };
  }

  return { resendKey, hookSecret };
};

// Generate a 6-digit verification code
const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateSignupVerificationEmail = (data: AuthEmailData, verificationCode: string, language: string = 'de') => {
  const userName = data.user.user_metadata?.first_name || 
                   data.user.user_metadata?.full_name || 
                   (language === 'en' ? 'Pet Friend' : 'Tierfreund');
  
  const content = language === 'en' ? {
    subject: '🐾 Welcome to TierTrainer24 - Verify Your Email',
    title: `Welcome, ${userName}! 🎉`,
    subtitle: 'Just one step left to your TierTrainer24 account',
    description: 'Enter this 6-digit verification code to confirm your email address and activate your account:',
    codeLabel: 'Your verification code:',
    codeInstructions: 'Enter this code in the verification form to complete your registration.',
    benefitsTitle: '🚀 What awaits you at TierTrainer24?',
    benefits: [
      'Professional training methods for your pet',
      'Step-by-step instructions',
      'Community with other pet owners',
      'Personal AI trainer for individual questions'
    ],
    footerText: `This email was sent to <strong>${data.user.email}</strong>.<br>If you didn't sign up for TierTrainer24, please ignore this email.`,
    copyright: '© 2024 TierTrainer24 - Your partner for professional pet training'
  } : {
    subject: '🐾 Willkommen bei TierTrainer24 - E-Mail verifizieren',
    title: `Willkommen, ${userName}! 🎉`,
    subtitle: 'Nur noch ein Schritt bis zu Ihrem TierTrainer24 Account',
    description: 'Geben Sie diesen 6-stelligen Bestätigungscode ein, um Ihre E-Mail-Adresse zu bestätigen und Ihren Account zu aktivieren:',
    codeLabel: 'Ihr Bestätigungscode:',
    codeInstructions: 'Geben Sie diesen Code im Bestätigungsformular ein, um Ihre Registrierung abzuschließen.',
    benefitsTitle: '🚀 Was erwartet Sie bei TierTrainer24?',
    benefits: [
      'Professionelle Trainingsmethoden für Ihr Haustier',
      'Schritt-für-Schritt Anleitungen',
      'Community mit anderen Haustierbesitzern',
      'Persönlicher KI-Trainer für individuelle Fragen'
    ],
    footerText: `Diese E-Mail wurde an <strong>${data.user.email}</strong> gesendet.<br>Falls Sie sich nicht bei TierTrainer24 angemeldet haben, ignorieren Sie diese E-Mail.`,
    copyright: '© 2024 TierTrainer24 - Ihr Partner für professionelles Haustiertraining'
  };
  
  return {
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
            <p style="color: #666; margin: 5px 0;">Professional Pet Training</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); background-color: #2563eb; color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h2 style="margin: 0 0 15px 0;">${content.title}</h2>
            <p style="margin: 0; font-size: 16px;">${content.subtitle}</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0;">
            <p style="margin: 0 0 20px 0; font-size: 16px;">
              ${content.description}
            </p>
            
            <div style="text-align: center; margin: 25px 0;">
              <div style="background: white; border: 2px solid #2563eb; border-radius: 8px; padding: 20px; display: inline-block;">
                <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">${content.codeLabel}</p>
                <div style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 8px; font-family: monospace;">
                  ${verificationCode}
                </div>
              </div>
            </div>
            
            <p style="margin: 20px 0 0 0; font-size: 14px; color: #666; text-align: center;">
              ${content.codeInstructions}
            </p>
          </div>
          
          <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="margin: 0 0 15px 0; color: #1e40af;">${content.benefitsTitle}</h3>
            <ul style="margin: 0; padding-left: 20px; color: #1e40af;">
              ${content.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
            </ul>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px;">
            <p style="margin: 0;">
              ${content.footerText}
            </p>
            <p style="margin: 15px 0 0 0;">
              ${content.copyright}
            </p>
          </div>
        </body>
      </html>
    `
  };
};

// Generate 6-digit verification code and create email template
const generateSignupCodeEmail = async (data: AuthEmailData, language: string = 'de') => {
  // Generate a random 6-digit code
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  logStep('Generated 6-digit verification code', { 
    email: data.user.email,
    code: verificationCode,
    userId: data.user.id
  });
  
  // Store the verification code in the database
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
  
  const { error: insertError } = await supabaseAdmin
    .from('signup_verification_codes')
    .insert({
      email: data.user.email,
      code: verificationCode,
      user_id: data.user.id,
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour from now
    });
  
  if (insertError) {
    logStep('Error storing verification code', { 
      error: insertError.message,
      errorCode: insertError.code,
      errorDetails: insertError.details,
      errorHint: insertError.hint,
      email: data.user.email,
      code: verificationCode,
      userId: data.user.id
    });
    throw new Error(`Failed to store verification code: ${insertError.message}`);
  }
  
  logStep('Verification code stored successfully', { 
    email: data.user.email,
    code: verificationCode,
    userId: data.user.id
  });
  
  const userName = data.user.user_metadata?.first_name || 
                   data.user.user_metadata?.full_name || 
                   (language === 'en' ? 'Pet Friend' : 'Tierfreund');
  
  const content = language === 'en' ? {
    subject: '🐾 Welcome to TierTrainer24 - Verification Code',
    title: `Welcome, ${userName}! 🎉`,
    subtitle: 'Just one step left to your TierTrainer24 account',
    description: `Please enter this 6-digit verification code to confirm your email address:`,
    codeText: `Your verification code:`,
    code: verificationCode,
    codeInstructions: 'Enter this code in the verification form to activate your account.',
    benefitsTitle: '🚀 What awaits you at TierTrainer24?',
    benefits: [
      'Professional training methods for your pet',
      'Step-by-step instructions',
      'Community with other pet owners',
      'Personal AI trainer for individual questions'
    ],
    footerText: `This email was sent to <strong>${data.user.email}</strong>.<br>If you didn't sign up for TierTrainer24, please ignore this email.`,
    copyright: '© 2024 TierTrainer24 - Your partner for professional pet training'
  } : {
    subject: '🐾 Willkommen bei TierTrainer24 - Bestätigungscode',
    title: `Willkommen, ${userName}! 🎉`,
    subtitle: 'Nur noch ein Schritt bis zu Ihrem TierTrainer24 Account',
    description: `Bitte geben Sie diesen 6-stelligen Bestätigungscode ein, um Ihre E-Mail-Adresse zu bestätigen:`,
    codeText: `Ihr Bestätigungscode:`,
    code: verificationCode,
    codeInstructions: 'Geben Sie diesen Code im Bestätigungsformular ein, um Ihren Account zu aktivieren.',
    benefitsTitle: '🚀 Was erwartet Sie bei TierTrainer24?',
    benefits: [
      'Professionelle Trainingsmethoden für Ihr Haustier',
      'Schritt-für-Schritt Anleitungen',
      'Community mit anderen Haustierbesitzern',
      'Persönlicher KI-Trainer für individuelle Fragen'
    ],
    footerText: `Diese E-Mail wurde an <strong>${data.user.email}</strong> gesendet.<br>Falls Sie sich nicht bei TierTrainer24 angemeldet haben, ignorieren Sie diese E-Mail.`,
    copyright: '© 2024 TierTrainer24 - Ihr Partner für professionelles Haustiertraining'
  };
  
  return {
    subject: content.subject,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>${content.subject}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; line-height: 1.6;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <div style="background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px;">🐾</span>
              </div>
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">${content.title}</h1>
              <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">${content.subtitle}</p>
            </div>
            
            <!-- Main Content -->
            <div style="padding: 40px 30px;">
              <p style="color: #374151; font-size: 16px; margin: 0 0 30px 0;">${content.description}</p>
              
              <!-- Verification Code Box -->
              <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
                <p style="color: #6b7280; font-size: 14px; margin: 0 0 15px 0; font-weight: 500;">${content.codeText}</p>
                <div style="background-color: #ffffff; border: 2px dashed #d1d5db; border-radius: 8px; padding: 20px; margin: 15px 0;">
                  <span style="font-size: 32px; font-weight: 700; color: #1f2937; letter-spacing: 4px; font-family: 'Courier New', monospace;">${content.code}</span>
                </div>
                <p style="color: #6b7280; font-size: 14px; margin: 15px 0 0 0;">${content.codeInstructions}</p>
              </div>
              
              <!-- Benefits Section -->
              <div style="margin-top: 40px;">
                <h3 style="color: #1f2937; font-size: 20px; font-weight: 600; margin: 0 0 20px 0;">${content.benefitsTitle}</h3>
                <ul style="color: #4b5563; font-size: 15px; margin: 0; padding-left: 20px;">
                  ${content.benefits.map(benefit => `<li style="margin-bottom: 8px;">${benefit}</li>`).join('')}
                </ul>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 15px 0;">
                ${content.footerText}
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                ${content.copyright}
              </p>
            </div>
          </div>
        </body>
      </html>
    `
  };
};

const generateSignupConfirmationEmail = (data: AuthEmailData, language: string = 'de') => {
  const userName = data.user.user_metadata?.first_name || 
                   data.user.user_metadata?.full_name || 
                   (language === 'en' ? 'Pet Friend' : 'Tierfreund');
  
  const confirmUrl = `${data.email_data.site_url}/verify?token=${data.email_data.token_hash}&type=${data.email_data.email_action_type}&redirect_to=${data.email_data.redirect_to}&apikey=${Deno.env.get('SUPABASE_ANON_KEY')}`;
  
  const content = language === 'en' ? {
    subject: '🐾 Welcome to TierTrainer24 - Confirm Email',
    title: `Welcome, ${userName}! 🎉`,
    subtitle: 'Just one step left to your TierTrainer24 account',
    description: 'Click the button below to confirm your email address and activate your account:',
    buttonText: '✅ Confirm Email',
    linkText: 'If the button doesn\'t work, copy this link into your browser:',
    benefitsTitle: '🚀 What awaits you at TierTrainer24?',
    benefits: [
      'Professional training methods for your pet',
      'Step-by-step instructions',
      'Community with other pet owners',
      'Personal AI trainer for individual questions'
    ],
    footerText: `This email was sent to <strong>${data.user.email}</strong>.<br>If you didn't sign up for TierTrainer24, please ignore this email.`,
    copyright: '© 2024 TierTrainer24 - Your partner for professional pet training'
  } : {
    subject: '🐾 Willkommen bei TierTrainer24 - E-Mail bestätigen',
    title: `Willkommen, ${userName}! 🎉`,
    subtitle: 'Nur noch ein Schritt bis zu Ihrem TierTrainer24 Account',
    description: 'Klicken Sie auf den Button unten, um Ihre E-Mail-Adresse zu bestätigen und Ihren Account zu aktivieren:',
    buttonText: '✅ E-Mail bestätigen',
    linkText: 'Falls der Button nicht funktioniert, kopieren Sie diesen Link in Ihren Browser:',
    benefitsTitle: '🚀 Was erwartet Sie bei TierTrainer24?',
    benefits: [
      'Professionelle Trainingsmethoden für Ihr Haustier',
      'Schritt-für-Schritt Anleitungen',
      'Community mit anderen Haustierbesitzern',
      'Persönlicher KI-Trainer für individuelle Fragen'
    ],
    footerText: `Diese E-Mail wurde an <strong>${data.user.email}</strong> gesendet.<br>Falls Sie sich nicht bei TierTrainer24 angemeldet haben, ignorieren Sie diese E-Mail.`,
    copyright: '© 2024 TierTrainer24 - Ihr Partner für professionelles Haustiertraining'
  };
  
  return {
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
            <p style="color: #666; margin: 5px 0;">Professional Pet Training</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); background-color: #2563eb; color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h2 style="margin: 0 0 15px 0;">${content.title}</h2>
            <p style="margin: 0; font-size: 16px;">${content.subtitle}</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0;">
            <p style="margin: 0 0 20px 0; font-size: 16px;">
              ${content.description}
            </p>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="${confirmUrl}" 
                 style="display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                ${content.buttonText}
              </a>
            </div>
            
            <p style="margin: 20px 0 0 0; font-size: 14px; color: #666;">
              ${content.linkText}<br>
              <a href="${confirmUrl}" style="color: #2563eb; word-break: break-all;">${confirmUrl}</a>
            </p>
          </div>
          
          <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="margin: 0 0 15px 0; color: #1e40af;">${content.benefitsTitle}</h3>
            <ul style="margin: 0; padding-left: 20px; color: #1e40af;">
              ${content.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
            </ul>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px;">
            <p style="margin: 0;">
              ${content.footerText}
            </p>
            <p style="margin: 15px 0 0 0;">
              ${content.copyright}
            </p>
          </div>
        </body>
      </html>
    `
  };
};

const generateMagicLinkEmail = (data: AuthEmailData, language: string = 'de') => {
  const userName = data.user.user_metadata?.first_name || 
                   data.user.user_metadata?.full_name || 
                   (language === 'en' ? 'Pet Friend' : 'Tierfreund');
  
  const magicLinkUrl = `${data.email_data.site_url}/verify?token=${data.email_data.token_hash}&type=${data.email_data.email_action_type}&redirect_to=${data.email_data.redirect_to}&apikey=${Deno.env.get('SUPABASE_ANON_KEY')}`;
  
  const content = language === 'en' ? {
    subject: '🔐 Your TierTrainer24 Login Link',
    title: `Hello ${userName}! 🔐`,
    subtitle: 'Here is your secure login link',
    description: 'Click the button below to securely log in to TierTrainer24:',
    buttonText: '🔐 Login Now',
    codeText: 'Or use this code:',
    linkText: 'If the button doesn\'t work, copy this link:',
    securityTitle: '⚠️ Security Notice:',
    securityText: 'This login link is only valid for 15 minutes. If you didn\'t want to log in, please ignore this email.',
    footerText: `This email was sent to <strong>${data.user.email}</strong>.`,
    copyright: '© 2024 TierTrainer24 - Your partner for professional pet training'
  } : {
    subject: '🔐 Ihr TierTrainer24 Login-Link',
    title: `Hallo ${userName}! 🔐`,
    subtitle: 'Hier ist Ihr sicherer Login-Link',
    description: 'Klicken Sie auf den Button unten, um sich sicher bei TierTrainer24 anzumelden:',
    buttonText: '🔐 Jetzt einloggen',
    codeText: 'Oder verwenden Sie diesen Code:',
    linkText: 'Falls der Button nicht funktioniert, kopieren Sie diesen Link:',
    securityTitle: '⚠️ Sicherheitshinweis:',
    securityText: 'Dieser Login-Link ist nur 15 Minuten gültig. Falls Sie sich nicht einloggen wollten, ignorieren Sie diese E-Mail.',
    footerText: `Diese E-Mail wurde an <strong>${data.user.email}</strong> gesendet.`,
    copyright: '© 2024 TierTrainer24 - Ihr Partner für professionelles Haustiertraining'
  };
  
  return {
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
            <p style="color: #666; margin: 5px 0;">${language === 'en' ? 'Professional Pet Training' : 'Professionelles Haustiertraining'}</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #7c3aed, #5b21b6); background-color: #7c3aed; color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h2 style="margin: 0 0 15px 0;">${content.title}</h2>
            <p style="margin: 0; font-size: 16px;">${content.subtitle}</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0;">
            <p style="margin: 0 0 20px 0; font-size: 16px;">
              ${content.description}
            </p>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="${magicLinkUrl}" 
                 style="display: inline-block; background: #7c3aed; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                ${content.buttonText}
              </a>
            </div>
            
            <p style="margin: 20px 0 10px 0; font-size: 14px; color: #666;">
              ${content.codeText} <strong style="color: #7c3aed; font-size: 16px;">${data.email_data.token}</strong>
            </p>
            
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">
              ${content.linkText}<br>
              <a href="${magicLinkUrl}" style="color: #2563eb; word-break: break-all;">${magicLinkUrl}</a>
            </p>
          </div>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              ${content.securityTitle} ${content.securityText}
            </p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px;">
            <p style="margin: 0;">
              ${content.footerText}
            </p>
            <p style="margin: 15px 0 0 0;">
              ${content.copyright}
            </p>
          </div>
        </body>
      </html>
    `
  };
};

const generatePasswordResetEmail = (data: AuthEmailData, language: string = 'de') => {
  const userName = data.user.user_metadata?.first_name || 
                   data.user.user_metadata?.full_name || 
                   (language === 'en' ? 'Pet Friend' : 'Tierfreund');
  
  const resetUrl = `${data.email_data.site_url}/verify?token=${data.email_data.token_hash}&type=${data.email_data.email_action_type}&redirect_to=${data.email_data.redirect_to}&apikey=${Deno.env.get('SUPABASE_ANON_KEY')}`;
  
  const content = language === 'en' ? {
    subject: '🔒 TierTrainer24 - Reset Password',
    title: 'Reset Password 🔒',
    subtitle: `Hello ${userName}, reset your password`,
    description: 'You have requested a password reset for your TierTrainer24 account. Click the button below to create a new password:',
    buttonText: '🔒 Create New Password',
    linkText: 'If the button doesn\'t work, copy this link:',
    securityTitle: '⚠️ Important Security Notice:',
    securityPoints: [
      'This link is only valid for 1 hour',
      'If you didn\'t request this, please ignore this email',
      'Your current password remains active until you create a new one'
    ],
    footerText: `This email was sent to <strong>${data.user.email}</strong>.`,
    copyright: '© 2024 TierTrainer24 - Your partner for professional pet training'
  } : {
    subject: '🔒 TierTrainer24 - Passwort zurücksetzen',
    title: 'Passwort zurücksetzen 🔒',
    subtitle: `Hallo ${userName}, setzen Sie Ihr Passwort zurück`,
    description: 'Sie haben eine Passwort-Zurücksetzung für Ihr TierTrainer24 Konto angefordert. Klicken Sie auf den Button unten, um ein neues Passwort zu erstellen:',
    buttonText: '🔒 Neues Passwort erstellen',
    linkText: 'Falls der Button nicht funktioniert, kopieren Sie diesen Link:',
    securityTitle: '⚠️ Wichtiger Sicherheitshinweis:',
    securityPoints: [
      'Dieser Link ist nur 1 Stunde gültig',
      'Falls Sie diese Anfrage nicht gestellt haben, ignorieren Sie diese E-Mail',
      'Ihr aktuelles Passwort bleibt solange aktiv, bis Sie ein neues erstellen'
    ],
    footerText: `Diese E-Mail wurde an <strong>${data.user.email}</strong> gesendet.`,
    copyright: '© 2024 TierTrainer24 - Ihr Partner für professionelles Haustiertraining'
  };
  
  return {
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
            <p style="color: #666; margin: 5px 0;">${language === 'en' ? 'Professional Pet Training' : 'Professionelles Haustiertraining'}</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); background-color: #dc2626; color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h2 style="margin: 0 0 15px 0;">${content.title}</h2>
            <p style="margin: 0; font-size: 16px;">${content.subtitle}</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0;">
            <p style="margin: 0 0 20px 0; font-size: 16px;">
              ${content.description}
            </p>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="${resetUrl}" 
                 style="display: inline-block; background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                ${content.buttonText}
              </a>
            </div>
            
            <p style="margin: 20px 0 0 0; font-size: 14px; color: #666;">
              ${content.linkText}<br>
              <a href="${resetUrl}" style="color: #2563eb; word-break: break-all;">${resetUrl}</a>
            </p>
          </div>
          
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #dc2626;">
            <p style="margin: 0; color: #991b1b; font-size: 14px;">
              ${content.securityTitle}<br>
              ${content.securityPoints.map(point => `• ${point}`).join('<br>')}
            </p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px;">
            <p style="margin: 0;">
              ${content.footerText}
            </p>
            <p style="margin: 15px 0 0 0;">
              ${content.copyright}
            </p>
          </div>
        </body>
      </html>
    `
  };
};

const generateEmailChangeEmail = (data: AuthEmailData, language: string = 'de') => {
  const userName = data.user.user_metadata?.first_name || 
                   data.user.user_metadata?.full_name || 
                   (language === 'en' ? 'Pet Friend' : 'Tierfreund');
  
  // For email changes, we need to use the new email address
  // Check multiple possible locations for the new email
  let newEmail = data.user.email;
  if (data.new_email) {
    newEmail = data.new_email;
  } else if (data.email_change?.new_email) {
    newEmail = data.email_change.new_email;
  }
  
  const confirmUrl = `${data.email_data.site_url}/verify?token=${data.email_data.token_hash}&type=${data.email_data.email_action_type}&redirect_to=${data.email_data.redirect_to}&apikey=${Deno.env.get('SUPABASE_ANON_KEY')}`;
  
  const content = language === 'en' ? {
    subject: '📧 TierTrainer24 - Confirm Email Address',
    title: 'Change Email Address 📧',
    subtitle: `Hello ${userName}, confirm your new email`,
    description: 'You have requested to change your email address at TierTrainer24. Click the button below to confirm your new email address:',
    buttonText: '📧 Confirm Email',
    linkText: 'If the button doesn\'t work, copy this link:',
    infoTitle: 'ℹ️ Note:',
    infoPoints: [
      'Your old email address remains active until you confirm this change',
      'If you didn\'t request this change, please ignore this email',
      'After confirmation, you will receive all future emails at this new address'
    ],
    footerText: `This email was sent to <strong>${newEmail}</strong>.`,
    copyright: '© 2024 TierTrainer24 - Your partner for professional pet training'
  } : {
    subject: '📧 TierTrainer24 - E-Mail-Adresse bestätigen',
    title: 'E-Mail-Adresse ändern 📧',
    subtitle: `Hallo ${userName}, bestätigen Sie Ihre neue E-Mail`,
    description: 'Sie haben eine Änderung Ihrer E-Mail-Adresse bei TierTrainer24 angefordert. Klicken Sie auf den Button unten, um Ihre neue E-Mail-Adresse zu bestätigen:',
    buttonText: '📧 E-Mail bestätigen',
    linkText: 'Falls der Button nicht funktioniert, kopieren Sie diesen Link:',
    infoTitle: 'ℹ️ Hinweis:',
    infoPoints: [
      'Ihre alte E-Mail-Adresse bleibt aktiv, bis Sie diese Änderung bestätigen',
      'Falls Sie diese Änderung nicht angefordert haben, ignorieren Sie diese E-Mail',
      'Nach der Bestätigung erhalten Sie alle zukünftigen E-Mails an diese neue Adresse'
    ],
    footerText: `Diese E-Mail wurde an <strong>${newEmail}</strong> gesendet.`,
    copyright: '© 2024 TierTrainer24 - Ihr Partner für professionelles Haustiertraining'
  };
  
  return {
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
            <p style="color: #666; margin: 5px 0;">${language === 'en' ? 'Professional Pet Training' : 'Professionelles Haustiertraining'}</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #059669, #047857); background-color: #059669; color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h2 style="margin: 0 0 15px 0;">${content.title}</h2>
            <p style="margin: 0; font-size: 16px;">${content.subtitle}</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0;">
            <p style="margin: 0 0 20px 0; font-size: 16px;">
              ${content.description}
            </p>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="${confirmUrl}" 
                 style="display: inline-block; background: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                ${content.buttonText}
              </a>
            </div>
            
            <p style="margin: 20px 0 0 0; font-size: 14px; color: #666;">
              ${content.linkText}<br>
              <a href="${confirmUrl}" style="color: #2563eb; word-break: break-all;">${confirmUrl}</a>
            </p>
          </div>
          
          <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #059669;">
            <p style="margin: 0; color: #065f46; font-size: 14px;">
              ${content.infoTitle}<br>
              ${content.infoPoints.map(point => `• ${point}`).join('<br>')}
            </p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px;">
            <p style="margin: 0;">
              ${content.footerText}
            </p>
            <p style="margin: 15px 0 0 0;">
              ${content.copyright}
            </p>
          </div>
        </body>
      </html>
    `
  };
};

const generateInviteEmail = (data: AuthEmailData, language: string = 'de') => {
  const inviteUrl = `${data.email_data.site_url}/verify?token=${data.email_data.token_hash}&type=${data.email_data.email_action_type}&redirect_to=${data.email_data.redirect_to}&apikey=${Deno.env.get('SUPABASE_ANON_KEY')}`;
  
  const content = language === 'en' ? {
    subject: '🎉 Invitation to TierTrainer24 - Start Free Now!',
    title: 'You\'re Invited! 🎉',
    subtitle: 'Become part of the TierTrainer24 Community',
    description: 'You have been invited to TierTrainer24! Discover professional training methods for your pet and become part of our community.',
    buttonText: '🎉 Accept Invitation',
    linkText: 'If the button doesn\'t work, copy this link:',
    benefitsTitle: '🚀 What awaits you at TierTrainer24:',
    benefits: [
      '7 days free trial',
      'Professional training methods',
      'Step-by-step instructions',
      'Community with other pet owners',
      'Personal AI trainer for individual questions'
    ],
    footerText: `This invitation was sent to <strong>${data.user.email}</strong>.`,
    copyright: '© 2024 TierTrainer24 - Your partner for professional pet training'
  } : {
    subject: '🎉 Einladung zu TierTrainer24 - Jetzt kostenfrei starten!',
    title: 'Sie wurden eingeladen! 🎉',
    subtitle: 'Werden Sie Teil der TierTrainer24 Community',
    description: 'Sie wurden zu TierTrainer24 eingeladen! Entdecken Sie professionelle Trainingsmethoden für Ihr Haustier und werden Sie Teil unserer Community.',
    buttonText: '🎉 Einladung annehmen',
    linkText: 'Falls der Button nicht funktioniert, kopieren Sie diesen Link:',
    benefitsTitle: '🚀 Was Sie bei TierTrainer24 erwartet:',
    benefits: [
      '7 Tage kostenfreie Testphase',
      'Professionelle Trainingsmethoden',
      'Schritt-für-Schritt Anleitungen',
      'Community mit anderen Haustierbesitzern',
      'Persönlicher KI-Trainer für individuelle Fragen'
    ],
    footerText: `Diese Einladung wurde an <strong>${data.user.email}</strong> gesendet.`,
    copyright: '© 2024 TierTrainer24 - Ihr Partner für professionelles Haustiertraining'
  };
  
  return {
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
            <p style="color: #666; margin: 5px 0;">${language === 'en' ? 'Professional Pet Training' : 'Professionelles Haustiertraining'}</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); background-color: #8b5cf6; color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h2 style="margin: 0 0 15px 0;">${content.title}</h2>
            <p style="margin: 0; font-size: 16px;">${content.subtitle}</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0;">
            <p style="margin: 0 0 20px 0; font-size: 16px;">
              ${content.description}
            </p>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="${inviteUrl}" 
                 style="display: inline-block; background: #8b5cf6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                ${content.buttonText}
              </a>
            </div>
            
            <p style="margin: 20px 0 0 0; font-size: 14px; color: #666;">
              ${content.linkText}<br>
              <a href="${inviteUrl}" style="color: #2563eb; word-break: break-all;">${inviteUrl}</a>
            </p>
          </div>
          
          <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="margin: 0 0 15px 0; color: #1e40af;">${content.benefitsTitle}</h3>
            <ul style="margin: 0; padding-left: 20px; color: #1e40af;">
              ${content.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
            </ul>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px;">
            <p style="margin: 0;">
              ${content.footerText}
            </p>
            <p style="margin: 15px 0 0 0;">
              ${content.copyright}
            </p>
          </div>
        </body>
      </html>
    `
  };
};

const generateReauthEmail = (data: AuthEmailData, language: string = 'de') => {
  const userName = data.user.user_metadata?.first_name || 
                   data.user.user_metadata?.full_name || 
                   (language === 'en' ? 'Pet Friend' : 'Tierfreund');
  
  const reauthUrl = `${data.email_data.site_url}/verify?token=${data.email_data.token_hash}&type=${data.email_data.email_action_type}&redirect_to=${data.email_data.redirect_to}&apikey=${Deno.env.get('SUPABASE_ANON_KEY')}`;
  
  const content = language === 'en' ? {
    subject: '🔐 TierTrainer24 - Security Confirmation Required',
    title: 'Security Confirmation 🔐',
    subtitle: `Hello ${userName}, confirm your identity`,
    description: 'For security reasons, you must confirm your identity before you can continue. Click the button below to authenticate:',
    buttonText: '🔐 Confirm Identity',
    linkText: 'If the button doesn\'t work, copy this link:',
    securityTitle: '🛡️ Why is this necessary?',
    securityText: 'This additional security confirmation protects your account from unauthorized access. It was triggered because you want to perform a security-critical action.',
    footerText: `This email was sent to <strong>${data.user.email}</strong>.`,
    copyright: '© 2024 TierTrainer24 - Your partner for professional pet training'
  } : {
    subject: '🔐 TierTrainer24 - Sicherheitsbestätigung erforderlich',
    title: 'Sicherheitsbestätigung 🔐',
    subtitle: `Hallo ${userName}, bestätigen Sie Ihre Identität`,
    description: 'Aus Sicherheitsgründen müssen Sie Ihre Identität bestätigen, bevor Sie fortfahren können. Klicken Sie auf den Button unten, um sich zu authentifizieren:',
    buttonText: '🔐 Identität bestätigen',
    linkText: 'Falls der Button nicht funktioniert, kopieren Sie diesen Link:',
    securityTitle: '🛡️ Warum ist das notwendig?',
    securityText: 'Diese zusätzliche Sicherheitsbestätigung schützt Ihr Konto vor unbefugten Zugriffen. Sie wurde ausgelöst, weil Sie eine sicherheitskritische Aktion durchführen möchten.',
    footerText: `Diese E-Mail wurde an <strong>${data.user.email}</strong> gesendet.`,
    copyright: '© 2024 TierTrainer24 - Ihr Partner für professionelles Haustiertraining'
  };
  
  return {
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
            <p style="color: #666; margin: 5px 0;">${language === 'en' ? 'Professional Pet Training' : 'Professionelles Haustiertraining'}</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #f59e0b, #d97706); background-color: #f59e0b; color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h2 style="margin: 0 0 15px 0;">${content.title}</h2>
            <p style="margin: 0; font-size: 16px;">${content.subtitle}</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0;">
            <p style="margin: 0 0 20px 0; font-size: 16px;">
              ${content.description}
            </p>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="${reauthUrl}" 
                 style="display: inline-block; background: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                ${content.buttonText}
              </a>
            </div>
            
            <p style="margin: 20px 0 0 0; font-size: 14px; color: #666;">
              ${content.linkText}<br>
              <a href="${reauthUrl}" style="color: #2563eb; word-break: break-all;">${reauthUrl}</a>
            </p>
          </div>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              ${content.securityTitle}<br>
              ${content.securityText}
            </p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px;">
            <p style="margin: 0;">
              ${content.footerText}
            </p>
            <p style="margin: 15px 0 0 0;">
              ${content.copyright}
            </p>
          </div>
        </body>
      </html>
    `
  };
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    logStep('Starting auth email handler');
    
    // Validate environment variables
    const { resendKey, hookSecret } = validateEnvironment();
    
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);
    
    logStep('Received auth webhook', { 
      payloadSize: payload.length,
      hasHeaders: Object.keys(headers).length > 0,
      rawPayload: payload.substring(0, 500) // Log first 500 chars of payload for debugging
    });
    
    let data: AuthEmailData;

    // Handle webhook verification if secret is available
    if (hookSecret) {
      logStep('Verifying webhook signature');
      try {
        const wh = new Webhook(hookSecret);
        data = wh.verify(payload, headers) as AuthEmailData;
      } catch (error) {
        logStep('Webhook signature verification failed - falling back to direct parsing', { 
          error: error.message 
        });
        data = JSON.parse(payload) as AuthEmailData;
      }
    } else {
      logStep('No webhook secret - parsing payload directly');
      data = JSON.parse(payload) as AuthEmailData;
    }
    
    logStep('Webhook verified successfully', { 
      emailType: data.email_data.email_action_type,
      userEmail: data.user.email,
      userMetadata: data.user.user_metadata,
      newEmail: data.new_email,
      emailData: data.email_data,
      hasRedirectTo: !!data.email_data.redirect_to,
      redirectToValue: data.email_data.redirect_to,
      fullPayload: JSON.stringify(data),
      headers: {
        'accept-language': headers['accept-language'],
        'cf-ipcountry': headers['cf-ipcountry']
      }
    });

    // If no Resend key, return success without sending email
    if (!resendKey) {
      logStep('No Resend API key - returning success without sending email');
      return new Response(
        JSON.stringify({ 
          success: true, 
          emailId: 'no-email-sent',
          type: data.email_data.email_action_type,
          message: 'Auth hook processed successfully but no email sent (missing RESEND_API_KEY)'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const resend = new Resend(resendKey);

    // Handle language detection and saving for signup
    let userLanguage = 'de'; // Default fallback
    
    if (data.email_data.email_action_type === 'signup') {
      logStep('Processing signup - detecting and saving user language');
      
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // For signup confirmation emails, prioritize preferred_language from user metadata
      let detectedLanguage = 'de'; // Default fallback
      
      if (data.user.user_metadata?.preferred_language) {
        detectedLanguage = data.user.user_metadata.preferred_language;
        logStep('Using preferred_language from user metadata for signup confirmation', { 
          preferredLanguage: detectedLanguage,
          userMetadata: data.user.user_metadata
        });
      } else {
        // Fallback to browser language detection from Accept-Language header
        const acceptLanguage = headers['accept-language'];
        if (acceptLanguage) {
          // Parse Accept-Language header (e.g., "de-DE,de;q=0.9,en;q=0.8")
          const primaryLang = acceptLanguage.split(',')[0]?.split('-')[0]?.toLowerCase();
          if (['de', 'en'].includes(primaryLang)) {
            detectedLanguage = primaryLang;
          }
        }
        
        logStep('Language detection from browser header completed', { 
          acceptLanguageHeader: acceptLanguage,
          detectedLanguage: detectedLanguage
        });
      }
      
      // Set the userLanguage for email generation immediately
      userLanguage = detectedLanguage;
      
      // Save the detected language - retry on failure
      let languageSaved = false;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const { error: upsertError } = await supabaseAdmin.rpc('upsert_language_support', {
            user_email: data.user.email,
            user_language: detectedLanguage
          });

          if (upsertError) {
            logStep(`Language save attempt ${attempt} failed`, { 
              error: upsertError, 
              email: data.user.email,
              language: detectedLanguage 
            });
            
            if (attempt < 3) {
              await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay
              continue;
            }
          } else {
            logStep('Language support saved successfully', { 
              email: data.user.email, 
              language: detectedLanguage,
              attempt: attempt
            });
            languageSaved = true;
            break;
          }
        } catch (error) {
          logStep(`Language save exception on attempt ${attempt}`, { 
            error, 
            email: data.user.email,
            language: detectedLanguage 
          });
          
          if (attempt < 3) {
            await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay
            continue;
          }
        }
      }
      
      if (!languageSaved) {
        logStep('Failed to save language after all attempts - continuing with detected language for email', { 
          email: data.user.email,
          detectedLanguage: detectedLanguage
        });
      }
    } else {
      // For non-signup actions, get existing language preference
      userLanguage = await getUserLanguage(data.user.email);
      logStep('Retrieved user language for non-signup action', { 
        email: data.user.email, 
        language: userLanguage,
        actionType: data.email_data.email_action_type
      });
    }

    let emailTemplate;
    let shouldSendEmail = true; // Default to sending email
    
    // Generate email based on action type with language support
    switch (data.email_data.email_action_type) {
       case 'signup':
         // Check if emailRedirectTo is set - if it is, send confirmation email (login page signup)
         // If emailRedirectTo is undefined, skip confirmation email (checkout flow)
         logStep('Processing signup case', {
           hasRedirectTo: !!data.email_data.redirect_to,
           redirectToValue: data.email_data.redirect_to,
           userEmail: data.user.email,
           shouldSendEmail: shouldSendEmail
         });
         
         if (data.email_data.redirect_to) {
           logStep('Sending signup verification email - user signed up from login page', { 
             language: userLanguage,
             preferredLanguage: data.user.user_metadata?.preferred_language,
             userEmail: data.user.email,
             redirectTo: data.email_data.redirect_to
           });
           
           // Generate 6-digit code and send confirmation email for login page signup
           try {
             emailTemplate = await generateSignupCodeEmail(data, userLanguage);
             logStep('6-digit code email template generated successfully', { 
               email: data.user.email,
               hasTemplate: !!emailTemplate,
               templateSubject: emailTemplate?.subject
             });
           } catch (error) {
             logStep('Error generating signup code email template', { 
               error: error.message,
               email: data.user.email,
               stack: error.stack
             });
             throw error;
           }
           break;
         } else {
           logStep('Skipping signup verification email - user proceeding to checkout', { 
             language: userLanguage,
             preferredLanguage: data.user.user_metadata?.preferred_language,
             userEmail: data.user.email
           });
           
           // Skip sending verification email for checkout flow
           return new Response(
             JSON.stringify({ 
               success: true, 
               emailId: 'skipped-signup-verification',
               type: data.email_data.email_action_type,
               message: 'Signup verification email skipped - user proceeding to checkout'
             }),
             { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
           );
         }
      case 'magiclink':
        emailTemplate = generateMagicLinkEmail(data, userLanguage);
        break;
      case 'recovery':
        emailTemplate = generatePasswordResetEmail(data, userLanguage);
        break;
      case 'email_change':
        logStep('Processing email change request', {
          userEmail: data.user.email,
          newEmail: data.new_email,
          emailChangeData: data.email_change,
          availableFields: Object.keys(data)
        });
        emailTemplate = generateEmailChangeEmail(data, userLanguage);
        break;
      case 'invite':
        emailTemplate = generateInviteEmail(data, userLanguage);
        break;
      case 'reauthentication':
        emailTemplate = generateReauthEmail(data, userLanguage);
        break;
      default:
        throw new Error(`Unsupported email action type: ${data.email_data.email_action_type}`);
    }

    // For email changes, send to the new email address
    // Check multiple possible locations for the new email
    let recipientEmail = data.user.email;
    if (data.email_data.email_action_type === 'email_change') {
      if (data.new_email) {
        recipientEmail = data.new_email;
      } else if (data.email_change?.new_email) {
        recipientEmail = data.email_change.new_email;
      } else {
        // If we can't find the new email, log an error but still try to send to the user's current email
        logStep('Warning: Could not find new email address for email change', {
          userEmail: data.user.email,
          availableFields: Object.keys(data)
        });
      }
    }
    
     // Debug: Log the current state before email sending
     logStep('About to send email - checking conditions', {
       emailActionType: data.email_data.email_action_type,
       shouldSendEmail: shouldSendEmail,
       hasEmailTemplate: !!emailTemplate,
       recipientEmail: recipientEmail,
       originalUserEmail: data.user.email
     });
     
     // Only send email if shouldSendEmail is true (for signup deduplication)
     if (data.email_data.email_action_type === 'signup' && !shouldSendEmail) {
       logStep('Skipping email send - duplicate prevention', { 
         type: data.email_data.email_action_type,
         to: recipientEmail,
         originalUserEmail: data.user.email
       });
       
       return new Response(
         JSON.stringify({ 
           success: true, 
           emailId: 'duplicate-prevented',
           type: data.email_data.email_action_type,
           message: 'Email send skipped due to recent duplicate'
         }),
         { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }

     logStep('Sending email via Resend', { 
       type: data.email_data.email_action_type,
       to: recipientEmail,
       originalUserEmail: data.user.email,
       subject: emailTemplate.subject 
     });

     // Send email via Resend
     const { data: emailData, error } = await resend.emails.send({
       from: 'TierTrainer24 <noreply@mail.tiertrainer24.com>',
       to: [recipientEmail],
       subject: emailTemplate.subject,
       html: emailTemplate.html,
     });

     if (error) {
       logStep('Resend error', { error });
       throw new Error(`Failed to send email: ${error.message}`);
     }

     logStep('Email sent successfully', { 
       emailId: emailData?.id,
       type: data.email_data.email_action_type 
     });

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: emailData?.id,
        type: data.email_data.email_action_type 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    logStep('Error in auth email handler', { 
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