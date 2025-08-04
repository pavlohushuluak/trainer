
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
      
      // Use the correct GTM ID from the HTML
      const gtmId = 'GTM-TVRLCS6X';
      
      // GTM script injection with error handling and timeout
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
      
      // Add timeout to prevent hanging
      const timeoutId = setTimeout(() => {
        console.warn('GTM script loading timeout - continuing without analytics');
        window.dataLayer = window.dataLayer || [];
      }, 5000); // 5 second timeout
      
      // Add error handling for script loading
      script.onerror = () => {
        clearTimeout(timeoutId);
        console.warn('GTM script failed to load - continuing without analytics');
        window.dataLayer = window.dataLayer || [];
      };
      
      script.onload = () => {
        clearTimeout(timeoutId);
        // Initialize GTM only after successful load
        try {
          window.dataLayer.push({
            'gtm.start': new Date().getTime(),
            event: 'gtm.js'
          });
        } catch (error) {
          console.warn('GTM initialization failed:', error);
        }
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
