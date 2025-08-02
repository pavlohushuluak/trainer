
import { useState, useEffect } from 'react';
import { getStoredConsent, storeConsent, clearConsent, CookieConsent } from '@/utils/cookieConsent';

export const useCookieConsent = () => {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [hasGivenConsent, setHasGivenConsent] = useState(false);

  useEffect(() => {
    const storedConsent = getStoredConsent();
    if (storedConsent) {
      setConsent(storedConsent);
      setHasGivenConsent(true);
    }
  }, []);

  const updateConsent = (newConsent: Omit<CookieConsent, 'timestamp'>) => {
    storeConsent(newConsent);
    const updatedConsent = getStoredConsent();
    setConsent(updatedConsent);
    setHasGivenConsent(true);
  };

  const revokeConsent = () => {
    clearConsent();
    setConsent(null);
    setHasGivenConsent(false);
    // Reload page to clear any tracking scripts
    window.location.reload();
  };

  const hasAnalyticsConsent = consent?.analytics ?? false;
  const hasMarketingConsent = consent?.marketing ?? false;

  return {
    consent,
    hasGivenConsent,
    hasAnalyticsConsent,
    hasMarketingConsent,
    updateConsent,
    revokeConsent
  };
};
