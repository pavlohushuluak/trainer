import { useAuth } from '@/hooks/useAuth';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

// Constants for free user limits
export const FREE_CHAT_LIMIT = 10; // Match the database migration limit

interface FreeChatUsage {
  questionsUsed: number;
  maxQuestions: number;
  hasReachedLimit: boolean;
  questionsRemaining: number;
}

interface SubscriberData {
  questions_num?: number;
  subscribed: boolean;
  subscription_status: string;
  subscription_tier?: string;
  tier_limit?: number;
  image_analysis_num?: number;
}

export const useFreeChatLimit = () => {
  const { user } = useAuth();
  const { hasActiveSubscription } = useSubscriptionStatus();
  const queryClient = useQueryClient();

  // Create a consistent query key
  const queryKey = ['free-chat-usage', user?.id];

  // Fetch usage data from subscribers table
  const { data: usageData, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async (): Promise<SubscriberData | null> => {
      if (!user) return null;

      console.log('🔍 Fetching usage data for user:', user.id);

      try {
        // Test database connection first
        const { data: testData, error: testError } = await supabase
          .from('subscribers')
          .select('count')
          .limit(1);

        if (testError) {
          console.error('❌ Database connection test failed:', testError);
          console.error('❌ Test error details:', {
            code: testError.code,
            message: testError.message,
            details: testError.details,
            hint: testError.hint
          });
          return null;
        }

        console.log('✅ Database connection test successful');

        // First, let's check what columns actually exist in the table
        const { data: tableInfo, error: tableError } = await supabase
          .from('subscribers')
          .select('*')
          .limit(1);

        if (tableError) {
          console.error('❌ Error checking table structure:', tableError);
          console.error('❌ Table structure error details:', {
            code: tableError.code,
            message: tableError.message,
            details: tableError.details,
            hint: tableError.hint
          });
          return null;
        }

        console.log('📋 Table structure check:', tableInfo);
        console.log('📋 Available columns:', tableInfo && tableInfo.length > 0 ? Object.keys(tableInfo[0]) : 'No data');

        // Check if questions_num column exists
        const hasQuestionsNumColumn = tableInfo && tableInfo.length > 0 && 'questions_num' in tableInfo[0];
        console.log('🔍 questions_num column exists:', hasQuestionsNumColumn);

        if (!hasQuestionsNumColumn) {
          console.warn('⚠️ questions_num column does not exist in subscribers table, using fallback');
          console.warn('⚠️ Available columns:', Object.keys(tableInfo[0] || {}));
          // Don't return null, continue with fallback behavior
        }

        const { data, error } = await supabase
          .from('subscribers')
          .select(hasQuestionsNumColumn ? 'questions_num, subscribed, subscription_status' : 'subscribed, subscription_status')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('❌ useFreeChatLimit - Error fetching usage:', error);
          console.error('❌ Error details:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          return null;
        }

        console.log('📊 Raw usage data from DB:', data);

        // If no subscriber record exists, create one with 0 usage
        if (!data) {
          console.log('🆕 No subscriber record found, creating new one');
          
          // Check if we can insert with questions_num column
          const insertData: any = {
            user_id: user.id,
            email: user.email || '',
            subscribed: false,
            subscription_status: 'inactive',
            subscription_tier: 'free',
            tier_limit: 1,
            image_analysis_num: 0
          };

          // Only add questions_num if the column exists
          if (hasQuestionsNumColumn) {
            insertData.questions_num = 0;
          }

          console.log('🆕 Inserting subscriber record with data:', insertData);

          const { data: newRecord, error: insertError } = await supabase
            .from('subscribers')
            .insert(insertData)
            .select(hasQuestionsNumColumn ? 'questions_num, subscribed, subscription_status' : 'subscribed, subscription_status')
            .single();

          if (insertError) {
            console.error('❌ useFreeChatLimit - Error creating subscriber record:', insertError);
            console.error('❌ Insert error details:', {
              code: insertError.code,
              message: insertError.message,
              details: insertError.details,
              hint: insertError.hint
            });
            return null;
          }

          console.log('✅ New subscriber record created:', newRecord);
          return newRecord as SubscriberData;
        }

        return data as SubscriberData;
      } catch (error) {
        console.error('❌ useFreeChatLimit - Unexpected error:', error);
        return null;
      }
    },
    enabled: !!user, // Always fetch for debugging (was: !!user && !hasActiveSubscription)
    staleTime: 0, // Always consider data stale for real-time updates
    gcTime: 2 * 60 * 1000, // 2 minutes
  });

  // Debug: Log whenever usageData changes
  useEffect(() => {
    console.log('🔄 useFreeChatLimit - usageData changed:', {
      userId: user?.id,
      usageData,
      timestamp: new Date().toISOString()
    });
  }, [usageData, user?.id]);

  // Debug: Log when the query refetches
  useEffect(() => {
    console.log('🔄 useFreeChatLimit - query refetch triggered:', {
      userId: user?.id,
      timestamp: new Date().toISOString()
    });
  }, [refetch, user?.id]);

  // Calculate usage metrics
  const questionsUsed = usageData?.questions_num || 0;
  const questionsRemaining = Math.max(0, FREE_CHAT_LIMIT - questionsUsed);
  const hasReachedLimit = questionsUsed >= FREE_CHAT_LIMIT;

  // Fallback: if questions_num column doesn't exist, assume unlimited usage
  const effectiveQuestionsUsed = usageData && 'questions_num' in usageData ? questionsUsed : 0;
  const effectiveQuestionsRemaining = Math.max(0, FREE_CHAT_LIMIT - effectiveQuestionsUsed);
  const effectiveHasReachedLimit = effectiveQuestionsUsed >= FREE_CHAT_LIMIT;

  // Debug logging for usage calculation
  console.log('🔍 Usage calculation debug:', {
    usageData,
    questionsUsed,
    questionsRemaining,
    hasReachedLimit,
    effectiveQuestionsUsed,
    effectiveQuestionsRemaining,
    effectiveHasReachedLimit,
    FREE_CHAT_LIMIT
  });

  // Debug logging
  console.log('🔍 useFreeChatLimit Debug:', {
    userId: user?.id,
    hasActiveSubscription,
    usageData,
    questionsUsed,
    questionsRemaining,
    hasReachedLimit,
    effectiveQuestionsUsed,
    effectiveQuestionsRemaining,
    effectiveHasReachedLimit,
    FREE_CHAT_LIMIT
  });

  const usage: FreeChatUsage = {
    questionsUsed: effectiveQuestionsUsed,
    maxQuestions: FREE_CHAT_LIMIT,
    hasReachedLimit: effectiveHasReachedLimit,
    questionsRemaining: effectiveQuestionsRemaining
  };

  // Function to increment questions usage
  const incrementUsage = async (): Promise<boolean> => {
    if (!user || hasActiveSubscription) return true; // Premium users have unlimited usage
    
    console.log('🚀 incrementUsage called:', { userId: user?.id, hasActiveSubscription, currentUsage: usageData?.questions_num });
    
    // Check if questions_num column exists
    if (!usageData || !('questions_num' in usageData)) {
      console.warn('⚠️ questions_num column not available, skipping increment');
      return true; // Don't block the user if the column doesn't exist
    }
    
    try {
      // Optimistic update: immediately update the UI
      const currentQuestionsNum = usageData.questions_num || 0;
      const newQuestionsNum = currentQuestionsNum + 1;
      
      console.log('🚀 Optimistic update:', { current: currentQuestionsNum, new: newQuestionsNum });
      
      // Update the query data immediately for instant UI feedback
      queryClient.setQueryData(queryKey, {
        ...usageData,
        questions_num: newQuestionsNum
      });

      // Use a more robust approach to avoid race conditions
      // First get the current value, then increment it
      const { data: currentData, error: fetchError } = await supabase
        .from('subscribers')
        .select('questions_num')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        console.error('❌ useFreeChatLimit - Error fetching current usage:', fetchError);
        
        // Revert optimistic update on error
        queryClient.setQueryData(queryKey, {
          ...usageData,
          questions_num: currentQuestionsNum
        });
        
        return false;
      }

      const currentValue = currentData?.questions_num || 0;
      const newValue = currentValue + 1;

      const { data, error } = await supabase
        .from('subscribers')
        .update({ 
          questions_num: newValue,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select('questions_num')
        .single();

      if (error) {
        console.error('❌ useFreeChatLimit - Error incrementing questions usage:', error);
        
        // Revert optimistic update on error
        queryClient.setQueryData(queryKey, {
          ...usageData,
          questions_num: currentQuestionsNum
        });
        
        return false;
      }

      console.log('✅ incrementUsage successful:', { newUsage: data?.questions_num });

      // Force an immediate refetch to ensure data consistency
      await queryClient.refetchQueries({ queryKey });
      return true;
    } catch (error) {
      console.error('❌ useFreeChatLimit - Unexpected error incrementing questions:', error);
      
      // Revert optimistic update on error
      queryClient.setQueryData(queryKey, {
        ...usageData,
        questions_num: usageData.questions_num || 0
      });
      
      return false;
    }
  };

  // Function to reset usage (for testing or admin purposes)
  const resetUsage = async (): Promise<boolean> => {
    if (!user) return false;
    
    // Check if questions_num column exists
    if (!usageData || !('questions_num' in usageData)) {
      console.warn('⚠️ questions_num column not available, skipping reset');
      return true; // Don't block the user if the column doesn't exist
    }
    
    try {
      // Optimistic update: immediately update the UI
      queryClient.setQueryData(queryKey, {
        ...usageData,
        questions_num: 0
      });

      const { error } = await supabase
        .from('subscribers')
        .update({ 
          questions_num: 0,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ useFreeChatLimit - Error resetting usage:', error);
        
        // Revert optimistic update on error
        queryClient.setQueryData(queryKey, usageData);
        
        return false;
      }

      // Force an immediate refetch to ensure data consistency
      await queryClient.refetchQueries({ queryKey });
      return true;
    } catch (error) {
      console.error('❌ useFreeChatLimit - Unexpected error resetting usage:', error);
      
      // Revert optimistic update on error
      queryClient.setQueryData(queryKey, usageData);
      
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
