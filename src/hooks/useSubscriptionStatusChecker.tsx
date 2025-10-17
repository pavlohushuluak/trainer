import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface SubscriptionStatus {
  subscribed: boolean;
  subscription_tier: string | null;
  current_period_end: string | null;
  isExpired: boolean;
}

export const useSubscriptionStatusChecker = () => {
  const { user } = useAuth();
  
  // Callback to invalidate subscription queries
  const invalidateSubscriptionQueries = useCallback(async () => {
    try {
      // Trigger a refetch by updating the query key
      // This will cause React Query to refetch the subscription data
      await supabase
        .from('subscribers')
        .select('subscribed, subscription_tier, current_period_end')
        .eq('user_id', user?.id)
        .maybeSingle();
    } catch (error) {
      // Ignore errors here as this is just for cache invalidation
    }
  }, [supabase, user?.id]);

  const checkSubscriptionStatus = useCallback(async (): Promise<SubscriptionStatus | null> => {
    if (!user) return null;

    try {
      // Get current subscription data
      const { data: subscriber, error } = await supabase
        .from('subscribers')
        .select('subscribed, subscription_tier, current_period_end')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching subscription status:', error);
        return null;
      }

      if (!subscriber) {
        console.log('No subscriber record found for user');
        return null;
      }

      // Check if subscription has expired
      const now = new Date();
      const periodEnd = subscriber.current_period_end ? new Date(subscriber.current_period_end) : null;
      const isExpired = subscriber.subscribed && periodEnd && periodEnd < now;

      // REMOVED: Frontend subscription expiration
      // Subscription expiration is now handled ONLY by server-side functions
      // This prevents:
      // - Premature expiration of trials
      // - Race conditions between frontend and backend
      // - Data corruption from concurrent updates
      // The frontend only CHECKS and DISPLAYS status, it doesn't modify it
      
      if (isExpired) {
        console.log('⚠️ Subscription appears expired - will be handled by server-side check-subscription-status function');
        // Don't update here - let the server handle it
      }

      return {
        subscribed: subscriber.subscribed,
        subscription_tier: subscriber.subscription_tier,
        current_period_end: subscriber.current_period_end,
        isExpired
      };

    } catch (error) {
      console.error('Error in subscription status check:', error);
      return null;
    }
  }, [supabase, user]);

  // Check subscription status when user changes
  useEffect(() => {
    if (user) {
      checkSubscriptionStatus();
    }
  }, [user, checkSubscriptionStatus]);

  return {
    checkSubscriptionStatus,
    invalidateSubscriptionQueries
  };
};
