
import { useEffect } from 'react';
import type { GTMEvent, GTMPageViewEvent, GTMEcommerceEvent, GTMAuthEvent } from '@/types/gtm';
import { getStoredConsent } from '@/utils/cookieConsent';

export const useGTM = () => {
  useEffect(() => {
    // Ensure dataLayer exists (GTM is already initialized in HTML)
    if (!window.dataLayer) {
      window.dataLayer = [];
    }

    // In development, create a mock dataLayer if GTM is disabled
    if (import.meta.env.DEV && !import.meta.env.VITE_ENABLE_GTM) {
      console.log('GTM disabled in development mode');
      return;
    }
  }, []);

  // Helper function to check if analytics consent is given
  const hasAnalyticsConsent = (): boolean => {
    const consent = getStoredConsent();
    return consent?.analytics === true;
  };

  const trackEvent = (event: GTMEvent) => {
    try {
      // Check if analytics consent is given before tracking
      if (!hasAnalyticsConsent()) {
        console.log('GTM tracking skipped - no analytics consent');
        return;
      }

      if (window.dataLayer) {
        window.dataLayer.push(event);
        console.log('GTM Event tracked:', event);
      }
    } catch (error) {
      console.warn('GTM trackEvent failed:', error);
    }
  };

  // Specific tracking functions with proper types
  const trackChatStart = (chatType?: string, petType?: string) => {
    trackEvent({
      event: 'chat_start',
      event_category: 'engagement',
      event_label: chatType || 'general_chat',
      custom_parameter: {
        chat_type: chatType || 'general',
        pet_type: petType || 'unknown',
        timestamp: new Date().toISOString()
      }
    });
  };

  const trackPaymentSuccess = (
    amount: number, 
    transactionId: string, 
    items: Array<{
      item_id: string;
      item_name: string;
      category: string;
      quantity: number;
      price: number;
    }>,
    planType?: string
  ) => {
    trackEvent({
      event: 'purchase',
      transaction_id: transactionId,
      value: amount,
      currency: 'EUR',
      items: items,
      event_category: 'ecommerce',
      custom_parameter: {
        plan_type: planType || 'subscription',
        payment_method: 'stripe',
        timestamp: new Date().toISOString()
      }
    });
  };

  const trackSignUp = (method?: string) => {
    trackEvent({
      event: 'sign_up',
      method: method || 'email',
      event_category: 'auth'
    });
  };

  const trackAddToCart = (
    amount: number, 
    planType: string,
    planId: string,
    planName: string
  ) => {
    trackEvent({
      event: 'add_to_cart',
      value: amount,
      currency: 'EUR',
      items: [{
        item_id: planId,
        item_name: planName,
        category: 'subscription_plan',
        quantity: 1,
        price: amount
      }],
      event_category: 'ecommerce',
      event_label: planType,
      custom_parameter: {
        plan_type: planType,
        plan_id: planId,
        timestamp: new Date().toISOString()
      }
    });
  };

  const trackBeginCheckout = (
    amount: number,
    planType: string,
    planId: string,
    planName: string
  ) => {
    trackEvent({
      event: 'begin_checkout',
      value: amount,
      currency: 'EUR',
      items: [{
        item_id: planId,
        item_name: planName,
        category: 'subscription_plan',
        quantity: 1,
        price: amount
      }],
      event_category: 'ecommerce',
      custom_parameter: {
        plan_type: planType,
        plan_id: planId,
        timestamp: new Date().toISOString()
      }
    });
  };

  const trackViewItem = (
    planId: string,
    planName: string,
    planType: string,
    price: number
  ) => {
    trackEvent({
      event: 'view_item',
      value: price,
      currency: 'EUR',
      items: [{
        item_id: planId,
        item_name: planName,
        category: 'subscription_plan',
        quantity: 1,
        price: price
      }],
      event_category: 'ecommerce',
      custom_parameter: {
        plan_type: planType,
        plan_id: planId,
        timestamp: new Date().toISOString()
      }
    });
  };

  const trackPageView = (pagePath: string, pageTitle?: string) => {
    trackEvent({
      event: 'page_view',
      page_path: pagePath,
      page_title: pageTitle || document.title,
      page_location: window.location.href
    });
  };

  const trackLogin = (method?: string) => {
    trackEvent({
      event: 'login',
      method: method || 'email',
      event_category: 'auth',
      custom_parameter: {
        login_method: method || 'email',
        timestamp: new Date().toISOString()
      }
    });
  };

  const trackChatMessage = (messageType: 'user' | 'assistant', messageLength?: number) => {
    trackEvent({
      event: 'chat_message',
      event_category: 'engagement',
      event_label: messageType,
      custom_parameter: {
        message_type: messageType,
        message_length: messageLength || 0,
        timestamp: new Date().toISOString()
      }
    });
  };

  const trackSubscriptionUpgrade = (fromPlan: string, toPlan: string, amount: number) => {
    trackEvent({
      event: 'subscription_upgrade',
      event_category: 'ecommerce',
      value: amount,
      currency: 'EUR',
      custom_parameter: {
        from_plan: fromPlan,
        to_plan: toPlan,
        upgrade_amount: amount,
        timestamp: new Date().toISOString()
      }
    });
  };

  const trackFeatureUsage = (featureName: string, featureCategory: string) => {
    trackEvent({
      event: 'feature_usage',
      event_category: 'engagement',
      event_label: featureName,
      custom_parameter: {
        feature_name: featureName,
        feature_category: featureCategory,
        timestamp: new Date().toISOString()
      }
    });
  };

  return {
    trackEvent,
    trackChatStart,
    trackChatMessage,
    trackPaymentSuccess,
    trackSignUp,
    trackAddToCart,
    trackBeginCheckout,
    trackViewItem,
    trackPageView,
    trackLogin,
    trackSubscriptionUpgrade,
    trackFeatureUsage,
  };
};
