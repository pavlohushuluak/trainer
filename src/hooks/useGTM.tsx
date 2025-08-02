
import { useEffect } from 'react';

export const useGTM = () => {
  useEffect(() => {
    // Check if GTM is already loaded
    if (window.dataLayer) {
      return;
    }

    // Only load GTM in production or if explicitly enabled
    if (import.meta.env.DEV && !import.meta.env.VITE_ENABLE_GTM) {
      // Create a mock dataLayer for development
      window.dataLayer = [];
      return;
    }

    try {
      // Initialize dataLayer
      window.dataLayer = window.dataLayer || [];
      
      // GTM script injection with error handling
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-YOUR-ID';
      
      // Add error handling for script loading
      script.onerror = () => {
        console.warn('GTM script failed to load - continuing without analytics');
      };
      
      script.onload = () => {
        // Initialize GTM only after successful load
        window.dataLayer.push({
          'gtm.start': new Date().getTime(),
          event: 'gtm.js'
        });
      };
      
      document.head.appendChild(script);
    } catch (error) {
      console.warn('GTM initialization failed:', error);
      // Create a mock dataLayer to prevent errors
      window.dataLayer = [];
    }
  }, []);

  const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
    try {
      if (window.dataLayer) {
        window.dataLayer.push({
          event: eventName,
          ...parameters
        });
      }
    } catch (error) {
      console.warn('GTM trackEvent failed:', error);
    }
  };

  // Specific tracking functions for backward compatibility
  const trackChatStart = () => {
    trackEvent('start_chat');
  };

  const trackPaymentSuccess = (amount: number) => {
    trackEvent('payment_success', {
      value: amount,
    });
  };

  const trackSignUp = () => {
    trackEvent('sign_up');
  };

  const trackAddToCart = (amount: number) => {
    trackEvent('add_to_cart', {
      value: amount,
    });
  };

  return {
    trackEvent,
    trackChatStart,
    trackPaymentSuccess,
    trackSignUp,
    trackAddToCart,
  };
};
