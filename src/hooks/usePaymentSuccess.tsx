
import { useEffect, useRef } from 'react';
import { useGTM } from './useGTM';
import { supabase } from '@/integrations/supabase/client';

// Global cache to prevent duplicate API calls
const paymentDataCache = new Map<string, any>();
const pendingRequests = new Map<string, Promise<any>>();

export const usePaymentSuccess = () => {
  const { trackPaymentSuccess } = useGTM();
  const processedSessionsRef = useRef(new Set<string>());

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      // Check URL parameters for successful payment
      const urlParams = new URLSearchParams(window.location.search);
      const success = urlParams.get('success');
      const sessionId = urlParams.get('session_id');

      if (success === 'true' && sessionId) {
        // Check if this session was already processed
        if (processedSessionsRef.current.has(sessionId)) {
          console.log('🔄 Payment success already processed for session:', sessionId);
          return;
        }

        // Mark session as being processed
        processedSessionsRef.current.add(sessionId);

        console.log('🎉 Payment success detected, fetching payment data from Stripe...', { sessionId });
        
        try {
          // Check cache first
          if (paymentDataCache.has(sessionId)) {
            console.log('📦 Using cached payment data for session:', sessionId);
            const cachedData = paymentDataCache.get(sessionId);
            trackPaymentSuccess(
              cachedData.amountEuros,
              cachedData.transactionId,
              cachedData.items,
              cachedData.planType
            );
            return;
          }

          // Check if there's already a pending request for this session
          if (pendingRequests.has(sessionId)) {
            console.log('⏳ Waiting for existing request for session:', sessionId);
            const existingRequest = pendingRequests.get(sessionId);
            const result = await existingRequest;
            if (result?.data?.success && result?.data?.data) {
              const paymentData = result.data.data;
              trackPaymentSuccess(
                paymentData.amountEuros,
                paymentData.transactionId,
                paymentData.items,
                paymentData.planType
              );
            }
            return;
          }

          // Create new request and cache it
          const requestPromise = supabase.functions.invoke('get-payment-data', {
            body: { sessionId }
          });
          
          pendingRequests.set(sessionId, requestPromise);
          const { data, error } = await requestPromise;

          if (error) {
            console.error('Error fetching payment data:', error);
            // Fallback to session storage or defaults
            await handlePaymentSuccessFallback(sessionId);
            return;
          }

          // Clean up pending request
          pendingRequests.delete(sessionId);

          if (data?.success && data?.data) {
            const paymentData = data.data;
            console.log('✅ Payment data fetched successfully:', paymentData);
            
            // Cache the payment data
            paymentDataCache.set(sessionId, paymentData);
            
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
          // Clean up pending request on error
          pendingRequests.delete(sessionId);
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
