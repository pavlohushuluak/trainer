
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';

// Constants for free user limits
export const FREE_IMAGE_ANALYSES_LIMIT = 3;

interface ImageAnalysisUsage {
  imageAnalysesUsed: number;
  maxAnalyses: number;
  hasReachedLimit: boolean;
  remainingAnalyses: number | string;
  canAnalyze: boolean;
}

export const useImageAnalysisLimit = () => {
  const { user } = useAuth();
  const { hasActiveSubscription, subscriptionMode } = useSubscriptionStatus();
  const queryClient = useQueryClient();

  console.log('🔍 useImageAnalysisLimit - User:', user?.id);
  console.log('🔍 useImageAnalysisLimit - Has active subscription:', hasActiveSubscription);
  console.log('🔍 useImageAnalysisLimit - Subscription mode:', subscriptionMode);

  // Fetch usage data from subscribers table
  const { data: usageData, isLoading, error, refetch } = useQuery({
    queryKey: ['image-analysis-usage', user?.id],
    queryFn: async (): Promise<{ image_analysis_num: number } | null> => {
      if (!user) return null;

      try {
        console.log('🔍 useImageAnalysisLimit - Fetching usage data for user:', user.id);
        const { data, error } = await supabase
          .from('subscribers')
          .select('image_analysis_num')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('❌ useImageAnalysisLimit - Error fetching usage:', error);
          return null;
        }

        console.log('🔍 useImageAnalysisLimit - Fetched data:', data);

        // If no subscriber record exists, create one with 0 usage
        if (!data) {
          const { data: newRecord, error: insertError } = await supabase
            .from('subscribers')
            .insert({
              user_id: user.id,
              email: user.email || '',
              image_analysis_num: 0,
              subscribed: false,
              subscription_status: 'inactive'
            })
            .select('image_analysis_num')
            .single();

          if (insertError) {
            console.error('❌ useImageAnalysisLimit - Error creating subscriber record:', insertError);
            return null;
          }

          return newRecord;
        }

        return data;
      } catch (error) {
        console.error('❌ useImageAnalysisLimit - Unexpected error:', error);
        return null;
      }
    },
    enabled: !!user, // Fetch for all users to ensure we have data
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  });



  // Calculate usage metrics
  const imageAnalysesUsed = usageData?.image_analysis_num || 0;
  const maxAnalyses = FREE_IMAGE_ANALYSES_LIMIT;
  const remainingAnalyses = hasActiveSubscription ? 'Unbegrenzt' : Math.max(0, maxAnalyses - imageAnalysesUsed);
  const hasReachedLimit = !hasActiveSubscription && imageAnalysesUsed >= maxAnalyses;
  const canAnalyze = hasActiveSubscription || imageAnalysesUsed < maxAnalyses;

  const incrementUsage = async (): Promise<boolean> => {
    if (!user || hasActiveSubscription) {
      console.log('🔍 useImageAnalysisLimit - Skipping increment for premium user or no user');
      return true; // Premium users have unlimited usage
    }
    
    console.log('🔍 useImageAnalysisLimit - Incrementing usage for user:', user.id);
    console.log('🔍 useImageAnalysisLimit - Current usage data:', usageData);
    
    try {
      const currentUsage = usageData?.image_analysis_num || 0;
      const newUsage = currentUsage + 1;
      
      console.log('🔍 useImageAnalysisLimit - Updating from', currentUsage, 'to', newUsage);
      
      const { error } = await supabase
        .from('subscribers')
        .update({ 
          image_analysis_num: newUsage,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ useImageAnalysisLimit - Error incrementing image analysis usage:', error);
        return false;
      }

      console.log('✅ useImageAnalysisLimit - Successfully updated usage to', newUsage);

      // Invalidate and refetch usage data
      await queryClient.invalidateQueries({ queryKey: ['image-analysis-usage', user.id] });
      return true;
    } catch (error) {
      console.error('❌ useImageAnalysisLimit - Unexpected error incrementing image analysis:', error);
      return false;
    }
  };

  // Function to reset usage (for testing or admin purposes)
  const resetUsage = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('subscribers')
        .update({ 
          image_analysis_num: 0,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ useImageAnalysisLimit - Error resetting usage:', error);
        return false;
      }

      // Invalidate and refetch usage data
      await queryClient.invalidateQueries({ queryKey: ['image-analysis-usage', user.id] });
      return true;
    } catch (error) {
      console.error('❌ useImageAnalysisLimit - Unexpected error resetting usage:', error);
      return false;
    }
  };

  return {
    analysesUsed: imageAnalysesUsed,
    maxAnalyses,
    remainingAnalyses,
    hasReachedLimit,
    canAnalyze,
    incrementUsage,
    resetUsage,
    loading: isLoading,
    error
  };
};
