import { EmailTemplateData, EmailTemplate, EmailType } from "./emailTemplateTypes.ts";
import { getTestModeHeader, getEmailFooter, getButtonStyle, getEmailContainer } from "./emailTemplateHelpers.ts";

export class EmailTemplateFactory {
  static create(type: EmailType, data: EmailTemplateData): EmailTemplate {
    switch (type) {
      case 'welcome':
        return this.generateWelcomeEmail(data);
      case 'checkout-confirmation':
        return this.generateCheckoutEmail(data);
      case 'magic-link':
        return this.generateMagicLinkEmail(data);
      case 'test-user-welcome':
        return this.generateTestUserWelcomeEmail(data);
      case 'confirm-signup':
        return this.generateConfirmSignupEmail(data);
      case 'invite-user':
        return this.generateInviteUserEmail(data);
      case 'test-user-activation':
        return this.generateTestUserActivationEmail(data);
      case 'password-reset':
        return this.generatePasswordResetEmail(data);
      case 'trial-reminder':
        return this.generateTrialReminderEmail(data);
      case 'subscription-cancelled':
        return this.generateSubscriptionCancelledEmail(data);
      case 'payment-failed':
        return this.generatePaymentFailedEmail(data);
      default:
        throw new Error(`Unknown email type: ${type}`);
    }
  }

  private static generateWelcomeEmail(data: EmailTemplateData): EmailTemplate {
    const { name, planName, trialEndDate, dashboardUrl, testMode, originalRecipient } = data;
    
    const content = `
      ${getTestModeHeader(testMode, originalRecipient)}
      
      <div style="background: #22c55e; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
        <h1 style="margin: 0; font-size: 24px;">🐾 Willkommen bei TierTrainer24!</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px;">Hallo ${name}, schön dass du da bist!</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
        <h2 style="margin: 0 0 15px 0; color: #333;">🎯 Dein ${planName}-Paket ist aktiv</h2>
        <p>Deine kostenlose Testphase läuft ${trialEndDate} ab. Du kannst jederzeit kündigen.</p>
        
        <div style="margin: 20px 0;">
          <a href="${dashboardUrl}" style="${getButtonStyle()}">
            🚀 Zum Dashboard
          </a>
        </div>
      </div>
      
      ${getEmailFooter()}
    `;

    return {
      subject: `🎉 Willkommen bei TierTrainer24, ${name}!`,
      html: getEmailContainer(content)
    };
  }

  private static generateCheckoutEmail(data: EmailTemplateData): EmailTemplate {
    const { name, planName, amount, interval, trialEndDate, dashboardUrl, testMode, originalRecipient } = data;
    
    const content = `
      ${getTestModeHeader(testMode, originalRecipient)}
      
      <div style="background: #22c55e; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
        <h1 style="margin: 0; font-size: 24px;">🎉 Bestellung erfolgreich!</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px;">Vielen Dank für dein Vertrauen, ${name}!</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
        <h2 style="margin: 0 0 15px 0; color: #333;">📋 Bestelldetails</h2>
        <ul style="margin: 0; padding-left: 20px;">
          <li><strong>Paket:</strong> ${planName}</li>
          <li><strong>Preis:</strong> €${amount}/${interval}</li>
          <li><strong>Testphase:</strong> Läuft ${trialEndDate} ab</li>
        </ul>
        
        <div style="margin: 20px 0;">
          <a href="${dashboardUrl}" style="${getButtonStyle()}">
            🚀 Training starten
          </a>
        </div>
      </div>
      
      ${getEmailFooter()}
    `;

    return {
      subject: `✅ Bestellung bestätigt - TierTrainer24 ${planName}`,
      html: getEmailContainer(content)
    };
  }

  private static generatePasswordResetEmail(data: EmailTemplateData): EmailTemplate {
    const { name, magicLink, testMode, originalRecipient } = data;
    
    const content = `
      ${getTestModeHeader(testMode, originalRecipient)}
      
      <h1>🔐 Passwort zurücksetzen</h1>
      <p>Hallo ${name},</p>
      <p>Sie haben eine Passwort-Zurücksetzung für Ihr TierTrainer24-Konto angefordert.</p>
      
      <div style="margin: 20px 0;">
        <a href="${magicLink}" style="${getButtonStyle()}">
          🔑 Neues Passwort setzen
        </a>
      </div>
      
      <p style="color: #666; font-size: 12px;">Dieser Link ist 24 Stunden gültig. Falls Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail ignorieren.</p>
      
      ${getEmailFooter()}
    `;

    return {
      subject: `🔐 Passwort zurücksetzen - TierTrainer24`,
      html: getEmailContainer(content)
    };
  }

