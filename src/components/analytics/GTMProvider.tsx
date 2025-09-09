import React, { createContext, useContext, useEffect, useState } from 'react';
import { useGTM } from '@/hooks/useGTM';
import { getStoredConsent } from '@/utils/cookieConsent';
import type { GTMEvent } from '@/types/gtm';

interface GTMContextType {
  trackEvent: (event: GTMEvent) => void;
  trackChatStart: () => void;
  trackPaymentSuccess: (amount: number, transactionId?: string) => void;
  trackSignUp: (method?: string) => void;
  trackAddToCart: (amount: number, planType?: string) => void;
  trackPageView: (pagePath: string, pageTitle?: string) => void;
  trackLogin: (method?: string) => void;
  hasConsent: boolean;
  isGTMEnabled: boolean;
}

const GTMContext = createContext<GTMContextType | null>(null);

interface GTMProviderProps {
  children: React.ReactNode;
}

export const GTMProvider: React.FC<GTMProviderProps> = ({ children }) => {
  const gtm = useGTM();
  const [hasConsent, setHasConsent] = useState(false);
  const [isGTMEnabled, setIsGTMEnabled] = useState(false);

  useEffect(() => {
    // Check consent status
    const consent = getStoredConsent();
    const consentGiven = consent?.analytics === true;
    setHasConsent(consentGiven);

    // Check if GTM is enabled (not in development or explicitly enabled)
    const gtmEnabled = !import.meta.env.DEV || import.meta.env.VITE_ENABLE_GTM;
    setIsGTMEnabled(gtmEnabled);

    // Log GTM status
    console.log('GTM Status:', {
      enabled: gtmEnabled,
      hasConsent: consentGiven,
      environment: import.meta.env.MODE
    });
  }, []);

  const contextValue: GTMContextType = {
    ...gtm,
    hasConsent,
    isGTMEnabled,
  };

  return (
    <GTMContext.Provider value={contextValue}>
      {children}
    </GTMContext.Provider>
  );
};

export const useGTMContext = (): GTMContextType => {
  const context = useContext(GTMContext);
  if (!context) {
    throw new Error('useGTMContext must be used within a GTMProvider');
  }
  return context;
};

// Hook for conditional GTM tracking
export const useConditionalGTM = () => {
  const { hasConsent, isGTMEnabled, ...gtm } = useGTMContext();

  const conditionalTrackEvent = (event: GTMEvent) => {
    if (hasConsent && isGTMEnabled) {
      gtm.trackEvent(event);
    } else {
      console.log('GTM tracking skipped:', { hasConsent, isGTMEnabled, event });
    }
  };

  return {
    ...gtm,
    trackEvent: conditionalTrackEvent,
    hasConsent,
    isGTMEnabled,
  };
};
