import { useEffect, useRef } from 'react';
import { useGTM } from './useGTM';

export const usePurchaseCancel = () => {
  const { trackPurchaseCancel } = useGTM();
  const processedCancellationsRef = useRef(new Set<string>());

  useEffect(() => {
    const handlePurchaseCancel = () => {
      // Check URL parameters and referrer for cancelled checkout
      const urlParams = new URLSearchParams(window.location.search);
      const success = urlParams.get('success');
      const sessionId = urlParams.get('session_id');
      const referrer = document.referrer;
      
      // Check if user came back from Stripe checkout without success
      const isFromStripe = referrer && referrer.includes('checkout.stripe.com');
      const isNotSuccess = success !== 'true' && !sessionId;
      
      // Also check sessionStorage for pending checkout data that wasn't completed
      const pendingCheckoutData = sessionStorage.getItem('pendingPaymentSuccess');
      const checkoutInfo = sessionStorage.getItem('checkout-information');
      
      if (isFromStripe && isNotSuccess) {
        console.log('🚫 Purchase cancellation detected from Stripe redirect');
        
        // Generate a unique key for this cancellation to prevent duplicates
        const cancellationKey = `${Date.now()}_${referrer}`;
        
        if (processedCancellationsRef.current.has(cancellationKey)) {
          console.log('🔄 Purchase cancellation already processed');
          return;
        }
        
        processedCancellationsRef.current.add(cancellationKey);
        
        // Try to get plan information from sessionStorage
        let planType = 'unknown';
        let amount = 0;
        
        if (pendingCheckoutData) {
          try {
            const paymentData = JSON.parse(pendingCheckoutData);
            planType = paymentData.planType || paymentData.planId || 'unknown';
            amount = paymentData.amountEuros || (paymentData.amount ? paymentData.amount / 100 : 0);
          } catch (error) {
            console.error('Error parsing pending checkout data:', error);
          }
        } else if (checkoutInfo) {
          try {
            const checkoutData = JSON.parse(checkoutInfo);
            planType = checkoutData.priceType || 'unknown';
            // Amount would need to be calculated from pricing config
          } catch (error) {
            console.error('Error parsing checkout info:', error);
          }
        }
        
        // Track purchase cancellation
        trackPurchaseCancel(planType, amount, 'user_cancelled');
        
        // Clean up any pending checkout data
        sessionStorage.removeItem('pendingPaymentSuccess');
        
        console.log('📊 Purchase cancellation tracked:', { planType, amount });
      }
      
      // Also handle cases where user navigates away during checkout process
      const handleBeforeUnload = () => {
        const currentUrl = window.location.href;
        const isOnCheckoutPage = currentUrl.includes('checkout') || currentUrl.includes('pricing');
        
        if (isOnCheckoutPage && (pendingCheckoutData || checkoutInfo)) {
          // User is leaving a checkout-related page with pending data
          // This could indicate an abandonment, but we'll only track confirmed cancellations from Stripe
        }
      };
      
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    };

    handlePurchaseCancel();
  }, [trackPurchaseCancel]);
};
