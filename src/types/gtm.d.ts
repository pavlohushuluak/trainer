
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
  event: 'start_chat' | 'continue_chat' | 'chat_message' | 'feature_usage';
  event_category: 'engagement';
  event_label?: string;
  custom_parameter?: {
    chat_type?: string;
    session_id?: string;
    pet_type?: string;
    message_type?: 'user' | 'assistant';
    message_length?: number;
    feature_name?: string;
    feature_category?: string;
    timestamp?: string;
  };
}

export interface GTMCommunityEvent extends GTMEvent {
  event: 'new_post' | 'delete_post';
  event_category: 'community';
  event_label?: string;
  custom_parameter?: {
    post_id?: string;
    post_type?: string;
    category?: string;
    pet_type?: string;
    timestamp?: string;
  };
}

export interface GTMSupportEvent extends GTMEvent {
  event: 'support_chat_start' | 'support_ticket_create' | 'support_message' | 'support_feedback' | 'support_ticket_resolve' | 'support_faq_click';
  event_category: 'support';
  event_label?: string;
  custom_parameter?: {
    support_type?: string;
    ticket_id?: string;
    ticket_category?: string;
    ticket_priority?: string;
    message_type?: 'user' | 'ai' | 'admin';
    satisfaction_rating?: number;
    resolved_by?: string;
    has_feedback_text?: boolean;
    feedback_length?: number;
    timestamp?: string;
  };
}

export interface GTMTrainingEvent extends GTMEvent {
  event: 'plan_created_by_chat' | 'plan_created_by_image' | 'plan_created_by_manual';
  event_category: 'training';
  event_label?: string;
  custom_parameter?: {
    plan_title?: string;
    pet_type?: string;
    plan_reason?: string;
    plan_description?: string;
    image_analysis_type?: string;
    creation_method?: 'chat' | 'image_analysis' | 'manual';
    is_ai_generated?: boolean;
    timestamp?: string;
  };
}

// Union type for all GTM events
export type GTMEvent = GTMPageViewEvent | GTMEcommerceEvent | GTMAuthEvent | GTMEngagementEvent | GTMCommunityEvent | GTMSupportEvent | GTMTrainingEvent;

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
