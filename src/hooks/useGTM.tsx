
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
  const trackChatStart = () => {
    trackEvent({
      event: 'start_chat',
      event_category: 'engagement',
      event_label: 'chat_started'
    });
  };

  const trackPaymentSuccess = (amount: number, transactionId?: string) => {
    trackEvent({
      event: 'purchase',
      value: amount,
      currency: 'EUR',
      transaction_id: transactionId,
      event_category: 'ecommerce'
    });
  };

  const trackSignUp = (method?: string) => {
    trackEvent({
      event: 'sign_up',
      method: method || 'email',
      event_category: 'auth'
    });
  };

  const trackAddToCart = (amount: number, planType?: string) => {
    trackEvent({
      event: 'add_to_cart',
      value: amount,
      currency: 'EUR',
      event_category: 'ecommerce',
      event_label: planType || 'subscription_plan'
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
      event_category: 'auth'
    });
  };

  return {
    trackEvent,
    trackChatStart,
    trackPaymentSuccess,
    trackSignUp,
    trackAddToCart,
    trackPageView,
    trackLogin,
  };
};
