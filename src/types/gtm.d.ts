
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
  event: 'purchase' | 'add_to_cart' | 'begin_checkout' | 'view_item';
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
}

export interface GTMAuthEvent extends GTMEvent {
  event: 'sign_up' | 'login' | 'logout';
  method?: string;
  user_id?: string;
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
