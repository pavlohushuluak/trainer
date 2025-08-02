
export interface UserWithDetails {
  id: string;
  email: string;
  created_at: string;
  subscription: {
    subscribed: boolean;
    subscription_tier?: string;
    subscription_status?: string;
    subscription_end?: string;
    trial_end?: string;
    country?: string;
    last_activity?: string;
    is_manually_activated?: boolean;
    admin_notes?: string;
    is_test_user?: boolean;
    current_period_start?: string;
    cancel_at_period_end?: boolean;
  } | null;
}

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
  created_by?: string;
}
