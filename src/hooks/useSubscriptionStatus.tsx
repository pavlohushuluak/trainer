
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useSubscriptionStatus = () => {
  const { user } = useAuth();

  const { data: subscription, isLoading, refetch, error: queryError } = useQuery({
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
          throw error;
        }
        
        return data;
      } catch (error) {
        console.error('💥 CRITICAL: Direct subscription query failed:', error);
        throw error;
      }
    },
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds - much shorter for immediate updates
    gcTime: 2 * 60 * 1000, // 2 minutes cache
    refetchInterval: false,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: 3, // More retries
    retryDelay: 1000, // 1 second between retries
  });

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
