
import { useEffect } from 'react';
import { useGTM } from './useGTM';
import { supabase } from '@/integrations/supabase/client';

export const usePaymentSuccess = () => {
  const { trackPaymentSuccess } = useGTM();

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      // Check URL parameters for successful payment
      const urlParams = new URLSearchParams(window.location.search);
      const success = urlParams.get('success');
      const sessionId = urlParams.get('session_id');

      if (success === 'true' && sessionId) {
        console.log('🎉 Payment success detected, fetching payment data from Stripe...', { sessionId });
        
        try {
          // Fetch actual payment data from Stripe via Supabase function
          const { data, error } = await supabase.functions.invoke('get-payment-data', {
            body: { sessionId }
          });

          if (error) {
            console.error('Error fetching payment data:', error);
            // Fallback to session storage or defaults
            await handlePaymentSuccessFallback(sessionId);
            return;
          }

          if (data?.success && data?.data) {
            const paymentData = data.data;
            console.log('✅ Payment data fetched successfully:', paymentData);
            
            // Track payment success with real Stripe data
            trackPaymentSuccess(
              paymentData.amountEuros,
              paymentData.transactionId,
              paymentData.items,
              paymentData.planType
            );
          } else {
            console.warn('Invalid payment data response, using fallback');
            await handlePaymentSuccessFallback(sessionId);
          }
        } catch (error) {
          console.error('Error calling get-payment-data function:', error);
          await handlePaymentSuccessFallback(sessionId);
        }
        
        // Clean up URL parameters
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    };

    const handlePaymentSuccessFallback = async (sessionId: string) => {
      console.log('🔄 Using fallback payment tracking...');
      
      // Get payment data from session storage as fallback
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
          console.log('📦 Payment success data found in sessionStorage:', paymentData);
          
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
          console.error('Error parsing payment data from sessionStorage:', error);
        }
      }

      // Track payment success with fallback data
      trackPaymentSuccess(amount, sessionId, items, planType);
    };

    handlePaymentSuccess();
  }, [trackPaymentSuccess]);
};
