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

  // Create a new session
  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: CreateSessionData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

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
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['daily-progress'] });
      queryClient.invalidateQueries({ queryKey: ['training-steps'] });
      toast({
        title: t('training.toasts.trainingSessions.sessionCompleted.title'),
        description: t('training.toasts.trainingSessions.sessionCompleted.description'),
      });
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
      const { error } = await supabase
        .from('training_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['daily-progress'] });
      queryClient.invalidateQueries({ queryKey: ['training-steps'] });
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

  return {
    todaySessions: todaySessions || [],
    allSessions: allSessions || [],
    isLoading,
    createSession: createSessionMutation.mutate,
    deleteSession: deleteSessionMutation.mutate,
    isCreating: createSessionMutation.isPending,
    isDeleting: deleteSessionMutation.isPending,
  };
};