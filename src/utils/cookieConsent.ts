
export interface CookieConsent {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
}

const CONSENT_KEY = 'tiertrainer24_cookie_consent';

export const getStoredConsent = (): CookieConsent | null => {
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) return null;
    
    const consent = JSON.parse(stored) as CookieConsent;
    
    // Check if consent is older than 13 months (GDPR requirement)
    const thirteenMonths = 13 * 30 * 24 * 60 * 60 * 1000;
    if (Date.now() - consent.timestamp > thirteenMonths) {
      localStorage.removeItem(CONSENT_KEY);
      return null;
    }
    
    return consent;
  } catch {
    return null;
  }
};

export const storeConsent = (consent: Omit<CookieConsent, 'timestamp'>) => {
  const consentWithTimestamp: CookieConsent = {
    ...consent,
    timestamp: Date.now()
  };
  
  localStorage.setItem(CONSENT_KEY, JSON.stringify(consentWithTimestamp));
  
  // Initialize tracking based on consent
  if (consent.analytics) {
    initializeAnalytics();
  }
  
  if (consent.marketing) {
    initializeMarketing();
  }
};

export const clearConsent = () => {
  localStorage.removeItem(CONSENT_KEY);
};

export const hasConsent = (): boolean => {
  return getStoredConsent() !== null;
};

// Initialize analytics (Google Analytics, etc.)
const initializeAnalytics = () => {
  // Analytics tracking initialized
  // Hier würde Google Analytics oder Matomo initialisiert werden
  // Beispiel für Google Analytics:
  // gtag('config', 'GA_MEASUREMENT_ID');
};

// Initialize marketing tools
const initializeMarketing = () => {
  // Marketing tracking initialized
  // Hier würden Marketing-Tools initialisiert werden
};

// Load tracking scripts based on consent
export const loadTrackingScripts = (consent: CookieConsent) => {
  if (consent.analytics) {
    initializeAnalytics();
  }
  
  if (consent.marketing) {
    initializeMarketing();
  }
};
