
import { useEffect } from 'react';
import { useGTM } from './useGTM';

export const usePaymentSuccess = () => {
  const { trackPaymentSuccess } = useGTM();

  useEffect(() => {
    // Check URL parameters for successful payment
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const sessionId = urlParams.get('session_id');

    if (success === 'true' && sessionId) {
      // Track payment success - default amount, could be enhanced to get actual amount
      const amount = 9.99; // This could be improved to get the actual amount from the session
      trackPaymentSuccess(amount);
      
      // Clean up URL parameters
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [trackPaymentSuccess]);
};
