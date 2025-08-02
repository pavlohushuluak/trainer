
export interface SubscriptionStatus {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
  subscription_status?: string;
  trial_end?: string;
  cancel_at_period_end?: boolean;
  billing_cycle?: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  amount_total: number;
  currency: string;
  status: string;
  invoice_pdf?: string;
  hosted_invoice_url?: string;
  created_at: string;
  paid_at?: string;
}
