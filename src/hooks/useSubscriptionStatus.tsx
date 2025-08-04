
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useSubscriptionStatus = () => {
  const { user, loading: authLoading } = useAuth();

  const { data: subscription, isLoading: queryLoading, refetch, error: queryError } = useQuery({
    queryKey: ['subscription-status', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      try {
        const { data, error } = await supabase
          .from('subscribers')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('❌ Database subscription query error:', error);
          // Don't throw error for missing subscription (normal for free users)
          if (error.code === 'PGRST116') {
            return null;
          }
          throw error;
        }
        
        return data;
      } catch (error) {
        console.error('💥 CRITICAL: Direct subscription query failed:', error);
        // Return null instead of throwing for better UX
        return null;
      }
    },
    enabled: !!user && !authLoading, // Only run query when user is available and auth is not loading
    staleTime: 5 * 60 * 1000, // 5 minutes - longer cache for better performance
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    refetchInterval: false,
    refetchOnWindowFocus: false, // Disable to prevent unnecessary refetches
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: 1, // Reduced retries for faster error feedback
    retryDelay: 500, // Faster retry
  });

  // Combine auth loading and query loading states
  const isLoading = authLoading || queryLoading;

  const getSubscriptionMode = () => {
    if (isLoading) return 'loading';
    if (!subscription) return 'free';
    
    const isActiveSubscription = subscription?.subscribed === true && 
      (subscription?.subscription_status === 'active' || subscription?.subscription_status === 'trialing');
    
    const isExpired = subscription?.subscription_end ? 
      new Date(subscription.subscription_end) < new Date() : false;
    
    if (subscription.subscription_status === 'trialing') {
      return isExpired ? 'trial_expired' : 'trial';
    }
    
    if (isActiveSubscription && !isExpired) {
      return 'premium';
    }
    
    return 'free';
  };

  const subscriptionMode = getSubscriptionMode();
  
  const hasActiveSubscription = subscriptionMode === 'premium' || subscriptionMode === 'trial';
  const isTrialing = subscriptionMode === 'trial';
  const isPremium = subscriptionMode === 'premium';
  const isExpired = subscription?.subscription_end ? new Date(subscription.subscription_end) < new Date() : false;

  // Manual refresh function that also clears cache
  const forceRefresh = async () => {
    return await refetch();
  };

  // Get subscription tier name for display
  const getSubscriptionTierName = () => {
    if (!subscription?.subscription_tier) return 'Free';
    
    switch (subscription.subscription_tier) {
      case 'plan1': return '1 Tier';
      case 'plan2': return '2 Tiere';
      case 'plan3': return '3-4 Tiere';
      case 'plan4': return '5-8 Tiere';
      case 'plan5': return 'Unbegrenzt';
      default: return subscription.subscription_tier;
    }
  };

  // Get tier limit from subscription
  const tierLimit = subscription?.tier_limit || 1;

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
