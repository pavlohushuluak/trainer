
export interface InvoiceWithProfile {
  id: string;
  invoice_number: string | null;
  amount_total: number | null;
  currency: string | null;
  status: string | null;
  created_at: string | null;
  due_date: string | null;
  paid_at: string | null;
  payment_method: string | null;
  hosted_invoice_url: string | null;
  invoice_pdf: string | null;
  stripe_invoice_id: string | null;
  user_id: string | null;
  profiles?: {
    email: string;
  } | null;
}

export interface PaymentStats {
  totalRevenue: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  pendingAmount: number;
  totalInvoices: number;
  paidInvoices: number;
}
