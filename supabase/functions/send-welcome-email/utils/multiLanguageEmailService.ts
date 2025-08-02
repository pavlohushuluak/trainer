import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export interface EmailTemplateData {
  name: string;
  planName?: string;
  amount?: string;
  interval?: string;
  trialEndDate?: string;
  dashboardUrl?: string;
  magicLink?: string;
  confirmationLink?: string;
  inviteLink?: string;
  invitedBy?: string;
  email?: string;
  testMode?: boolean;
  originalRecipient?: string;
  companyName?: string;
  supportUrl?: string;
}

export interface EmailTemplate {
  subject: string;
  html: string;
}

export type EmailType = 
  | 'welcome'
  | 'checkout-confirmation'
  | 'magic-link'
  | 'test-user-welcome'
  | 'confirm-signup'
  | 'invite-user'
  | 'test-user-activation'
  | 'password-reset'
  | 'trial-reminder'
  | 'subscription-cancelled'
  | 'payment-failed';

export class MultiLanguageEmailService {
  private supabaseClient: any;

  constructor() {
    this.supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
  }

  /**
   * Get user's language preference from database
   */
  async getUserLanguage(userEmail: string): Promise<string> {
    try {
      const { data, error } = await this.supabaseClient
        .from('profiles')
        .select('language')
        .eq('email', userEmail)
        .single();

      if (error) {
        console.log(`Error getting user language for ${userEmail}:`, error);
        return 'de'; // Default to German
      }

      return data?.language || 'de';
    } catch (error) {
      console.log(`Exception getting user language for ${userEmail}:`, error);
      return 'de'; // Default to German
    }
  }

  /**
   * Get email template from database based on user's language preference
   */
  async getEmailTemplate(templateKey: string, userEmail: string): Promise<EmailTemplate | null> {
    try {
      const userLanguage = await this.getUserLanguage(userEmail);
      
      // First try to get template in user's language
      let { data, error } = await this.supabaseClient
        .from('email_templates')
        .select('subject, html_content')
        .eq('template_key', templateKey)
        .eq('language', userLanguage)
        .single();

      // If not found, fallback to German
      if (error || !data) {
        console.log(`Template ${templateKey} not found for language ${userLanguage}, falling back to German`);
        const { data: fallbackData, error: fallbackError } = await this.supabaseClient
          .from('email_templates')
          .select('subject, html_content')
          .eq('template_key', templateKey)
          .eq('language', 'de')
          .single();

        if (fallbackError || !fallbackData) {
          console.log(`Template ${templateKey} not found in German either`);
          return null;
        }

        data = fallbackData;
      }

      return {
        subject: data.subject,
        html: data.html_content
      };
    } catch (error) {
      console.log(`Exception getting email template ${templateKey} for ${userEmail}:`, error);
      return null;
    }
  }

  /**
   * Replace template variables in subject and HTML content
   */
  replaceTemplateVariables(template: EmailTemplate, data: EmailTemplateData): EmailTemplate {
    let subject = template.subject;
    let html = template.html;

    // Replace variables in subject
    subject = subject.replace(/\{\{name\}\}/g, data.name || 'Tierfreund');
    subject = subject.replace(/\{\{planName\}\}/g, data.planName || 'TierTrainer');
    subject = subject.replace(/\{\{amount\}\}/g, data.amount || '19.99');
    subject = subject.replace(/\{\{interval\}\}/g, data.interval || 'Monat');
    subject = subject.replace(/\{\{trialEndDate\}\}/g, data.trialEndDate || 'in 7 Tagen');

    // Replace variables in HTML
    html = html.replace(/\{\{name\}\}/g, data.name || 'Tierfreund');
    html = html.replace(/\{\{planName\}\}/g, data.planName || 'TierTrainer');
    html = html.replace(/\{\{amount\}\}/g, data.amount || '19.99');
    html = html.replace(/\{\{interval\}\}/g, data.interval || 'Monat');
    html = html.replace(/\{\{trialEndDate\}\}/g, data.trialEndDate || 'in 7 Tagen');
    html = html.replace(/\{\{dashboardUrl\}\}/g, data.dashboardUrl || 'https://tiertrainer24.com/mein-tiertraining');
    html = html.replace(/\{\{magicLink\}\}/g, data.magicLink || '#');
    html = html.replace(/\{\{confirmationLink\}\}/g, data.confirmationLink || '#');
    html = html.replace(/\{\{inviteLink\}\}/g, data.inviteLink || '#');
    html = html.replace(/\{\{invitedBy\}\}/g, data.invitedBy || 'einem TierTrainer-Nutzer');

    return { subject, html };
  }

