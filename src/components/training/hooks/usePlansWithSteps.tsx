
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { TrainingStep, TrainingPlan } from '../types';

interface TrainingPlanWithSteps extends TrainingPlan {
  pet_name?: string;
  pet_species?: string;
  steps: TrainingStep[];
}

export const usePlansWithSteps = (selectedPetFilter: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['training-plans-with-steps', user?.id, selectedPetFilter],
    queryFn: async (): Promise<TrainingPlanWithSteps[]> => {

      if (!user) {
        return [];
      }

      try {
        let query = supabase
          .from('training_plans')
          .select(`
            *,
            pet_profiles(name, species),
            training_steps(
              id,
              step_number,
              title,
              title_en,
              description,
              description_en,
              is_completed,
              points_reward,
              completed_at,
              total_sessions_completed,
              mastery_status,
              target_sessions_daily
            )
          `)
          .eq('user_id', user.id);

        // Apply pet filter with detailed logging
        if (selectedPetFilter === "none") {
          query = query.is('pet_id', null);
        } else if (selectedPetFilter === "unassigned") {
          query = query.is('pet_id', null);
        } else if (selectedPetFilter !== "all") {
          // Show plans for specific pet OR unassigned plans (pet_id is null)
          query = query.or(`pet_id.eq.${selectedPetFilter},pet_id.is.null`);
        } else {
        }

        const { data: plans, error: plansError } = await query
          .order('created_at', { ascending: false });
        

        if (plansError) {
          // Don't throw immediately, try to provide useful info
          if (plansError.message?.includes('RLS')) {
            throw new Error('Authentication required to access training plans');
          } else if (plansError.message?.includes('relation')) {
            throw new Error('Database structure issue detected');
          }
          throw new Error(`Database query failed: ${plansError.message}`);
        }

        const plansWithSteps = (plans || []).map(plan => {
          // Warnung bei fehlender Pet-Verbindung
          if (plan.pet_id && !plan.pet_profiles) {
          }
          
          return {
            ...plan,
            status: plan.status as 'planned' | 'in_progress' | 'completed',
            pet_name: plan.pet_profiles?.name,
            pet_species: plan.pet_profiles?.species,
            steps: (plan.training_steps || []).sort((a, b) => a.step_number - b.step_number)
          };
        });



        return plansWithSteps;
      } catch (error) {
        throw error; // Re-throw to let React Query handle the error state
      }
    },
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds - faster filter switching
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
};
