
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
    
    // Check if user has trial_start (our 7-day free trial system)
    if (subscription.trial_start && subscription.trial_used === true) {
      // Calculate trial expiration as trial_start + 7 days
      const trialStart = new Date(subscription.trial_start);
      const trialExpiration = new Date(trialStart);
      trialExpiration.setDate(trialExpiration.getDate() + 7);
      
      const isTrialActive = now < trialExpiration;
      
      console.log('🔍 Trial validation check (trial_start + 7 days):', {
        trial_start: subscription.trial_start,
        trialStart: trialStart.toISOString(),
        trialExpiration: trialExpiration.toISOString(),
        now: now.toISOString(),
        isTrialActive,
        daysRemaining: isTrialActive ? Math.ceil((trialExpiration.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0
      });
      
      if (isTrialActive) {
        // Trial is still active - user gets Plan 1 access
        return 'trial';
      } else {
        // Trial has expired
        return 'trial_expired';
      }
    }
    
    // Check if it's a trialing subscription (fallback for old data)
    if (subscription.subscription_status === 'trialing') {
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
    // If user is in active trial, manually return Plan 1
    if (subscriptionMode === 'trial') {
      return 'Plan 1';
    }
    
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
  // If user is in active trial, manually set tier limit to 1 (Plan 1)
  const tierLimit = subscriptionMode === 'trial' ? 1 : (subscription?.tier_limit || 1);

  // REMOVED: Automatic trial expiration on frontend
  // Trial expiration is now handled ONLY by the server-side expire-trials function
  // This prevents race conditions and ensures trials are never expired prematurely
  // The frontend only DISPLAYS the trial status, it doesn't modify it

  // Calculate trial end date from trial_start + 7 days
  const getTrialEndDate = () => {
    if (!subscription?.trial_start) return null;
    
    const trialStart = new Date(subscription.trial_start);
    const trialEnd = new Date(trialStart);
    trialEnd.setDate(trialEnd.getDate() + 7);
    
    return trialEnd.toISOString();
  };

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
    trialEndDate: getTrialEndDate(), // Calculated trial end date (trial_start + 7 days)
    refetch,
    forceRefresh,
    error: queryError
  };
};
