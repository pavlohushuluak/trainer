
// GTM Event Types
export interface GTMEvent {
  event: string;
  [key: string]: any;
}

export interface GTMPageViewEvent extends GTMEvent {
  event: 'page_view';
  page_title?: string;
  page_location?: string;
  page_path?: string;
  content_group1?: string;
  content_group2?: string;
}

export interface GTMCustomEvent extends GTMEvent {
  event: string;
  event_category?: string;
  event_label?: string;
  value?: number;
  custom_parameter?: any;
}

export interface GTMEcommerceEvent extends GTMEvent {
  event: 'purchase' | 'add_to_cart' | 'begin_checkout' | 'view_item' | 'subscription_upgrade' | 'subscription_upgrade_monthly' | 'subscription_upgrade_halfyearly';
  transaction_id?: string;
  value?: number;
  currency?: string;
  items?: Array<{
    item_id: string;
    item_name: string;
    category: string;
    quantity: number;
    price: number;
  }>;
  custom_parameter?: {
    plan_type?: string;
    plan_id?: string;
    from_plan?: string;
    to_plan?: string;
    upgrade_amount?: number;
    billing_cycle?: 'monthly' | 'halfyearly';
    payment_method?: string;
    timestamp?: string;
  };
}

export interface GTMAuthEvent extends GTMEvent {
  event: 'sign_up' | 'login' | 'logout';
  method?: string;
  user_id?: string;
  custom_parameter?: {
    login_method?: string;
    timestamp?: string;
  };
}

export interface GTMEngagementEvent extends GTMEvent {
  event: 'chat_start' | 'chat_message' | 'feature_usage';
  event_category: 'engagement';
  event_label?: string;
  custom_parameter?: {
    chat_type?: string;
    pet_type?: string;
    message_type?: 'user' | 'assistant';
    message_length?: number;
    feature_name?: string;
    feature_category?: string;
    timestamp?: string;
  };
}

// GTM DataLayer Interface
export interface GTMDataLayer extends Array<GTMEvent> {
  push(event: GTMEvent): void;
}

declare global {
  interface Window {
    dataLayer?: GTMDataLayer;
    gtag?: (...args: any[]) => void;
  }
}

export {};
