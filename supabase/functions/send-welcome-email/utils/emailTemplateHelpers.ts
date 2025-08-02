
import { EmailTemplateData } from "./emailTemplateTypes.ts";

export const getTestModeHeader = (testMode: boolean, originalRecipient?: string) => {
  if (!testMode) return '';
  
  return `
    <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 10px; border-radius: 6px; margin-bottom: 20px;">
      <strong>🧪 TEST-MODUS:</strong> Diese E-Mail wurde ursprünglich für ${originalRecipient} bestimmt, aber zur Sicherheit an die Test-Adresse weitergeleitet.
    </div>
  `;
};

export const getEmailFooter = (companyName: string = 'TierTrainer24') => {
  return `
    <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
    <p style="margin: 0; color: #666; font-size: 12px; text-align: center;">
      ${companyName} - Dein digitaler Hundetrainer
    </p>
  `;
};

export const getButtonStyle = (backgroundColor: string = '#22c55e') => {
  return `background: ${backgroundColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;`;
};

export const getEmailContainer = (content: string) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      ${content}
    </div>
  `;
};
