
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
      // Try to get payment data from sessionStorage first
      const pendingPaymentData = sessionStorage.getItem('pendingPaymentSuccess');
      
      if (pendingPaymentData) {
        try {
          const paymentData = JSON.parse(pendingPaymentData);
          console.log('🔍 Payment success data found in sessionStorage:', paymentData);
          
          // Use actual payment data from sessionStorage
          const amount = paymentData.amountEuros || (paymentData.amount / 100) || 9.99; // Convert from cents if needed
          const planType = paymentData.planType || 'subscription';
          const planName = paymentData.planName || 'Subscription Plan';
          const billingCycle = paymentData.billingCycle || 'monthly';
          
          trackPaymentSuccess(amount, sessionId, planType, planName, billingCycle);
          
          // Clean up sessionStorage
          sessionStorage.removeItem('pendingPaymentSuccess');
          
          console.log('✅ Payment success tracked with actual data:', {
            amount,
            sessionId,
            planType,
            planName,
            billingCycle
          });
        } catch (error) {
          console.error('Error parsing payment success data:', error);
          // Fallback to default tracking
          trackPaymentSuccess(9.99, sessionId, 'subscription', 'Subscription Plan', 'monthly');
        }
      } else {
        // Fallback: Track with minimal data if no sessionStorage data available
        console.log('⚠️ No payment data in sessionStorage, using fallback');
        trackPaymentSuccess(9.99, sessionId, 'subscription', 'Subscription Plan', 'monthly');
      }
      
      // Clean up URL parameters
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [trackPaymentSuccess]);
};
