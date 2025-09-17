
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
  event: 'purchase' | 'purchase_cancel' | 'add_to_cart' | 'begin_checkout' | 'view_item' | 'subscription_upgrade' | 'subscription_upgrade_monthly' | 'subscription_upgrade_halfyearly';
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
    amount?: number;
    cancel_reason?: string;
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
  event: 'plan_created_by_chat' | 'plan_created_by_image' | 'plan_created_by_manual' | 'plan_completed' | 'plan_started' | 'plan_deleted';
  event_category: 'training';
  event_label?: string;
  custom_parameter?: {
    plan_id?: string;
    plan_title?: string;
    pet_type?: string;
    plan_reason?: string;
    plan_description?: string;
    image_analysis_type?: string;
    creation_method?: 'chat' | 'image_analysis' | 'manual';
    is_ai_generated?: boolean;
    completion_time_days?: number;
    timestamp?: string;
  };
}

export interface GTMPetManagementEvent extends GTMEvent {
  event: 'add_pet_profile' | 'edit_pet_profile' | 'delete_pet_profile';
  event_category: 'pet_management';
  event_label?: string;
  custom_parameter?: {
    pet_type?: string;
    pet_name?: string;
    edited_fields?: string;
    timestamp?: string;
  };
}

export interface GTMImageAnalysisEvent extends GTMEvent {
  event: 'image_analysis_start' | 'image_analysis_complete' | 'image_analysis_error';
  event_category: 'image_analysis';
  event_label?: string;
  custom_parameter?: {
    pet_type?: string;
    analysis_type?: string;
    confidence_level?: string;
    error_type?: string;
    timestamp?: string;
  };
}

export interface GTMSettingsEvent extends GTMEvent {
  event: 'edit_profile' | 'change_language' | 'change_password' | 'change_dark';
  event_category: 'settings';
  event_label?: string;
  custom_parameter?: {
    fields_changed?: string;
    from_language?: string;
    to_language?: string;
    change_method?: 'current_password' | 'email_verification';
    from_theme?: string;
    to_theme?: string;
    timestamp?: string;
  };
}

// Union type for all GTM events
export type GTMEvent = GTMPageViewEvent | GTMEcommerceEvent | GTMAuthEvent | GTMEngagementEvent | GTMCommunityEvent | GTMSupportEvent | GTMTrainingEvent | GTMPetManagementEvent | GTMImageAnalysisEvent | GTMSettingsEvent;

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
