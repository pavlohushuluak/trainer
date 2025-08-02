
import { Resend } from "npm:resend@4.0.0";
import { logStep } from "./logger.ts";
import { EmailConfig } from "./config.ts";
import { generateWelcomeMail, generateCheckoutMail } from "./emailTemplates.ts";

export interface EmailRequest {
  emailType: string;
  userEmail: string;
  userName?: string;
  planName?: string;
  amount?: string;
  interval?: string;
  trialEndDate?: string;
}

export const generateEmailContent = async (request: EmailRequest, config: EmailConfig) => {
  const { emailType, userName, planName, amount, interval, trialEndDate } = request;
  const { dashboardUrl, testMode } = config;

  if (emailType === "welcome") {
    return generateWelcomeMail({
      name: userName || "Tierfreund",
      planName: planName || "TierTrainer",
      trialEndDate: trialEndDate || "in 7 Tagen",
      dashboardUrl,
      testMode,
      originalRecipient: request.userEmail
    });
  } else if (emailType === "checkout-confirmation") {
    return generateCheckoutMail({
      name: userName || "Tierfreund",
      planName: planName || "TierTrainer",
      amount: amount || "0",
      interval: interval || "Monat",
      trialEndDate: trialEndDate || "in 7 Tagen",
      dashboardUrl,
      testMode,
      originalRecipient: request.userEmail
    });
  } else {
    throw new Error("Invalid email type");
  }
};

export const sendEmail = async (
  resend: Resend,
  template: { subject: string; html: string },
  finalRecipient: string
) => {
  logStep("About to send email", { 
    to: finalRecipient, 
    subject: template.subject,
    fromAddress: "TierTrainer24 <noreply@mail.tiertrainer24.com>"
  });

  const emailPayload = {
    from: 'TierTrainer24 <noreply@mail.tiertrainer24.com>',
    to: [finalRecipient],
    subject: template.subject,
    html: template.html
  };

  const { data, error } = await resend.emails.send(emailPayload);

  if (error) {
    logStep("Resend error", { error });
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return data;
};
