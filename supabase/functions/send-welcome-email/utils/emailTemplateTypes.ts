
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