  private static generateTrialReminderEmail(data: EmailTemplateData): EmailTemplate {
    const { name, trialEndDate, dashboardUrl, testMode, originalRecipient } = data;
    
    const content = `
      ${getTestModeHeader(testMode, originalRecipient)}
      
      <div style="background: #f59e0b; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
        <h1 style="margin: 0; font-size: 24px;">⏰ Ihre Testphase läuft bald ab</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px;">Hallo ${name}!</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
        <p>Ihre kostenlose Testphase bei TierTrainer24 endet ${trialEndDate}.</p>
        <p>Um weiterhin Zugang zu allen Funktionen zu haben, können Sie jetzt Ihr Abonnement aktivieren.</p>
        
        <div style="margin: 20px 0;">
          <a href="${dashboardUrl}" style="${getButtonStyle('#f59e0b')}">
            💳 Abonnement aktivieren
          </a>
        </div>
        
        <p style="font-size: 14px; color: #666;">Sie können jederzeit kündigen. Keine versteckten Kosten.</p>
      </div>
      
      ${getEmailFooter()}
    `;

    return {
      subject: `⏰ Testphase läuft bald ab - TierTrainer24`,
      html: getEmailContainer(content)
    };
  }

  private static generateSubscriptionCancelledEmail(data: EmailTemplateData): EmailTemplate {
    const { name, dashboardUrl, testMode, originalRecipient } = data;
    
    const content = `
      ${getTestModeHeader(testMode, originalRecipient)}
      
      <h1>😢 Schade, dass Sie gehen</h1>
      <p>Hallo ${name},</p>
      <p>Wir haben Ihr Abonnement erfolgreich gekündigt. Sie können TierTrainer24 noch bis zum Ende Ihres aktuellen Abrechnungszeitraums nutzen.</p>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0;">💡 Wussten Sie schon?</h3>
        <p style="margin: 0;">Sie können Ihr Abonnement jederzeit wieder aktivieren und genau da weitermachen, wo Sie aufgehört haben.</p>
      </div>
      
      <div style="margin: 20px 0;">
        <a href="${dashboardUrl}" style="${getButtonStyle('#6b7280')}">
          🔄 Abonnement reaktivieren
        </a>
      </div>
      
      <p>Vielen Dank, dass Sie TierTrainer24 ausprobiert haben!</p>
      
      ${getEmailFooter()}
    `;

    return {
      subject: `Abonnement gekündigt - TierTrainer24`,
      html: getEmailContainer(content)
    };
  }

  private static generatePaymentFailedEmail(data: EmailTemplateData): EmailTemplate {
    const { name, dashboardUrl, testMode, originalRecipient } = data;
    
    const content = `
      ${getTestModeHeader(testMode, originalRecipient)}
      
      <div style="background: #ef4444; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
        <h1 style="margin: 0; font-size: 24px;">⚠️ Zahlungsproblem</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px;">Hallo ${name}!</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
        <p>Leider konnten wir Ihre letzte Zahlung nicht verarbeiten.</p>
        <p>Bitte aktualisieren Sie Ihre Zahlungsinformationen, um den Service weiterhin nutzen zu können.</p>
        
        <div style="margin: 20px 0;">
          <a href="${dashboardUrl}" style="${getButtonStyle('#ef4444')}">
            💳 Zahlungsdetails aktualisieren
          </a>
        </div>
        
        <p style="font-size: 14px; color: #666;">Bei Fragen stehen wir Ihnen gerne zur Verfügung.</p>
      </div>
      
      ${getEmailFooter()}
    `;

    return {
      subject: `⚠️ Zahlungsproblem - TierTrainer24`,
      html: getEmailContainer(content)
    };
  }

