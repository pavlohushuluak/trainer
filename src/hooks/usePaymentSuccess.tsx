
import { useEffect } from 'react';
import { useGTM } from './useGTM';
import { getPlanById, getPrice } from '@/config/pricing';

export const usePaymentSuccess = () => {
  const { trackPaymentSuccess } = useGTM();

  useEffect(() => {
    // Check URL parameters for successful payment
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const sessionId = urlParams.get('session_id');
    const userEmail = urlParams.get('user_email');

    if (success === 'true' && sessionId) {
      // Get checkout data from sessionStorage
      const checkoutData = sessionStorage.getItem('pendingPaymentSuccess');
      let amount = 990; // Default fallback in cents (9.90 EUR)
      let planType = 'plan1-monthly'; // Default fallback
      let planName = '1 Tier Monthly Plan'; // Default fallback
      let planId = 'plan1'; // Default fallback
      
      if (checkoutData) {
        try {
          const data = JSON.parse(checkoutData);
          // Amount should already be in cents from CheckoutButton
          amount = data.amount || amount;
          planType = data.planType || planType;
          planName = data.planName || planName;
          planId = data.planId || planId;
          
          console.log('💰 Payment success data retrieved:', { 
            amount, planType, planName, planId, sessionId 
          });
        } catch (error) {
          console.warn('Error parsing checkout data:', error);
        }
      } else {
        // Fallback: try to get from URL or reconstruct
        console.warn('No checkout data found, using defaults');
      }

      // Track payment success with proper items array
      const items = [{
        item_id: planId,
        item_name: planName,
        category: 'subscription_plan',
        quantity: 1,
        price: amount
      }];

      console.log('🏷️ usePaymentSuccess: Tracking payment success event', { 
        amount, sessionId, items, planType 
      });
      
      trackPaymentSuccess(amount, sessionId, items, planType);
      
      // Clean up URL parameters and session storage
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      sessionStorage.removeItem('pendingPaymentSuccess');
    }
  }, [trackPaymentSuccess]);
};
