import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { requestCache } from "@/utils/requestCache";

export interface DailyProgress {
  id: string;
  user_id: string;
  date: string;
  steps_completed: number;
  sessions_completed: number;
  points_earned: number;
  daily_goal_met: boolean;
  streak_day: boolean;
  daily_goal_target: number;
  daily_session_target: number;
  created_at: string;
  updated_at: string;
}

export const useDailyProgress = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch today's progress
  const { data: todayProgress, isLoading } = useQuery({
    queryKey: ['daily-progress', user?.id, new Date().toISOString().split('T')[0]],
    queryFn: async (): Promise<DailyProgress | null> => {
      if (!user) return null;
      
      const today = new Date().toISOString().split('T')[0];
      
      return requestCache.get(
        `daily_progress_${user.id}_${today}`,
        async () => {
          const { data, error } = await supabase
            .from('daily_progress')
            .select('*')
            .eq('user_id', user.id)
            .eq('date', today)
            .maybeSingle();

          if (error) {
            console.warn('Error fetching daily progress:', error);
            return null;
          }
          
          return data;
        },
        30000 // Cache for 30 seconds
      );
    },
    enabled: !!user,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });

  // Fetch last 7 days for weekly overview
  const { data: weeklyProgress } = useQuery({
    queryKey: ['weekly-progress', user?.id],
    queryFn: async (): Promise<DailyProgress[]> => {
      if (!user) return [];
      
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      return requestCache.get(
        `weekly_progress_${user.id}`,
        async () => {
          const { data, error } = await supabase
            .from('daily_progress')
            .select('*')
            .eq('user_id', user.id)
            .gte('date', sevenDaysAgo.toISOString().split('T')[0])
            .order('date', { ascending: false });

          if (error) {
            console.warn('Error fetching weekly progress:', error);
            return [];
          }
          return data || [];
        },
        300000 // Cache for 5 minutes
      );
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update daily goal
  const updateDailyGoalMutation = useMutation({
    mutationFn: async (newGoal: number) => {
      if (!user) throw new Error('User not authenticated');
      
      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('daily_progress')
        .upsert({
          user_id: user.id,
          date: today,
          daily_goal_target: newGoal,
          steps_completed: 0,
          sessions_completed: 0,
          points_earned: 0,
          daily_goal_met: false,
          streak_day: false,
          daily_session_target: 3
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-progress'] });
      // Clear cache for this user
      if (user) {
        const today = new Date().toISOString().split('T')[0];
        requestCache.clear(`daily_progress_${user.id}_${today}`);
        requestCache.clear(`weekly_progress_${user.id}`);
      }
    },
  });

  // Update daily session target
  const updateSessionTargetMutation = useMutation({
    mutationFn: async (newTarget: number) => {
      if (!user) throw new Error('User not authenticated');
      
      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('daily_progress')
        .upsert({
          user_id: user.id,
          date: today,
          daily_session_target: newTarget,
          steps_completed: todayProgress?.steps_completed || 0,
          sessions_completed: todayProgress?.sessions_completed || 0,
          points_earned: todayProgress?.points_earned || 0,
          daily_goal_met: todayProgress?.daily_goal_met || false,
          streak_day: todayProgress?.streak_day || false,
          daily_goal_target: todayProgress?.daily_goal_target || 2
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-progress'] });
      // Clear cache for this user
      if (user) {
        const today = new Date().toISOString().split('T')[0];
        requestCache.clear(`daily_progress_${user.id}_${today}`);
        requestCache.clear(`weekly_progress_${user.id}`);
      }
    },
  });

  // Manually trigger progress update
  const refreshProgressMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase.rpc('update_daily_progress_with_sessions', {
        user_id_param: user.id
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-progress'] });
      queryClient.invalidateQueries({ queryKey: ['weekly-progress'] });
    },
  });

  return {
    todayProgress,
    weeklyProgress,
    isLoading,
    updateDailyGoal: updateDailyGoalMutation.mutate,
    updateSessionTarget: updateSessionTargetMutation.mutate,
    refreshProgress: refreshProgressMutation.mutate,
    isUpdating: updateDailyGoalMutation.isPending || refreshProgressMutation.isPending || updateSessionTargetMutation.isPending,
  };
};