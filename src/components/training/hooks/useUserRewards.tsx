
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { requestCache } from "@/utils/requestCache";

interface UserRewards {
  id: string;
  user_id: string;
  total_points: number;
  current_streak: number;
  longest_streak: number;
  badges: string[];
  last_activity: string | null;
  created_at: string;
  updated_at: string;
}

export const useUserRewards = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user rewards
  const { data: rewards, isLoading, error } = useQuery({
    queryKey: ['user-rewards', user?.id],
    queryFn: async (): Promise<UserRewards | null> => {
      if (!user) return null;
      
      return requestCache.get(
        `user_rewards_${user.id}`,
        async () => {
          const { data, error } = await supabase
            .from('user_rewards')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

          if (error) {
            console.warn('Error fetching user rewards:', error);
            return null;
          }
          
          if (!data) return null;
          
          // Konvertiere badges von Json zu string[]
          const badges = Array.isArray(data.badges) ? data.badges as string[] : [];
          
          return {
            ...data,
            badges
          };
        },
        30000 // Cache for 30 seconds
      );
    },
    enabled: !!user,
    staleTime: 30 * 1000, // 30 Sekunden
    refetchOnWindowFocus: false,
  });

  // Update rewards manually (falls nötig)
  const updateRewardsMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase.rpc('update_user_rewards', {
        user_id_param: user.id
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-rewards'] });
      // Clear cache for this user
      if (user) {
        requestCache.clear(`user_rewards_${user.id}`);
      }
    },
  });

  return {
    rewards,
    isLoading,
    error,
    updateRewards: updateRewardsMutation.mutate,
    isUpdating: updateRewardsMutation.isPending,
  };
};
