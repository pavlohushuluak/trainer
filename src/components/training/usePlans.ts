import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { TrainingPlan, Pet, NewPlanData } from './types';

export const usePlans = () => {
  const { user } = useAuth();
  const { toast } = useToast();
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
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-plans'] });
      toast({
        title: "Plan erstellt",
        description: "Ihr neuer Plan wurde erfolgreich erstellt.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Beim Erstellen des Plans ist ein Fehler aufgetreten.",
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
        title: "Plan aktualisiert",
        description: "Ihr Plan wurde erfolgreich aktualisiert.",
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
        title: "Plan gelöscht",
        description: "Ihr Plan wurde erfolgreich gelöscht.",
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
