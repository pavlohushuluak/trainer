import { useAuth } from '@/hooks/useAuth';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Constants for free user limits
export const FREE_QUESTIONS_LIMIT = 10;
export const FREE_IMAGE_ANALYSES_LIMIT = 3;

interface FreeUserUsage {
  questionsUsed: number;
  imageAnalysesUsed: number;
  questionsRemaining: number;
  imageAnalysesRemaining: number;
  hasReachedQuestionsLimit: boolean;
  hasReachedImageAnalysesLimit: boolean;
  canAskQuestion: boolean;
  canAnalyzeImage: boolean;
}

export const useFreeUserUsage = () => {
  const { user } = useAuth();
  const { hasActiveSubscription } = useSubscriptionStatus();
  const queryClient = useQueryClient();

  // Fetch usage data from subscribers table
  const { data: usageData, isLoading, error, refetch } = useQuery({
    queryKey: ['free-user-usage', user?.id],
    queryFn: async (): Promise<{ questions_num: number; image_analysis_num: number } | null> => {
      if (!user) return null;

      try {
        const { data, error } = await supabase
          .from('subscribers')
          .select('questions_num, image_analysis_num')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('❌ useFreeUserUsage - Error fetching usage:', error);
          return null;
        }

        // If no subscriber record exists, create one with 0 usage
        if (!data) {
          const { data: newRecord, error: insertError } = await supabase
            .from('subscribers')
            .insert({
              user_id: user.id,
              email: user.email || '',
              questions_num: 0,
              image_analysis_num: 0,
              subscribed: false,
              subscription_status: 'inactive'
            })
            .select('questions_num, image_analysis_num')
            .single();

          if (insertError) {
            console.error('❌ useFreeUserUsage - Error creating subscriber record:', insertError);
            return null;
          }

          return newRecord;
        }

        return data;
      } catch (error) {
        console.error('❌ useFreeUserUsage - Unexpected error:', error);
        return null;
      }
    },
    enabled: !!user && !hasActiveSubscription, // Only fetch for free users
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  });

  // Calculate usage metrics
  const questionsUsed = usageData?.questions_num || 0;
  const imageAnalysesUsed = usageData?.image_analysis_num || 0;
  
  const questionsRemaining = Math.max(0, FREE_QUESTIONS_LIMIT - questionsUsed);
  const imageAnalysesRemaining = Math.max(0, FREE_IMAGE_ANALYSES_LIMIT - imageAnalysesUsed);
  
  const hasReachedQuestionsLimit = questionsUsed >= FREE_QUESTIONS_LIMIT;
  const hasReachedImageAnalysesLimit = imageAnalysesUsed >= FREE_IMAGE_ANALYSES_LIMIT;
  
  const canAskQuestion = hasActiveSubscription || !hasReachedQuestionsLimit;
  const canAnalyzeImage = hasActiveSubscription || !hasReachedImageAnalysesLimit;

  // Function to increment questions usage
  const incrementQuestionsUsage = async (): Promise<boolean> => {
    if (!user || hasActiveSubscription) return true; // Premium users have unlimited usage
    
    try {
      const { error } = await supabase
        .from('subscribers')
        .update({ 
          questions_num: (usageData?.questions_num || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ useFreeUserUsage - Error incrementing questions usage:', error);
        return false;
      }

      // Invalidate and refetch usage data
      await queryClient.invalidateQueries({ queryKey: ['free-user-usage', user.id] });
      return true;
    } catch (error) {
      console.error('❌ useFreeUserUsage - Unexpected error incrementing questions:', error);
      return false;
    }
  };

  // Function to increment image analysis usage
  const incrementImageAnalysisUsage = async (): Promise<boolean> => {
    if (!user || hasActiveSubscription) return true; // Premium users have unlimited usage
    
    try {
      const { error } = await supabase
        .from('subscribers')
        .update({ 
          image_analysis_num: (usageData?.image_analysis_num || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ useFreeUserUsage - Error incrementing image analysis usage:', error);
        return false;
      }

      // Invalidate and refetch usage data
      await queryClient.invalidateQueries({ queryKey: ['free-user-usage', user.id] });
      return true;
    } catch (error) {
      console.error('❌ useFreeUserUsage - Unexpected error incrementing image analysis:', error);
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
          questions_num: 0,
          image_analysis_num: 0,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ useFreeUserUsage - Error resetting usage:', error);
        return false;
      }

      // Invalidate and refetch usage data
      await queryClient.invalidateQueries({ queryKey: ['free-user-usage', user.id] });
      return true;
    } catch (error) {
      console.error('❌ useFreeUserUsage - Unexpected error resetting usage:', error);
      return false;
    }
  };

  return {
    // Usage data
    questionsUsed,
    imageAnalysesUsed,
    questionsRemaining,
    imageAnalysesRemaining,
    hasReachedQuestionsLimit,
    hasReachedImageAnalysesLimit,
    canAskQuestion,
    canAnalyzeImage,
    
    // Limits
    questionsLimit: FREE_QUESTIONS_LIMIT,
    imageAnalysesLimit: FREE_IMAGE_ANALYSES_LIMIT,
    
    // Status
    isLoading,
    error,
    
    // Actions
    incrementQuestionsUsage,
    incrementImageAnalysisUsage,
    resetUsage,
    refetch
  };
}; 