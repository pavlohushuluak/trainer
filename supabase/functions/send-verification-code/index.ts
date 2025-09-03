import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { Resend } from "npm:resend@4.0.0"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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
        console.log(`[SEND-VERIFICATION-CODE] Language query error - attempt ${attempt}:`, error);
        if (attempt < maxRetries) {
          console.log(`[SEND-VERIFICATION-CODE] Retrying language query for ${email}, attempt ${attempt + 1}`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }
        console.log(`[SEND-VERIFICATION-CODE] Max retries reached, using default language for ${email}`);
        return 'de'; // Default to German after max retries
      }

      const language = data || 'de';
      console.log(`[SEND-VERIFICATION-CODE] Retrieved user language for ${email}: ${language}`);
      return language;
    } catch (error) {
      console.log(`[SEND-VERIFICATION-CODE] Language query exception - attempt ${attempt}:`, error);
      if (attempt < maxRetries) {
        console.log(`[SEND-VERIFICATION-CODE] Retrying language query after exception for ${email}, attempt ${attempt + 1}`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue;
      }
      console.log(`[SEND-VERIFICATION-CODE] Max retries reached after exception, using default language for ${email}`);
      return 'de'; // Default to German after max retries
    }
  }
  
  // This should never be reached, but just in case
  console.log(`[SEND-VERIFICATION-CODE] Fallback to default language for ${email}`);
  return 'de';
};

// Generate email content based on language
const generateVerificationEmail = (code: string, language: string = 'de') => {
  const content = language === 'en' ? {
    subject: '🔐 TierTrainer24 - Password Change Verification Code',
    title: 'Password Change Verification',
    subtitle: 'Your verification code is ready',
    greeting: 'Hello!',
    description: 'You have requested to change your password. To complete this process, please use the verification code below:',
    important: 'Important:',
    bulletPoints: [
      'This code will expire once used',
      'If you didn\'t request this change, please ignore this email',
      'For security reasons, never share this code with anyone'
    ],
    securityNotice: '⚠️ Security Notice: This verification code is valid for one-time use only. If you need a new code, please request it again from your account settings.',
    bestRegards: 'Best regards,',
    teamName: 'The TierTrainer Team',
    automatedMessage: 'This is an automated message. Please do not reply to this email.',
    copyright: '© 2024 TierTrainer. All rights reserved.'
  } : {
    subject: '🔐 TierTrainer24 - Passwort-Änderung Bestätigungscode',
    title: 'Passwort-Änderung Bestätigung',
    subtitle: 'Ihr Bestätigungscode ist bereit',
    greeting: 'Hallo!',
    description: 'Sie haben eine Passwort-Änderung angefordert. Um diesen Vorgang abzuschließen, verwenden Sie bitte den Bestätigungscode unten:',
    important: 'Wichtig:',
    bulletPoints: [
      'Dieser Code läuft ab, sobald er verwendet wird',
      'Falls Sie diese Änderung nicht angefordert haben, ignorieren Sie bitte diese E-Mail',
      'Aus Sicherheitsgründen teilen Sie diesen Code niemals mit anderen'
    ],
    securityNotice: '⚠️ Sicherheitshinweis: Dieser Bestätigungscode ist nur für den einmaligen Gebrauch gültig. Falls Sie einen neuen Code benötigen, fordern Sie ihn bitte erneut in Ihren Kontoeinstellungen an.',
    bestRegards: 'Mit freundlichen Grüßen,',
    teamName: 'Das TierTrainer Team',
    automatedMessage: 'Dies ist eine automatisierte Nachricht. Bitte antworten Sie nicht auf diese E-Mail.',
    copyright: '© 2024 TierTrainer. Alle Rechte vorbehalten.'
  };
  
  return {
    subject: content.subject,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${content.title}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .code { background: #fff; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
          .verification-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 4px; font-family: monospace; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 ${content.title}</h1>
            <p>${content.subtitle}</p>
          </div>
          <div class="content">
            <p>${content.greeting}</p>
            <p>${content.description}</p>
            
            <div class="code">
              <div class="verification-code">${code}</div>
            </div>
            
            <p><strong>${content.important}</strong></p>
            <ul>
              ${content.bulletPoints.map(point => `<li>${point}</li>`).join('')}
            </ul>
            
            <div class="warning">
              <strong>${content.securityNotice}</strong>
            </div>
            
            <p>${content.bestRegards}<br>${content.teamName}</p>
          </div>
          <div class="footer">
            <p>${content.automatedMessage}</p>
            <p>${content.copyright}</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, code, type } = await req.json()

    if (!email || !code || !type) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get user language preference
    const language = await getUserLanguage(email);
    console.log(`[SEND-VERIFICATION-CODE] Using language ${language} for ${email}`);

    // Get Resend API key from environment variables
    const resendKey = Deno.env.get('RESEND_API_KEY')
    
    if (!resendKey) {
      console.error('RESEND_API_KEY missing')
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create Resend client
    const resend = new Resend(resendKey)

    // Prepare email content based on type and language
    let subject = ''
    let htmlContent = ''

    if (type === 'password-change') {
      const emailContent = generateVerificationEmail(code, language);
      subject = emailContent.subject;
      htmlContent = emailContent.html;
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid verification type' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Send email via Resend
    const { data: emailData, error } = await resend.emails.send({
      from: 'TierTrainer24 <noreply@mail.tiertrainer24.com>',
      to: [email],
      subject: subject,
      html: htmlContent,
    })

    if (error) {
      console.error('Resend error:', error)
      throw new Error(`Failed to send email: ${error.message}`)
    }

    console.log(`[SEND-VERIFICATION-CODE] Verification code sent to ${email} in ${language}: ${code}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Verification code sent successfully',
        emailId: emailData?.id,
        language: language
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('[SEND-VERIFICATION-CODE] Error sending verification code:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to send verification code' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
