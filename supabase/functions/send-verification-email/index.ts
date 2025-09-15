import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendVerificationRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  language?: string;
}

// Generate a 6-digit verification code
const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateSignupVerificationEmail = (email: string, verificationCode: string, firstName?: string, language: string = 'de') => {
  const userName = firstName || (language === 'en' ? 'Pet Friend' : 'Tierfreund');
  
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
    footerText: `This email was sent to <strong>${email}</strong>.<br>If you didn't sign up for TierTrainer24, please ignore this email.`,
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
    footerText: `Diese E-Mail wurde an <strong>${email}</strong> gesendet.<br>Falls Sie sich nicht bei TierTrainer24 angemeldet haben, ignorieren Sie diese E-Mail.`,
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, firstName, lastName, language }: SendVerificationRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ success: false, message: 'Email is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Generate verification code
    const verificationCode = generateVerificationCode();
    console.log('Generated verification code:', verificationCode);

    // Store the verification code in the database
    const { error: dbError } = await supabase
      .from('signup_verification_codes')
      .insert({
        email: email,
        code: verificationCode,
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour from now
      });

    if (dbError) {
      console.error('Error storing verification code:', dbError);
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to store verification code' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Generate email template
    const emailTemplate = generateSignupVerificationEmail(email, verificationCode, firstName, language || 'de');

    // Send email using Resend
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    
    const { data, error } = await resend.emails.send({
      from: 'TierTrainer24 <noreply@tiertrainer24.com>',
      to: [email],
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });

    if (error) {
      console.error('Error sending email:', error);
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to send verification email' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Verification email sent successfully:', data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Verification email sent successfully',
        emailId: data?.id
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in send-verification-email:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
