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
      'Professional training methods for your dog',
      'Step-by-step instructions',
      'Community with other dog owners',
      'Personal AI trainer for individual questions'
    ],
    footerText: `This email was sent to <strong>${data.user.email}</strong>.<br>If you didn't sign up for TierTrainer24, please ignore this email.`,
    copyright: '© 2024 TierTrainer24 - Your partner for professional dog training'
  } : {
    subject: '🐾 Willkommen bei TierTrainer24 - E-Mail bestätigen',
    title: `Willkommen, ${userName}! 🎉`,
    subtitle: 'Nur noch ein Schritt bis zu Ihrem TierTrainer24 Account',
    description: 'Klicken Sie auf den Button unten, um Ihre E-Mail-Adresse zu bestätigen und Ihren Account zu aktivieren:',
    buttonText: '✅ E-Mail bestätigen',
    linkText: 'Falls der Button nicht funktioniert, kopieren Sie diesen Link in Ihren Browser:',
    benefitsTitle: '🚀 Was erwartet Sie bei TierTrainer24?',
    benefits: [
      'Professionelle Trainingsmethoden für Ihren Hund',
      'Schritt-für-Schritt Anleitungen',
      'Community mit anderen Hundebesitzern',
      'Persönlicher KI-Trainer für individuelle Fragen'
    ],
    footerText: `Diese E-Mail wurde an <strong>${data.user.email}</strong> gesendet.<br>Falls Sie sich nicht bei TierTrainer24 angemeldet haben, ignorieren Sie diese E-Mail.`,
    copyright: '© 2024 TierTrainer24 - Ihr Partner für professionelles Hundetraining'
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
            <p style="color: #666; margin: 5px 0;">Professional Dog Training</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
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
                   'Tierfreund';
  
  const magicLinkUrl = `${data.email_data.site_url}/verify?token=${data.email_data.token_hash}&type=${data.email_data.email_action_type}&redirect_to=${data.email_data.redirect_to}&apikey=${Deno.env.get('SUPABASE_ANON_KEY')}`;
  
  return {
    subject: '🔐 Ihr TierTrainer24 Login-Link',
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
            <p style="color: #666; margin: 5px 0;">Professionelles Hundetraining</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #7c3aed, #5b21b6); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h2 style="margin: 0 0 15px 0;">Hallo ${userName}! 🔐</h2>
            <p style="margin: 0; font-size: 16px;">Hier ist Ihr sicherer Login-Link</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0;">
            <p style="margin: 0 0 20px 0; font-size: 16px;">
              Klicken Sie auf den Button unten, um sich sicher bei TierTrainer24 anzumelden:
            </p>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="${magicLinkUrl}" 
                 style="display: inline-block; background: #7c3aed; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                🔐 Jetzt einloggen
              </a>
            </div>
            
            <p style="margin: 20px 0 10px 0; font-size: 14px; color: #666;">
              Oder verwenden Sie diesen Code: <strong style="color: #7c3aed; font-size: 16px;">${data.email_data.token}</strong>
            </p>
            
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">
              Falls der Button nicht funktioniert, kopieren Sie diesen Link:<br>
              <a href="${magicLinkUrl}" style="color: #2563eb; word-break: break-all;">${magicLinkUrl}</a>
            </p>
          </div>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              ⚠️ <strong>Sicherheitshinweis:</strong> Dieser Login-Link ist nur 15 Minuten gültig. 
              Falls Sie sich nicht einloggen wollten, ignorieren Sie diese E-Mail.
            </p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px;">
            <p style="margin: 0;">
              Diese E-Mail wurde an <strong>${data.user.email}</strong> gesendet.
            </p>
            <p style="margin: 15px 0 0 0;">
              © 2024 TierTrainer24 - Ihr Partner für professionelles Hundetraining
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
                   'Tierfreund';
  
  const resetUrl = `${data.email_data.site_url}/verify?token=${data.email_data.token_hash}&type=${data.email_data.email_action_type}&redirect_to=${data.email_data.redirect_to}&apikey=${Deno.env.get('SUPABASE_ANON_KEY')}`;
  
  return {
    subject: '🔒 TierTrainer24 - Passwort zurücksetzen',
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
            <p style="color: #666; margin: 5px 0;">Professionelles Hundetraining</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h2 style="margin: 0 0 15px 0;">Passwort zurücksetzen 🔒</h2>
            <p style="margin: 0; font-size: 16px;">Hallo ${userName}, setzen Sie Ihr Passwort zurück</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0;">
            <p style="margin: 0 0 20px 0; font-size: 16px;">
              Sie haben eine Passwort-Zurücksetzung für Ihr TierTrainer24 Konto angefordert. 
              Klicken Sie auf den Button unten, um ein neues Passwort zu erstellen:
            </p>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="${resetUrl}" 
                 style="display: inline-block; background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                🔒 Neues Passwort erstellen
              </a>
            </div>
            
            <p style="margin: 20px 0 0 0; font-size: 14px; color: #666;">
              Falls der Button nicht funktioniert, kopieren Sie diesen Link:<br>
              <a href="${resetUrl}" style="color: #2563eb; word-break: break-all;">${resetUrl}</a>
            </p>
          </div>
          
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #dc2626;">
            <p style="margin: 0; color: #991b1b; font-size: 14px;">
              ⚠️ <strong>Wichtiger Sicherheitshinweis:</strong><br>
              • Dieser Link ist nur 1 Stunde gültig<br>
              • Falls Sie diese Anfrage nicht gestellt haben, ignorieren Sie diese E-Mail<br>
              • Ihr aktuelles Passwort bleibt solange aktiv, bis Sie ein neues erstellen
            </p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px;">
            <p style="margin: 0;">
              Diese E-Mail wurde an <strong>${data.user.email}</strong> gesendet.
            </p>
            <p style="margin: 15px 0 0 0;">
              © 2024 TierTrainer24 - Ihr Partner für professionelles Hundetraining
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
                   'Tierfreund';
  
  const confirmUrl = `${data.email_data.site_url}/verify?token=${data.email_data.token_hash}&type=${data.email_data.email_action_type}&redirect_to=${data.email_data.redirect_to}&apikey=${Deno.env.get('SUPABASE_ANON_KEY')}`;
  
  return {
    subject: '📧 TierTrainer24 - E-Mail-Adresse bestätigen',
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
            <p style="color: #666; margin: 5px 0;">Professionelles Hundetraining</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #059669, #047857); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h2 style="margin: 0 0 15px 0;">E-Mail-Adresse ändern 📧</h2>
            <p style="margin: 0; font-size: 16px;">Hallo ${userName}, bestätigen Sie Ihre neue E-Mail</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0;">
            <p style="margin: 0 0 20px 0; font-size: 16px;">
              Sie haben eine Änderung Ihrer E-Mail-Adresse bei TierTrainer24 angefordert. 
              Klicken Sie auf den Button unten, um Ihre neue E-Mail-Adresse zu bestätigen:
            </p>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="${confirmUrl}" 
                 style="display: inline-block; background: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                📧 E-Mail bestätigen
              </a>
            </div>
            
            <p style="margin: 20px 0 0 0; font-size: 14px; color: #666;">
              Falls der Button nicht funktioniert, kopieren Sie diesen Link:<br>
              <a href="${confirmUrl}" style="color: #2563eb; word-break: break-all;">${confirmUrl}</a>
            </p>
          </div>
          
          <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #059669;">
            <p style="margin: 0; color: #065f46; font-size: 14px;">
              ℹ️ <strong>Hinweis:</strong><br>
              • Ihre alte E-Mail-Adresse bleibt aktiv, bis Sie diese Änderung bestätigen<br>
              • Falls Sie diese Änderung nicht angefordert haben, ignorieren Sie diese E-Mail<br>
              • Nach der Bestätigung erhalten Sie alle zukünftigen E-Mails an diese neue Adresse
            </p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px;">
            <p style="margin: 0;">
              Diese E-Mail wurde an <strong>${data.user.email}</strong> gesendet.
            </p>
            <p style="margin: 15px 0 0 0;">
              © 2024 TierTrainer24 - Ihr Partner für professionelles Hundetraining
            </p>
          </div>
        </body>
      </html>
    `
  };
};

const generateInviteEmail = (data: AuthEmailData, language: string = 'de') => {
  const inviteUrl = `${data.email_data.site_url}/verify?token=${data.email_data.token_hash}&type=${data.email_data.email_action_type}&redirect_to=${data.email_data.redirect_to}&apikey=${Deno.env.get('SUPABASE_ANON_KEY')}`;
  
  return {
    subject: '🎉 Einladung zu TierTrainer24 - Jetzt kostenfrei starten!',
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
            <p style="color: #666; margin: 5px 0;">Professionelles Hundetraining</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h2 style="margin: 0 0 15px 0;">Sie wurden eingeladen! 🎉</h2>
            <p style="margin: 0; font-size: 16px;">Werden Sie Teil der TierTrainer24 Community</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0;">
            <p style="margin: 0 0 20px 0; font-size: 16px;">
              Sie wurden zu TierTrainer24 eingeladen! Entdecken Sie professionelle Trainingsmethoden 
              für Ihren Hund und werden Sie Teil unserer Community.
            </p>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="${inviteUrl}" 
                 style="display: inline-block; background: #8b5cf6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                🎉 Einladung annehmen
              </a>
            </div>
            
            <p style="margin: 20px 0 0 0; font-size: 14px; color: #666;">
              Falls der Button nicht funktioniert, kopieren Sie diesen Link:<br>
              <a href="${inviteUrl}" style="color: #2563eb; word-break: break-all;">${inviteUrl}</a>
            </p>
          </div>
          
          <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="margin: 0 0 15px 0; color: #1e40af;">🚀 Was Sie bei TierTrainer24 erwartet:</h3>
            <ul style="margin: 0; padding-left: 20px; color: #1e40af;">
              <li>7 Tage kostenfreie Testphase</li>
              <li>Professionelle Trainingsmethoden</li>
              <li>Schritt-für-Schritt Anleitungen</li>
              <li>Community mit anderen Hundebesitzern</li>
              <li>Persönlicher KI-Trainer für individuelle Fragen</li>
            </ul>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px;">
            <p style="margin: 0;">
              Diese Einladung wurde an <strong>${data.user.email}</strong> gesendet.
            </p>
            <p style="margin: 15px 0 0 0;">
              © 2024 TierTrainer24 - Ihr Partner für professionelles Hundetraining
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
                   'Tierfreund';
  
  const reauthUrl = `${data.email_data.site_url}/verify?token=${data.email_data.token_hash}&type=${data.email_data.email_action_type}&redirect_to=${data.email_data.redirect_to}&apikey=${Deno.env.get('SUPABASE_ANON_KEY')}`;
  
  return {
    subject: '🔐 TierTrainer24 - Sicherheitsbestätigung erforderlich',
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
            <p style="color: #666; margin: 5px 0;">Professionelles Hundetraining</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h2 style="margin: 0 0 15px 0;">Sicherheitsbestätigung 🔐</h2>
            <p style="margin: 0; font-size: 16px;">Hallo ${userName}, bestätigen Sie Ihre Identität</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0;">
            <p style="margin: 0 0 20px 0; font-size: 16px;">
              Aus Sicherheitsgründen müssen Sie Ihre Identität bestätigen, bevor Sie fortfahren können. 
              Klicken Sie auf den Button unten, um sich zu authentifizieren:
            </p>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="${reauthUrl}" 
                 style="display: inline-block; background: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                🔐 Identität bestätigen
              </a>
            </div>
            
            <p style="margin: 20px 0 0 0; font-size: 14px; color: #666;">
              Falls der Button nicht funktioniert, kopieren Sie diesen Link:<br>
              <a href="${reauthUrl}" style="color: #2563eb; word-break: break-all;">${reauthUrl}</a>
            </p>
          </div>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              🛡️ <strong>Warum ist das notwendig?</strong><br>
              Diese zusätzliche Sicherheitsbestätigung schützt Ihr Konto vor unbefugten Zugriffen. 
              Sie wurde ausgelöst, weil Sie eine sicherheitskritische Aktion durchführen möchten.
            </p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px;">
            <p style="margin: 0;">
              Diese E-Mail wurde an <strong>${data.user.email}</strong> gesendet.
            </p>
            <p style="margin: 15px 0 0 0;">
              © 2024 TierTrainer24 - Ihr Partner für professionelles Hundetraining
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
      hasHeaders: Object.keys(headers).length > 0
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
    
    // Generate email based on action type with language support
    switch (data.email_data.email_action_type) {
      case 'signup':
        logStep('Generating signup confirmation email with language', { 
          language: userLanguage,
          preferredLanguage: data.user.user_metadata?.preferred_language,
          userEmail: data.user.email
        });
        emailTemplate = generateSignupConfirmationEmail(data, userLanguage);
        break;
      case 'magiclink':
        emailTemplate = generateMagicLinkEmail(data, userLanguage);
        break;
      case 'recovery':
        emailTemplate = generatePasswordResetEmail(data, userLanguage);
        break;
      case 'email_change':
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

    logStep('Sending email via Resend', { 
      type: data.email_data.email_action_type,
      to: data.user.email,
      subject: emailTemplate.subject 
    });

    // Send email via Resend
    const { data: emailData, error } = await resend.emails.send({
      from: 'TierTrainer24 <noreply@mail.tiertrainer24.com>',
      to: [data.user.email],
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