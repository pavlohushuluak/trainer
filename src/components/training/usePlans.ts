import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from '@/hooks/useTranslations';
import { TrainingPlan, Pet, NewPlanData } from './types';

export const usePlans = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslations();
  const queryClient = useQueryClient();

  // Fetch pets with caching
  const { data: pets = [] } = useQuery({
    queryKey: ['pets', user?.id],
    queryFn: async (): Promise<Pet[]> => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('pet_profiles')
        .select('id, name, species, breed, age, birth_date, behavior_focus, notes, created_at, updated_at, user_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch training plans with caching
  const { data: trainingPlans = [] } = useQuery({
    queryKey: ['training-plans', user?.id],
    queryFn: async (): Promise<TrainingPlan[]> => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('training_plans')
        .select(`
          *,
          pet_profiles(name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data?.map(plan => ({
        ...plan,
        pet_name: plan.pet_profiles?.name,
        status: plan.status as TrainingPlan['status']
      })) || [];
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (planData: NewPlanData) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('training_plans')
        .insert({
          title: planData.title,
          description: planData.description,
          pet_id: planData.pet_id === 'none' ? null : planData.pet_id || null,
          status: planData.status,
          user_id: user.id,
          is_ai_generated: false // Explicitly mark as manual plan
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-plans'] });
      toast({
        title: t('training.usePlans.createPlan.title'),
        description: t('training.usePlans.createPlan.description'),
      });
    },
    onError: () => {
      toast({
        title: t('training.usePlans.createError.title'),
        description: t('training.usePlans.createError.description'),
        variant: "destructive",
      });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<TrainingPlan> }) => {
      const { data, error } = await supabase
        .from('training_plans')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-plans'] });
      toast({
        title: t('training.usePlans.updatePlan.title'),
        description: t('training.usePlans.updatePlan.description'),
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (planId: string) => {
      const { error } = await supabase
        .from('training_plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-plans'] });
      toast({
        title: t('training.usePlans.deletePlan.title'),
        description: t('training.usePlans.deletePlan.description'),
      });
    }
  });

  return {
    pets,
    trainingPlans,
    createMutation,
    updateMutation,
    deleteMutation
  };
};
