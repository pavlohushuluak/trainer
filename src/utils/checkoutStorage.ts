
// Centralized checkout storage utility with robust persistence
export interface CheckoutData {
  priceType: string;
  timestamp: string;
  sessionId: string;
  origin: string;
}

const CHECKOUT_KEY = 'pendingCheckout';
const PRICE_TYPE_KEY = 'pendingCheckoutPriceType';
const TIMESTAMP_KEY = 'pendingCheckoutTimestamp';
const SESSION_ID_KEY = 'pendingCheckoutSessionId';
const ORIGIN_KEY = 'pendingCheckoutOrigin';
const URL_PARAM = 'checkout';

// 30 minutes expiration time
const EXPIRATION_TIME = 30 * 60 * 1000;

export const generateCheckoutSessionId = (): string => {
  return `checkout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const setCheckoutFlags = (priceType: string, origin?: string): string => {
  const timestamp = Date.now().toString();
  const sessionId = generateCheckoutSessionId();
  const originUrl = origin || window.location.href;

  // Triple persistence: localStorage, sessionStorage, URL
  const data = {
    [CHECKOUT_KEY]: 'true',
    [PRICE_TYPE_KEY]: priceType,
    [TIMESTAMP_KEY]: timestamp,
    [SESSION_ID_KEY]: sessionId,
    [ORIGIN_KEY]: originUrl
  };

  // Store in localStorage (most persistent)
  Object.entries(data).forEach(([key, value]) => {
    localStorage.setItem(key, value);
  });

  // Store in sessionStorage (fallback)
  Object.entries(data).forEach(([key, value]) => {
    sessionStorage.setItem(key, value);
  });

  // Add URL parameter (additional fallback)
  const url = new URL(window.location.href);
  url.searchParams.set(URL_PARAM, priceType);
  url.searchParams.set('session', sessionId);
  window.history.replaceState({}, '', url.toString());

  return sessionId;
};

export const getCheckoutFlags = (): { hasPendingCheckout: boolean; data: CheckoutData | null } => {
  // Check localStorage first (most persistent)
  const localPending = localStorage.getItem(CHECKOUT_KEY);
  const localPriceType = localStorage.getItem(PRICE_TYPE_KEY);
  const localTimestamp = localStorage.getItem(TIMESTAMP_KEY);
  const localSessionId = localStorage.getItem(SESSION_ID_KEY);
  const localOrigin = localStorage.getItem(ORIGIN_KEY);

  // Check sessionStorage (fallback)
  const sessionPending = sessionStorage.getItem(CHECKOUT_KEY);
  const sessionPriceType = sessionStorage.getItem(PRICE_TYPE_KEY);
  const sessionTimestamp = sessionStorage.getItem(TIMESTAMP_KEY);

  // Check URL parameters (additional fallback)
  const urlParams = new URLSearchParams(window.location.search);
  const urlPriceType = urlParams.get(URL_PARAM);
  const urlSessionId = urlParams.get('session');

  // Validate timestamp (should not be older than 30 minutes)
  const timestampToCheck = localTimestamp || sessionTimestamp;
  const isTimestampValid = !timestampToCheck || (Date.now() - parseInt(timestampToCheck)) < EXPIRATION_TIME;

  if (!isTimestampValid && timestampToCheck) {
    clearCheckoutFlags();
    return { hasPendingCheckout: false, data: null };
  }

  // Determine if we have a pending checkout from any source
  const hasPendingCheckout = localPending === 'true' || sessionPending === 'true' || !!urlPriceType;
  const priceType = localPriceType || sessionPriceType || urlPriceType;

  if (!hasPendingCheckout || !priceType) {
    return { hasPendingCheckout: false, data: null };
  }

  const data: CheckoutData = {
    priceType,
    timestamp: timestampToCheck || Date.now().toString(),
    sessionId: localSessionId || urlSessionId || 'unknown',
    origin: localOrigin || window.location.href
  };

  return { hasPendingCheckout: true, data };
};

export const clearCheckoutFlags = (): void => {
  // Clear localStorage
  [CHECKOUT_KEY, PRICE_TYPE_KEY, TIMESTAMP_KEY, SESSION_ID_KEY, ORIGIN_KEY].forEach(key => {
    localStorage.removeItem(key);
  });

  // Clear sessionStorage
  [CHECKOUT_KEY, PRICE_TYPE_KEY, TIMESTAMP_KEY].forEach(key => {
    sessionStorage.removeItem(key);
  });

  // Clear URL parameters
  const url = new URL(window.location.href);
  url.searchParams.delete(URL_PARAM);
  url.searchParams.delete('session');
  window.history.replaceState({}, '', url.toString());
};

export const debugCheckoutState = (): void => {
  // Debug functionality removed
};
