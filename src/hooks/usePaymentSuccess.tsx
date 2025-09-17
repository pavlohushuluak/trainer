
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
      // Get payment data from session storage
      const pendingPaymentData = sessionStorage.getItem('pendingPaymentSuccess');
      let amount = 9.99; // Default fallback
      let items = [{
        item_id: 'subscription',
        item_name: 'Subscription Plan',
        category: 'subscription',
        quantity: 1,
        price: amount
      }];
      let planType = 'subscription';

      if (pendingPaymentData) {
        try {
          const paymentData = JSON.parse(pendingPaymentData);
          console.log('Payment success data found:', paymentData);
          
          if (paymentData.amount) {
            amount = paymentData.amount / 100; // Convert from cents to euros
          }
          if (paymentData.planName && paymentData.planType) {
            items = [{
              item_id: paymentData.planType,
              item_name: paymentData.planName,
              category: 'subscription',
              quantity: 1,
              price: amount
            }];
            planType = paymentData.planType;
          }
        } catch (error) {
          console.error('Error parsing payment data:', error);
        }
      }

      // Track payment success with proper items array
      trackPaymentSuccess(amount, sessionId, items, planType);
      
      // Clean up URL parameters
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [trackPaymentSuccess]);
};
