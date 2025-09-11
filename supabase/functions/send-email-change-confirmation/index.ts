import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailChangeRequest {
  userId: string;
  currentEmail: string;
  newEmail: string;
  userName: string;
  language: string;
  confirmationToken: string;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-EMAIL-CHANGE-CONFIRMATION] ${step}${detailsStr}`);
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

// Generate email change confirmation email
const generateEmailChangeConfirmationEmail = (data: EmailChangeRequest, language: string = 'de') => {
  const userName = data.userName || (language === 'en' ? 'Pet Friend' : 'Tierfreund');
  
  // Use the passed confirmation token
  const confirmUrl = `${Deno.env.get('SITE_URL') || 'https://tiertrainer24.com'}/confirm-email-change?token=${data.confirmationToken}&userId=${data.userId}&newEmail=${encodeURIComponent(data.newEmail)}`;
  
  const content = language === 'en' ? {
    subject: '📧 TierTrainer24 - Confirm Email Address Change',
    title: 'Change Email Address 📧',
    subtitle: `Hello ${userName}, confirm your new email`,
    description: 'You have requested to change your email address at TierTrainer24. Click the button below to confirm your new email address:',
    buttonText: '📧 Confirm Email Change',
    linkText: 'If the button doesn\'t work, copy this link:',
    infoTitle: 'ℹ️ Note:',
    infoPoints: [
      'Your old email address remains active until you confirm this change',
      'If you didn\'t request this change, please ignore this email',
      'After confirmation, you will receive all future emails at this new address'
    ],
    footerText: `This email was sent to <strong>${data.newEmail}</strong>.`,
    copyright: '© 2024 TierTrainer24 - Your partner for professional pet training'
  } : {
    subject: '📧 TierTrainer24 - E-Mail-Adressänderung bestätigen',
    title: 'E-Mail-Adresse ändern 📧',
    subtitle: `Hallo ${userName}, bestätigen Sie Ihre neue E-Mail`,
    description: 'Sie haben eine Änderung Ihrer E-Mail-Adresse bei TierTrainer24 angefordert. Klicken Sie auf den Button unten, um Ihre neue E-Mail-Adresse zu bestätigen:',
    buttonText: '📧 E-Mail-Änderung bestätigen',
    linkText: 'Falls der Button nicht funktioniert, kopieren Sie diesen Link:',
    infoTitle: 'ℹ️ Hinweis:',
    infoPoints: [
      'Ihre alte E-Mail-Adresse bleibt aktiv, bis Sie diese Änderung bestätigen',
      'Falls Sie diese Änderung nicht angefordert haben, ignorieren Sie diese E-Mail',
      'Nach der Bestätigung erhalten Sie alle zukünftigen E-Mails an diese neue Adresse'
    ],
    footerText: `Diese E-Mail wurde an <strong>${data.newEmail}</strong> gesendet.`,
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    logStep('Starting email change confirmation function');
    
    // Check for Resend API key
    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (!resendKey) {
      logStep('RESEND_API_KEY missing');
      return new Response(
        JSON.stringify({ 
          error: 'RESEND_API_KEY environment variable is missing',
          success: false 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse request body
    const requestBody: EmailChangeRequest = await req.json();
    logStep('Received email change request', { 
      userId: requestBody.userId,
      currentEmail: requestBody.currentEmail,
      newEmail: requestBody.newEmail,
      language: requestBody.language
    });

    // Validate required fields
    if (!requestBody.userId || !requestBody.currentEmail || !requestBody.newEmail || !requestBody.confirmationToken) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: userId, currentEmail, newEmail, confirmationToken',
          success: false 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get user language preference
    const userLanguage = await getUserLanguage(requestBody.currentEmail);
    
    // Generate email template
    const emailTemplate = generateEmailChangeConfirmationEmail(requestBody, userLanguage);
    
    // Send email via Resend
    const resend = new Resend(resendKey);
    const { data: emailData, error } = await resend.emails.send({
      from: 'TierTrainer24 <noreply@mail.tiertrainer24.com>',
      to: [requestBody.newEmail],
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });

    if (error) {
      logStep('Resend error', { error });
      throw new Error(`Failed to send email: ${error.message}`);
    }

    logStep('Email sent successfully', { 
      emailId: emailData?.id,
      to: requestBody.newEmail
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: emailData?.id,
        message: 'Email change confirmation sent successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    logStep('Error in email change confirmation function', { 
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
