import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useGTM } from './useGTM';
import { getPlanById, getPrice } from '@/config/pricing';

export const usePurchaseCancel = () => {
  const { trackPurchaseCancel } = useGTM();
  const location = useLocation();
  const processedCancellationsRef = useRef(new Set<string>());
  const lastLocationRef = useRef<string>('');

  useEffect(() => {
    const handlePurchaseCancel = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const checkoutCancelled = urlParams.get('checkout_cancelled');
      const success = urlParams.get('success');
      const sessionId = urlParams.get('session_id');
      const referrer = document.referrer;
      
      // Method 1: Direct cancel parameter from Stripe
      const isDirectCancel = checkoutCancelled === 'true';
      
      // Method 2: Coming from Stripe without success
      const isFromStripe = referrer && (
        referrer.includes('checkout.stripe.com') || 
        referrer.includes('js.stripe.com')
      );
      const isNotSuccess = success !== 'true' && !sessionId;
      const isStripeCancel = isFromStripe && isNotSuccess;
      
      // Method 3: Landing on cancel URL without success after having checkout data
      const pendingCheckoutData = sessionStorage.getItem('pendingPaymentSuccess');
      const checkoutInfo = sessionStorage.getItem('checkout-information');
      const hasCheckoutData = pendingCheckoutData || checkoutInfo;
      const isOnCancelPath = window.location.pathname === '/' || window.location.pathname === '/mein-tiertraining';
      const isLikelyCancel = hasCheckoutData && isOnCancelPath && isNotSuccess;
      
      // Method 4: Check if user just navigated from a different page and we have stale checkout data
      const currentLocation = `${window.location.pathname}${window.location.search}`;
      const hasLocationChanged = lastLocationRef.current !== currentLocation;
      lastLocationRef.current = currentLocation;
      
      const shouldTrackCancel = isDirectCancel || isStripeCancel || isLikelyCancel;
      
      if (shouldTrackCancel) {
        console.log('🚫 Purchase cancellation detected:', {
          method: isDirectCancel ? 'direct_cancel_param' : 
                  isStripeCancel ? 'stripe_referrer' : 
                  isLikelyCancel ? 'cancel_path_with_data' : 'unknown',
          checkoutCancelled,
          isFromStripe,
          referrer,
          hasCheckoutData,
          currentPath: window.location.pathname
        });
        
        // Generate unique cancellation key
        const cancellationKey = `cancel_${Date.now()}_${window.location.pathname}`;
        
        if (processedCancellationsRef.current.has(cancellationKey)) {
          console.log('🔄 Purchase cancellation already processed');
          return;
        }
        
        processedCancellationsRef.current.add(cancellationKey);
        
        // Extract plan information
        let planType = 'unknown';
        let amount = 0;
        let cancelReason = 'user_cancelled';
        
        // Try to get data from sessionStorage first
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
        
        // Determine cancel reason based on detection method
        if (isDirectCancel) {
          cancelReason = 'stripe_cancel_button';
        } else if (isFromStripe) {
          cancelReason = 'stripe_redirect_cancel';
        } else {
          cancelReason = 'checkout_abandonment';
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
          detectionMethod: isDirectCancel ? 'direct_cancel_param' : 
                          isStripeCancel ? 'stripe_referrer' : 'cancel_path_with_data'
        });
        
        // Clean up URL parameters
        if (checkoutCancelled) {
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        }
      }
    };

    // Run on mount and location changes
    handlePurchaseCancel();
  }, [location, trackPurchaseCancel]);
};
