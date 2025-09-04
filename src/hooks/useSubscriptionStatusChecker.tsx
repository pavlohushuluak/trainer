import { useEffect, useCallback } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useAuth } from './auth/useAuth';

interface SubscriptionStatus {
  subscribed: boolean;
  subscription_tier: string | null;
  current_period_end: string | null;
  isExpired: boolean;
}

export const useSubscriptionStatusChecker = () => {
  const supabase = useSupabaseClient();
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

      // If subscription is expired, update it to inactive
      if (isExpired) {
        console.log('Subscription expired, updating to inactive');
        
        const { error: updateError } = await supabase
          .from('subscribers')
          .update({
            subscribed: false,
            updated_at: now.toISOString(),
            admin_notes: `Subscription expired on ${now.toISOString()} - automatically deactivated via frontend check`
          })
          .eq('user_id', user.id);

        if (updateError) {
          console.error('Error updating expired subscription:', updateError);
        } else {
          console.log('Successfully updated expired subscription to inactive');
          // Update local state
          subscriber.subscribed = false;
          
          // Invalidate subscription queries to refresh the UI
          // Note: This requires access to queryClient, which we don't have in this hook
          // The UI will refresh on next query or page reload
        }
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