  /**
   * Add test mode header if in test mode
   */
  addTestModeHeader(html: string, testMode: boolean, originalRecipient: string): string {
    if (!testMode) return html;

    const testHeader = `
      <div style="background: #f59e0b; color: white; padding: 10px; border-radius: 4px; margin-bottom: 20px; text-align: center; font-size: 14px;">
        🧪 TEST MODE - This email would be sent to: ${originalRecipient}
      </div>
    `;

    return testHeader + html;
  }

  /**
   * Add email footer
   */
  addEmailFooter(html: string, userLanguage: string): string {
    const footer = userLanguage === 'en' 
      ? `
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 20px; text-align: center; font-size: 14px; color: #666;">
          <p>Best regards,<br>The TierTrainer24 Team</p>
          <p>Questions? Contact us at <a href="mailto:support@tiertrainer24.com">support@tiertrainer24.com</a></p>
          <p>© 2025 TierTrainer24 - A product of Shopping-Guru GmbH</p>
        </div>
      `
      : `
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 20px; text-align: center; font-size: 14px; color: #666;">
          <p>Mit freundlichen Grüßen,<br>Das TierTrainer24 Team</p>
          <p>Fragen? Kontaktieren Sie uns unter <a href="mailto:support@tiertrainer24.com">support@tiertrainer24.com</a></p>
          <p>© 2025 TierTrainer24 - Ein Produkt der Shopping-Guru GmbH</p>
        </div>
      `;

    return html + footer;
  }

  /**
   * Wrap HTML in email container
   */
  wrapInEmailContainer(html: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TierTrainer24</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        ${html}
      </body>
      </html>
    `;
  }

  /**
   * Create email template with multi-language support
   */
  async createEmailTemplate(
    emailType: EmailType, 
    data: EmailTemplateData
  ): Promise<EmailTemplate> {
    try {
      // Get template from database
      const template = await this.getEmailTemplate(emailType, data.email || '');
      
      if (!template) {
        throw new Error(`Email template not found for type: ${emailType}`);
      }

      // Replace template variables
      let processedTemplate = this.replaceTemplateVariables(template, data);

      // Get user language for footer
      const userLanguage = await this.getUserLanguage(data.email || '');

      // Add test mode header if needed
      if (data.testMode) {
        processedTemplate.html = this.addTestModeHeader(
          processedTemplate.html, 
          data.testMode, 
          data.originalRecipient || ''
        );
      }

      // Add email footer
      processedTemplate.html = this.addEmailFooter(processedTemplate.html, userLanguage);

      // Wrap in email container
      processedTemplate.html = this.wrapInEmailContainer(processedTemplate.html);

      return processedTemplate;
    } catch (error) {
      console.log(`Error creating email template for ${emailType}:`, error);
      throw error;
    }
  }

  /**
   * Log email sending to database
   */
  async logEmailSending(
    emailType: string, 
    subject: string, 
    userEmail: string, 
    userLanguage: string
  ): Promise<void> {
    try {
      await this.supabaseClient.from('system_notifications').insert({
        type: emailType,
        title: subject,
        message: `E-Mail versendet an ${userEmail} (${userLanguage})`,
        user_id: null,
        status: 'sent',
        metadata: {
          language: userLanguage,
          recipient: userEmail
        }
      });
    } catch (error) {
      console.log('Failed to log email to database:', error);
    }
  }
} 