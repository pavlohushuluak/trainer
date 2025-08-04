
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PetLimitInfo {
  currentPetCount: number;
  maxPetsAllowed: number;
  canAddMore: boolean;
  subscriptionTier: string;
}

export const usePetLimitChecker = (): PetLimitInfo & { isLoading: boolean } => {
  const { user, loading: authLoading } = useAuth();

  // Use the same query key as other pet-related queries
  const { data: pets = [], isLoading: petCountLoading } = useQuery({
    queryKey: ['pets', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('pet_profiles')
        .select('id')
        .eq('user_id', user.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !authLoading, // Only run when user is available and auth is not loading
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1, // Reduced retries
    retryDelay: 500, // Faster retry
  });

  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['subscription-status', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no data exists

      if (error) {
        console.error('Error fetching subscription:', error);
        // Don't throw for missing subscription (normal for free users)
        if (error.code === 'PGRST116') {
          return null;
        }
        return null;
      }
      return data;
    },
    enabled: !!user && !authLoading, // Only run when user is available and auth is not loading
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Reduced retries
    retryDelay: 500, // Faster retry
  });

  const getPetLimit = (subscriptionTier?: string, subscribed?: boolean, tierLimit?: number): number => {
    // Free tier gets 1 pet
    if (!subscribed || !subscriptionTier) return 1;
    
    // Use tier_limit from database if available (new 5-plan structure)
    if (tierLimit && tierLimit > 0) {
      return tierLimit;
    }
    
    // Fallback to subscription tier mapping for backward compatibility
    switch (subscriptionTier) {
      case 'plan1':
        return 1;
      case 'plan2':
        return 2;
      case 'plan3':
        return 4;
      case 'plan4':
        return 8;
      case 'plan5':
        return 999; // Unlimited
      case '1-tier':
        return 1;
      case '2-tier':
        return 2;
      case '3-4-tier':
        return 4;
      case '5-8-tier':
        return 8;
      case 'unlimited-tier':
        return 999; // Unlimited
      default:
        // For any legacy tiers, default to 2 for active subscribers
        return subscribed ? 2 : 1;
    }
  };

  const isActiveSubscriber = subscription?.subscribed === true && 
    (subscription?.subscription_status === 'active' || subscription?.subscription_status === 'trialing');

  const petCount = pets.length;
  const maxPetsAllowed = getPetLimit(subscription?.subscription_tier, isActiveSubscriber, subscription?.tier_limit);
  const canAddMore = petCount < maxPetsAllowed;
  
  // Determine display tier name
  const getDisplayTier = () => {
    if (!isActiveSubscriber) return 'free';
    
    // Map new plan names to display names
    switch (subscription?.subscription_tier) {
      case 'plan1': return '1 Tier';
      case 'plan2': return '2 Tiere';
      case 'plan3': return '3-4 Tiere';
      case 'plan4': return '5-8 Tiere';
      case 'plan5': return 'Unbegrenzt';
      default: return subscription?.subscription_tier || 'premium';
    }
  };

  // Combine auth loading and query loading states
  const isLoading = authLoading || petCountLoading || subscriptionLoading;

  return {
    currentPetCount: petCount,
    maxPetsAllowed,
    canAddMore,
    subscriptionTier: getDisplayTier(),
    isLoading
  };
};
