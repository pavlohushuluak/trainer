import { useEffect, useRef } from 'react';
import { useGTM } from './useGTM';
import { getPlanById, getPrice } from '@/config/pricing';

// Global state to prevent multiple instances from triggering
const globalProcessedCancellations = new Set<string>();
const globalLastProcessedTime = { value: 0 };

export const usePurchaseCancel = () => {
  const { trackPurchaseCancel } = useGTM();
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    // Only run once per component mount
    if (hasProcessedRef.current) {
      return;
    }
    hasProcessedRef.current = true;

    const handlePurchaseCancel = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const checkoutCancelled = urlParams.get('checkout_cancelled');
      const success = urlParams.get('success');
      const sessionId = urlParams.get('session_id');
      const referrer = document.referrer;
      
      // Only proceed if we have a clear cancellation signal
      const isDirectCancel = checkoutCancelled === 'true';
      
      // Strict Stripe referrer check - only if we have checkout data AND came from Stripe
      const pendingCheckoutData = sessionStorage.getItem('pendingPaymentSuccess');
      const checkoutInfo = sessionStorage.getItem('checkout-information');
      const hasActiveCheckoutData = pendingCheckoutData || checkoutInfo;
      
      const isFromStripe = referrer && (
        referrer.includes('checkout.stripe.com') || 
        referrer.includes('js.stripe.com')
      );
      const isNotSuccess = success !== 'true' && !sessionId;
      const isStripeCancel = isFromStripe && isNotSuccess && hasActiveCheckoutData;
      
      // Only track if we have a definitive cancellation signal
      const shouldTrackCancel = isDirectCancel || isStripeCancel;
      
      if (!shouldTrackCancel) {
        return;
      }

      // Global deduplication - prevent multiple instances from triggering
      const currentTime = Date.now();
      const timeSinceLastProcess = currentTime - globalLastProcessedTime.value;
      
      // Create a stable key based on actual data, not timestamp
      const dataKey = pendingCheckoutData || checkoutInfo || 'no-data';
      const cancellationKey = `${isDirectCancel ? 'direct' : 'stripe'}_${window.location.pathname}_${dataKey.substring(0, 50)}`;
      
      // Prevent duplicates within 30 seconds OR if already processed this exact scenario
      if (timeSinceLastProcess < 30000 || globalProcessedCancellations.has(cancellationKey)) {
        console.log('🔄 Purchase cancellation blocked - duplicate or too recent:', {
          timeSinceLastProcess,
          hasKey: globalProcessedCancellations.has(cancellationKey),
          cancellationKey: cancellationKey.substring(0, 50)
        });
        return;
      }
      
      // Mark as processed globally
      globalProcessedCancellations.add(cancellationKey);
      globalLastProcessedTime.value = currentTime;
      
      // Clean up old entries to prevent memory leaks (keep last 100)
      if (globalProcessedCancellations.size > 100) {
        const entries = Array.from(globalProcessedCancellations);
        entries.slice(0, 50).forEach(key => globalProcessedCancellations.delete(key));
      }

      console.log('🚫 Purchase cancellation detected:', {
        method: isDirectCancel ? 'direct_cancel_param' : 'stripe_referrer',
        checkoutCancelled,
        isFromStripe,
        referrer: referrer?.substring(0, 50),
        hasActiveCheckoutData,
        currentPath: window.location.pathname
      });
      
      // Extract plan information
      let planType = 'unknown';
      let amount = 0;
      let cancelReason = isDirectCancel ? 'stripe_cancel_button' : 'stripe_redirect_cancel';
      
      // Try to get data from sessionStorage
      if (pendingCheckoutData) {
        try {
          const paymentData = JSON.parse(pendingCheckoutData);
          planType = paymentData.planType || paymentData.planId || 'unknown';
          amount = paymentData.amountEuros || (paymentData.amount ? paymentData.amount / 100 : 0);
          console.log('📦 Using pending payment data for cancel tracking:', { planType, amount });
        } catch (error) {
          console.error('Error parsing pending payment data:', error);
        }
      } else if (checkoutInfo) {
        try {
          const checkoutData = JSON.parse(checkoutInfo);
          planType = checkoutData.priceType || 'unknown';
          
          // Calculate amount from pricing config
          if (planType !== 'unknown') {
            const [planId, billingCycle] = planType.split('-');
            const plan = getPlanById(planId);
            if (plan) {
              const isHalfYearly = billingCycle === 'halfyearly';
              amount = getPrice(planId, isHalfYearly);
            }
          }
          console.log('📦 Using checkout info for cancel tracking:', { planType, amount });
        } catch (error) {
          console.error('Error parsing checkout info:', error);
        }
      }
      
      // Only track if we have meaningful data
      if (planType === 'unknown' && amount === 0) {
        console.log('🚫 Skipping cancel tracking - no meaningful data');
        return;
      }
      
      // Track the cancellation
      trackPurchaseCancel(planType, amount, cancelReason);
      
      // Clean up checkout data
      if (pendingCheckoutData) {
        sessionStorage.removeItem('pendingPaymentSuccess');
      }
      if (checkoutInfo) {
        sessionStorage.removeItem('checkout-information');
      }
      
      console.log('📊 Purchase cancellation tracked:', { 
        planType, 
        amount, 
        cancelReason,
        detectionMethod: isDirectCancel ? 'direct_cancel_param' : 'stripe_referrer'
      });
      
      // Clean up URL parameters
      if (checkoutCancelled) {
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    };

    // Run only once on mount
    handlePurchaseCancel();
  }, [trackPurchaseCancel]);
};
