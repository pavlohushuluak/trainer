
interface EmailTemplateData {
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
}

export const generateWelcomeMail = (data: EmailTemplateData) => {
  const { name, planName, trialEndDate, dashboardUrl, testMode, originalRecipient } = data;
  
  return {
    subject: `🎉 Willkommen bei TierTrainer24, ${name}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        ${testMode ? `
          <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 10px; border-radius: 6px; margin-bottom: 20px;">
            <strong>🧪 TEST-MODUS:</strong> Diese E-Mail wurde ursprünglich für ${originalRecipient} bestimmt, aber zur Sicherheit an die Test-Adresse weitergeleitet.
          </div>
        ` : ''}
        
        <div style="background: #22c55e; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 24px;">🐾 Willkommen bei TierTrainer24!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Hallo ${name}, schön dass du da bist!</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h2 style="margin: 0 0 15px 0; color: #333;">🎯 Dein ${planName}-Paket ist aktiv</h2>
          <p>Deine kostenlose Testphase läuft ${trialEndDate} ab. Du kannst jederzeit kündigen.</p>
          
          <div style="margin: 20px 0;">
            <a href="${dashboardUrl}" style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              🚀 Zum Dashboard
            </a>
          </div>
        </div>
        
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; color: #666; font-size: 12px; text-align: center;">
          TierTrainer24 - Dein digitaler Hundetrainer
        </p>
      </div>
    `
  };
};

export const generateCheckoutMail = (data: EmailTemplateData) => {
  const { name, planName, amount, interval, trialEndDate, dashboardUrl, testMode, originalRecipient } = data;
  
  return {
    subject: `✅ Bestellung bestätigt - TierTrainer24 ${planName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        ${testMode ? `
          <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 10px; border-radius: 6px; margin-bottom: 20px;">
            <strong>🧪 TEST-MODUS:</strong> Diese E-Mail wurde ursprünglich für ${originalRecipient} bestimmt, aber zur Sicherheit an die Test-Adresse weitergeleitet.
          </div>
        ` : ''}
        
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
            <a href="${dashboardUrl}" style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              🚀 Training starten
            </a>
          </div>
        </div>
        
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; color: #666; font-size: 12px; text-align: center;">
          TierTrainer24 - Dein digitaler Hundetrainer
        </p>
      </div>
    `
  };
};

export const generateMagicLinkMail = (data: EmailTemplateData) => {
  const { name, magicLink, testMode, originalRecipient } = data;
  
  return {
    subject: `🔐 Dein Anmelde-Link für TierTrainer24`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        ${testMode ? `
          <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 10px; border-radius: 6px; margin-bottom: 20px;">
            <strong>🧪 TEST-MODUS:</strong> Diese E-Mail wurde ursprünglich für ${originalRecipient} bestimmt, aber zur Sicherheit an die Test-Adresse weitergeleitet.
          </div>
        ` : ''}
        
        <h1>🔐 Anmeldung bei TierTrainer24</h1>
        <p>Hallo ${name},</p>
        <p>hier ist dein sicherer Anmelde-Link:</p>
        
        <div style="margin: 20px 0;">
          <a href="${magicLink}" style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            🚀 Jetzt anmelden
          </a>
        </div>
        
        <p style="color: #666; font-size: 12px;">Dieser Link ist 24 Stunden gültig.</p>
      </div>
    `
  };
};

export const generateTestUserWelcomeMail = (data: EmailTemplateData) => {
  const { name, email, dashboardUrl, testMode, originalRecipient } = data;
  
  return {
    subject: `🧪 Test-Benutzer erstellt - TierTrainer24`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        ${testMode ? `
          <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 10px; border-radius: 6px; margin-bottom: 20px;">
            <strong>🧪 TEST-MODUS:</strong> Diese E-Mail wurde ursprünglich für ${originalRecipient} bestimmt, aber zur Sicherheit an die Test-Adresse weitergeleitet.
          </div>
        ` : ''}
        
        <h1>🧪 Test-Benutzer erstellt</h1>
        <p>Hallo ${name},</p>
        <p>Ihr Test-Benutzer wurde erfolgreich erstellt:</p>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <strong>E-Mail:</strong> ${email}<br>
          <strong>Status:</strong> Test-Benutzer aktiv
        </div>
        
        <div style="margin: 20px 0;">
          <a href="${dashboardUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            🚀 Zum Dashboard
          </a>
        </div>
      </div>
    `
  };
};

export const generateConfirmSignupMail = (data: EmailTemplateData) => {
  const { name, confirmationLink, testMode, originalRecipient } = data;
  
  return {
    subject: `✅ E-Mail-Adresse bestätigen - TierTrainer24`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        ${testMode ? `
          <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 10px; border-radius: 6px; margin-bottom: 20px;">
            <strong>🧪 TEST-MODUS:</strong> Diese E-Mail wurde ursprünglich für ${originalRecipient} bestimmt, aber zur Sicherheit an die Test-Adresse weitergeleitet.
          </div>
        ` : ''}
        
        <h1>✅ E-Mail-Adresse bestätigen</h1>
        <p>Hallo ${name},</p>
        <p>Bitte bestätigen Sie Ihre E-Mail-Adresse, um Ihr TierTrainer24-Konto zu aktivieren:</p>
        
        <div style="margin: 20px 0;">
          <a href="${confirmationLink}" style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            ✅ E-Mail bestätigen
          </a>
        </div>
      </div>
    `
  };
};

export const generateInviteUserMail = (data: EmailTemplateData) => {
  const { name, inviteLink, invitedBy, testMode, originalRecipient } = data;
  
  return {
    subject: `🎉 Einladung zu TierTrainer24`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        ${testMode ? `
          <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 10px; border-radius: 6px; margin-bottom: 20px;">
            <strong>🧪 TEST-MODUS:</strong> Diese E-Mail wurde ursprünglich für ${originalRecipient} bestimmt, aber zur Sicherheit an die Test-Adresse weitergeleitet.
          </div>
        ` : ''}
        
        <h1>🎉 Sie wurden zu TierTrainer24 eingeladen!</h1>
        <p>Hallo ${name},</p>
        <p>${invitedBy} hat Sie zu TierTrainer24 eingeladen!</p>
        
        <div style="margin: 20px 0;">
          <a href="${inviteLink}" style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            🚀 Einladung annehmen
          </a>
        </div>
      </div>
    `
  };
};

export const generateTestUserActivationMail = (data: EmailTemplateData) => {
  const { name, email, dashboardUrl, testMode, originalRecipient } = data;
  
  return {
    subject: `🔓 Test-Benutzer aktiviert - TierTrainer24`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        ${testMode ? `
          <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 10px; border-radius: 6px; margin-bottom: 20px;">
            <strong>🧪 TEST-MODUS:</strong> Diese E-Mail wurde ursprünglich für ${originalRecipient} bestimmt, aber zur Sicherheit an die Test-Adresse weitergeleitet.
          </div>
        ` : ''}
        
        <h1>🔓 Test-Benutzer aktiviert</h1>
        <p>Hallo ${name},</p>
        <p>Ihr Test-Benutzer wurde erfolgreich aktiviert:</p>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <strong>E-Mail:</strong> ${email}<br>
          <strong>Status:</strong> ✅ Aktiviert
        </div>
        
        <div style="margin: 20px 0;">
          <a href="${dashboardUrl}" style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            🚀 Zum Dashboard
          </a>
        </div>
      </div>
    `
  };
};
