import { useAuth } from '@/hooks/useAuth';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Constants for free user limits
export const FREE_CHAT_LIMIT = 10;

interface FreeChatUsage {
  questionsUsed: number;
  maxQuestions: number;
  hasReachedLimit: boolean;
  questionsRemaining: number;
}

export const useFreeChatLimit = () => {
  const { user } = useAuth();
  const { hasActiveSubscription } = useSubscriptionStatus();
  const queryClient = useQueryClient();

  // Fetch usage data from subscribers table
  const { data: usageData, isLoading, error, refetch } = useQuery({
    queryKey: ['free-chat-usage', user?.id],
    queryFn: async (): Promise<{ questions_num: number } | null> => {
      if (!user) return null;

      try {
        const { data, error } = await supabase
          .from('subscribers')
          .select('questions_num')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('❌ useFreeChatLimit - Error fetching usage:', error);
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
              subscribed: false,
              subscription_status: 'inactive'
            })
            .select('questions_num')
            .single();

          if (insertError) {
            console.error('❌ useFreeChatLimit - Error creating subscriber record:', insertError);
            return null;
          }

          return newRecord;
        }

        return data;
      } catch (error) {
        console.error('❌ useFreeChatLimit - Unexpected error:', error);
        return null;
      }
    },
    enabled: !!user && !hasActiveSubscription, // Only fetch for free users
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  });

  // Calculate usage metrics
  const questionsUsed = usageData?.questions_num || 0;
  const questionsRemaining = Math.max(0, FREE_CHAT_LIMIT - questionsUsed);
  const hasReachedLimit = questionsUsed >= FREE_CHAT_LIMIT;

  const usage: FreeChatUsage = {
    questionsUsed,
    maxQuestions: FREE_CHAT_LIMIT,
    hasReachedLimit,
    questionsRemaining
  };

  // Function to increment questions usage
  const incrementUsage = async (): Promise<boolean> => {
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
        console.error('❌ useFreeChatLimit - Error incrementing questions usage:', error);
        return false;
      }

      // Invalidate and refetch usage data
      await queryClient.invalidateQueries({ queryKey: ['free-chat-usage', user.id] });
      return true;
    } catch (error) {
      console.error('❌ useFreeChatLimit - Unexpected error incrementing questions:', error);
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
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ useFreeChatLimit - Error resetting usage:', error);
        return false;
      }

      // Invalidate and refetch usage data
      await queryClient.invalidateQueries({ queryKey: ['free-chat-usage', user.id] });
      return true;
    } catch (error) {
      console.error('❌ useFreeChatLimit - Unexpected error resetting usage:', error);
      return false;
    }
  };

  return {
    usage,
    loading: isLoading,
    error,
    incrementUsage,
    resetUsage,
    refetch
  };
};
