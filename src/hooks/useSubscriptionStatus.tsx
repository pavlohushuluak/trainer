
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export const useSubscriptionStatus = () => {
  const { user, loading: authLoading } = useAuth();

  const { data: subscription, isLoading: queryLoading, refetch, error: queryError } = useQuery({
    queryKey: ['subscription-status', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      try {
        console.log('🔍 Querying subscribers table for user:', user.id);
        const { data, error } = await supabase
          .from('subscribers')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('❌ Database subscription query error:', error);
          console.error('❌ Error details:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          // Don't throw error for missing subscription (normal for free users)
          if (error.code === 'PGRST116') {
            return null;
          }
          throw error;
        }
        
        console.log('📊 Raw subscription data from DB:', data);
        return data;
      } catch (error) {
        console.error('💥 CRITICAL: Direct subscription query failed:', error);
        // Return null instead of throwing for better UX
        return null;
      }
    },
    enabled: !!user && !authLoading, // Only run query when user is available and auth is not loading
    staleTime: 10 * 60 * 1000, // 10 minutes - longer cache to reduce refetches
    gcTime: 20 * 60 * 1000, // 20 minutes cache
    refetchInterval: false,
    refetchOnWindowFocus: false, // Disable to prevent unnecessary refetches
    refetchOnMount: false, // Don't refetch on mount if we have cached data
    refetchOnReconnect: false, // Disable to prevent unnecessary refetches
    retry: 1, // Reduced retries for faster error feedback
    retryDelay: 500, // Faster retry
  });

  // Combine auth loading and query loading states
  const isLoading = authLoading || queryLoading;

  const getSubscriptionMode = () => {
    if (isLoading) return 'loading';
    if (!subscription) return 'free';
    
    const now = new Date();
    
    // Check if it's a trialing subscription
    if (subscription.subscription_status === 'trialing') {
      // For trials, check trial_end, not subscription_end
      const trialEnd = subscription.trial_end ? new Date(subscription.trial_end) : null;
      const isTrialExpired = trialEnd ? trialEnd < now : false;
      
      console.log('🔍 Trial expiration check:', {
        trial_end: subscription.trial_end,
        trialEnd,
        now,
        isTrialExpired
      });
      
      if (isTrialExpired) {
        // Trial has expired - user should be free
        return 'trial_expired';
      }
      return 'trial';
    }
    
    // For paid subscriptions, check subscription_end
    const isActiveSubscription = subscription?.subscribed === true && 
      subscription?.subscription_status === 'active';
    
    const subscriptionEnd = subscription?.subscription_end ? new Date(subscription.subscription_end) : null;
    const isSubscriptionExpired = subscriptionEnd ? subscriptionEnd < now : false;
    
    if (isActiveSubscription && !isSubscriptionExpired) {
      return 'premium';
    }
    
    // If subscription is marked as active but expired, or status is inactive
    if (isSubscriptionExpired || subscription?.subscription_status === 'inactive' || subscription?.subscription_status === 'expired') {
      return 'free';
    }
    
    return 'free';
  };

  // Debug logging for subscription mode calculation
  console.log('🔍 getSubscriptionMode Debug:', {
    isLoading,
    subscription,
    isActiveSubscription: subscription?.subscribed === true && 
      (subscription?.subscription_status === 'active' || subscription?.subscription_status === 'trialing'),
    isExpired: subscription?.subscription_end ? 
      new Date(subscription.subscription_end) < new Date() : false,
    mode: getSubscriptionMode()
  });

  const subscriptionMode = getSubscriptionMode();
  
  const hasActiveSubscription = subscriptionMode === 'premium' || subscriptionMode === 'trial';
  const isTrialing = subscriptionMode === 'trial';
  const isPremium = subscriptionMode === 'premium';
  const isExpired = subscription?.subscribed ? new Date(subscription.subscription_end) < new Date() : false;

  // Debug logging
  console.log('🔍 useSubscriptionStatus Debug:', {
    userId: user?.id,
    subscription,
    subscriptionMode,
    hasActiveSubscription,
    isTrialing,
    isPremium,
    isExpired
  });

  // Manual refresh function that also clears cache
  const forceRefresh = async () => {
    return await refetch();
  };

  // Get subscription tier name for display
  const getSubscriptionTierName = () => {
    if (!subscription?.subscription_tier) return 'Free';
    
    switch (subscription.subscription_tier) {
      case 'plan1': return 'Plan 1';
      case 'plan2': return 'Plan 2';
      case 'plan3': return 'Plan 3';
      case 'plan4': return 'Plan 4';
      case 'plan5': return 'Plan 5';
      default: return subscription.subscription_tier;
    }
  };

  // Get tier limit from subscription
  const tierLimit = subscription?.tier_limit || 1;

  // Automatically update expired trials in the database
  useEffect(() => {
    const updateExpiredTrial = async () => {
      if (!subscription || !user) return;
      
      // Only process if status is 'trial_expired'
      if (subscriptionMode === 'trial_expired') {
        console.log('🔄 Trial expired, updating database to free plan...');
        
        try {
          const { error } = await supabase
            .from('subscribers')
            .update({
              subscribed: false,
              subscription_status: 'inactive',
              subscription_tier: null,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id);

          if (error) {
            console.error('❌ Error updating expired trial:', error);
          } else {
            console.log('✅ Expired trial updated successfully, refreshing subscription data...');
            // Refresh subscription data to reflect changes
            refetch();
          }
        } catch (error) {
          console.error('❌ Exception updating expired trial:', error);
        }
      }
    };

    updateExpiredTrial();
  }, [subscriptionMode, subscription, user, refetch]);

  return {
    subscription,
    subscriptionMode,
    hasActiveSubscription,
    isTrialing,
    isPremium,
    isLoading,
    isExpired,
    subscriptionTierName: getSubscriptionTierName(),
    tierLimit,
    refetch,
    forceRefresh,
    error: queryError
  };
};
