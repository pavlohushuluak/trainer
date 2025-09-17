import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

export interface TrainingSession {
  id: string;
  training_step_id: string;
  user_id: string;
  session_date: string;
  session_duration_minutes?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface CreateSessionData {
  training_step_id: string;
  session_duration_minutes?: number;
  notes?: string;
}

export const useTrainingSessions = (stepId?: string, date?: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();

  // Get today's sessions for a step
  const { data: todaySessions, isLoading } = useQuery({
    queryKey: ['training-sessions', stepId, date],
    queryFn: async () => {
      if (!stepId || !date) return [];
      
      const { data, error } = await supabase
        .from('training_sessions')
        .select('*')
        .eq('training_step_id', stepId)
        .eq('session_date', date)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TrainingSession[];
    },
    enabled: !!stepId,
  });

  // Get all sessions for a step (for progress tracking)
  const { data: allSessions } = useQuery({
    queryKey: ['training-sessions-all', stepId],
    queryFn: async () => {
      if (!stepId) return [];
      
      const { data, error } = await supabase
        .from('training_sessions')
        .select('*')
        .eq('training_step_id', stepId)
        .order('session_date', { ascending: false });

      if (error) throw error;
      return data as TrainingSession[];
    },
    enabled: !!stepId,
  });

  // Update step's session count and mastery status
  const updateStepProgress = async (stepId: string, totalSessions: number) => {
    try {
      let masteryStatus = 'in_training';
      if (totalSessions >= 10) {
        masteryStatus = 'fully_mastered';
      } else if (totalSessions >= 5) {
        masteryStatus = 'partially_mastered';
      }

      const { error } = await supabase
        .from('training_steps')
        .update({
          total_sessions_completed: totalSessions,
          mastery_status: masteryStatus
        })
        .eq('id', stepId);

      if (error) {
        console.error('Error updating step progress:', error);
        throw error;
      }

      return { totalSessions, masteryStatus };
    } catch (error) {
      console.error('Error updating step progress:', error);
      throw error;
    }
  };

  // Create a new session
  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: CreateSessionData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create the session
      const { data, error } = await supabase
        .from('training_sessions')
        .insert({
          ...sessionData,
          user_id: user.id,
          session_date: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (error) throw error;

      // Get updated session count
      const { data: updatedSessions, error: countError } = await supabase
        .from('training_sessions')
        .select('*')
        .eq('training_step_id', sessionData.training_step_id);

      if (countError) throw countError;

      const totalSessions = updatedSessions.length;

      // Update step progress
      await updateStepProgress(sessionData.training_step_id, totalSessions);

      return { session: data, totalSessions };
    },
    onSuccess: (data) => {
      // Invalidate all related queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ['training-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['training-sessions-all'] });
      queryClient.invalidateQueries({ queryKey: ['daily-progress'] });
      queryClient.invalidateQueries({ queryKey: ['training-steps'] });
      queryClient.invalidateQueries({ queryKey: ['training-plans-with-steps'] });
      queryClient.invalidateQueries({ queryKey: ['training-plans'] });
      queryClient.invalidateQueries({ queryKey: ['user-rewards'] });
      
      // Show success message
      toast({
        title: t('training.toasts.trainingSessions.sessionCompleted.title'),
        description: t('training.toasts.trainingSessions.sessionCompleted.description'),
      });

      // Show mastery achievement message if reached
      if (data.totalSessions >= 10) {
        toast({
          title: "🎉 Mastery Achieved!",
          description: "You've completed 10 sessions! This module is now fully mastered.",
        });
      } else if (data.totalSessions >= 5) {
        toast({
          title: "🌟 Great Progress!",
          description: "You've completed 5 sessions! You're partially mastering this module.",
        });
      }
    },
    onError: (error) => {
      console.error('Error creating session:', error);
      toast({
        title: t('training.toasts.trainingSessions.sessionError.title'),
        description: t('training.toasts.trainingSessions.sessionError.description'),
        variant: "destructive",
      });
    },
  });

  // Delete a session
  const deleteSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      // Get the step ID before deleting
      const { data: session, error: fetchError } = await supabase
        .from('training_sessions')
        .select('training_step_id')
        .eq('id', sessionId)
        .single();

      if (fetchError) throw fetchError;

      // Delete the session
      const { error } = await supabase
        .from('training_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      // Get updated session count
      const { data: updatedSessions, error: countError } = await supabase
        .from('training_sessions')
        .select('*')
        .eq('training_step_id', session.training_step_id);

      if (countError) throw countError;

      const totalSessions = updatedSessions.length;

      // Update step progress
      await updateStepProgress(session.training_step_id, totalSessions);

      return { totalSessions };
    },
    onSuccess: (data) => {
      // Invalidate all related queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ['training-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['training-sessions-all'] });
      queryClient.invalidateQueries({ queryKey: ['daily-progress'] });
      queryClient.invalidateQueries({ queryKey: ['training-steps'] });
      queryClient.invalidateQueries({ queryKey: ['training-plans-with-steps'] });
      queryClient.invalidateQueries({ queryKey: ['training-plans'] });
      queryClient.invalidateQueries({ queryKey: ['user-rewards'] });
      
      toast({
        title: t('training.toasts.trainingSessions.sessionDeleted.title'),
        description: t('training.toasts.trainingSessions.sessionDeleted.description'),
      });
    },
    onError: (error) => {
      console.error('Error deleting session:', error);
      toast({
        title: t('training.toasts.trainingSessions.deleteError.title'),
        description: t('training.toasts.trainingSessions.deleteError.description'),
        variant: "destructive",
      });
    },
  });

  // Complete step mutation
  const completeStepMutation = useMutation({
    mutationFn: async (stepId: string) => {
      const { error } = await supabase
        .from('training_steps')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('id', stepId);

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['training-plans-with-steps'] });
      queryClient.invalidateQueries({ queryKey: ['training-steps'] });
      queryClient.invalidateQueries({ queryKey: ['daily-progress'] });
      queryClient.invalidateQueries({ queryKey: ['user-rewards'] });
      
      toast({
        title: "✅ Step Completed!",
        description: "Great job! This training step has been marked as completed.",
      });
    },
    onError: (error) => {
      console.error('Error completing step:', error);
      toast({
        title: "Error",
        description: "Failed to complete the step. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    todaySessions: todaySessions || [],
    allSessions: allSessions || [],
    isLoading,
    createSession: createSessionMutation.mutate,
    deleteSession: deleteSessionMutation.mutate,
    completeStep: completeStepMutation.mutate,
    isCreating: createSessionMutation.isPending,
    isDeleting: deleteSessionMutation.isPending,
    isCompleting: completeStepMutation.isPending,
  };
};