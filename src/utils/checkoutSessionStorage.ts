// Simple sessionStorage utility for checkout information
export interface CheckoutInformation {
  priceType: string;
  timestamp: string;
  source: string;
}

const CHECKOUT_INFO_KEY = 'checkout-information';

export const saveCheckoutInformation = (priceType: string, source: string = 'pricing-card'): void => {
  const checkoutInfo: CheckoutInformation = {
    priceType,
    timestamp: Date.now().toString(),
    source
  };
  
  try {
    sessionStorage.setItem(CHECKOUT_INFO_KEY, JSON.stringify(checkoutInfo));
    console.log('Checkout information saved:', checkoutInfo);
  } catch (error) {
    console.error('Failed to save checkout information:', error);
  }
};

export const getCheckoutInformation = (): CheckoutInformation | null => {
  try {
    const data = sessionStorage.getItem(CHECKOUT_INFO_KEY);
    if (!data) return null;
    
    const checkoutInfo: CheckoutInformation = JSON.parse(data);
    
    // Check if data is not older than 30 minutes
    const timestamp = parseInt(checkoutInfo.timestamp);
    const now = Date.now();
    const thirtyMinutes = 30 * 60 * 1000;
    
    if (now - timestamp > thirtyMinutes) {
      console.log('Checkout information expired, removing...');
      removeCheckoutInformation();
      return null;
    }
    
    return checkoutInfo;
  } catch (error) {
    console.error('Failed to get checkout information:', error);
    return null;
  }
};

export const removeCheckoutInformation = (): void => {
  try {
    sessionStorage.removeItem(CHECKOUT_INFO_KEY);
    console.log('Checkout information removed');
  } catch (error) {
    console.error('Failed to remove checkout information:', error);
  }
};

export const hasCheckoutInformation = (): boolean => {
  return getCheckoutInformation() !== null;
};