  // Keep existing template methods for backward compatibility
  private static generateMagicLinkEmail(data: EmailTemplateData): EmailTemplate {
    const { name, magicLink, testMode, originalRecipient } = data;
    
    const content = `
      ${getTestModeHeader(testMode, originalRecipient)}
      
      <h1>🔐 Anmeldung bei TierTrainer24</h1>
      <p>Hallo ${name},</p>
      <p>hier ist dein sicherer Anmelde-Link:</p>
      
      <div style="margin: 20px 0;">
        <a href="${magicLink}" style="${getButtonStyle()}">
          🚀 Jetzt anmelden
        </a>
      </div>
      
      <p style="color: #666; font-size: 12px;">Dieser Link ist 24 Stunden gültig.</p>
      
      ${getEmailFooter()}
    `;

    return {
      subject: `🔐 Dein Anmelde-Link für TierTrainer24`,
      html: getEmailContainer(content)
    };
  }

  private static generateTestUserWelcomeEmail(data: EmailTemplateData): EmailTemplate {
    const { name, email, dashboardUrl, testMode, originalRecipient } = data;
    
    const content = `
      ${getTestModeHeader(testMode, originalRecipient)}
      
      <h1>🧪 Test-Benutzer erstellt</h1>
      <p>Hallo ${name},</p>
      <p>Ihr Test-Benutzer wurde erfolgreich erstellt:</p>
      
      <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <strong>E-Mail:</strong> ${email}<br>
        <strong>Status:</strong> Test-Benutzer aktiv
      </div>
      
      <div style="margin: 20px 0;">
        <a href="${dashboardUrl}" style="${getButtonStyle('#3b82f6')}">
          🚀 Zum Dashboard
        </a>
      </div>
      
      ${getEmailFooter()}
    `;

    return {
      subject: `🧪 Test-Benutzer erstellt - TierTrainer24`,
      html: getEmailContainer(content)
    };
  }

  private static generateConfirmSignupEmail(data: EmailTemplateData): EmailTemplate {
    const { name, confirmationLink, testMode, originalRecipient } = data;
    
    const content = `
      ${getTestModeHeader(testMode, originalRecipient)}
      
      <h1>✅ E-Mail-Adresse bestätigen</h1>
      <p>Hallo ${name},</p>
      <p>Bitte bestätigen Sie Ihre E-Mail-Adresse, um Ihr TierTrainer24-Konto zu aktivieren:</p>
      
      <div style="margin: 20px 0;">
        <a href="${confirmationLink}" style="${getButtonStyle()}">
          ✅ E-Mail bestätigen
        </a>
      </div>
      
      ${getEmailFooter()}
    `;

    return {
      subject: `✅ E-Mail-Adresse bestätigen - TierTrainer24`,
      html: getEmailContainer(content)
    };
  }

  private static generateInviteUserEmail(data: EmailTemplateData): EmailTemplate {
    const { name, inviteLink, invitedBy, testMode, originalRecipient } = data;
    
    const content = `
      ${getTestModeHeader(testMode, originalRecipient)}
      
      <h1>🎉 Sie wurden zu TierTrainer24 eingeladen!</h1>
      <p>Hallo ${name},</p>
      <p>${invitedBy} hat Sie zu TierTrainer24 eingeladen!</p>
      
      <div style="margin: 20px 0;">
        <a href="${inviteLink}" style="${getButtonStyle()}">
          🚀 Einladung annehmen
        </a>
      </div>
      
      ${getEmailFooter()}
    `;

    return {
      subject: `🎉 Einladung zu TierTrainer24`,
      html: getEmailContainer(content)
    };
  }

  private static generateTestUserActivationEmail(data: EmailTemplateData): EmailTemplate {
    const { name, email, dashboardUrl, testMode, originalRecipient } = data;
    
    const content = `
      ${getTestModeHeader(testMode, originalRecipient)}
      
      <h1>🔓 Test-Benutzer aktiviert</h1>
      <p>Hallo ${name},</p>
      <p>Ihr Test-Benutzer wurde erfolgreich aktiviert:</p>
      
      <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <strong>E-Mail:</strong> ${email}<br>
        <strong>Status:</strong> ✅ Aktiviert
      </div>
      
      <div style="margin: 20px 0;">
        <a href="${dashboardUrl}" style="${getButtonStyle()}">
          🚀 Zum Dashboard
        </a>
      </div>
      
      ${getEmailFooter()}
    `;

    return {
      subject: `🔓 Test-Benutzer aktiviert - TierTrainer24`,
      html: getEmailContainer(content)
    };
  }
}
