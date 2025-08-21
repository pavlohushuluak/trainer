
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { TrainingStep, TrainingPlan } from '../types';

interface TrainingPlanWithSteps extends TrainingPlan {
  pet_name?: string;
  pet_species?: string;
  steps: TrainingStep[];
}

export const usePlansWithSteps = (selectedPlanType: string, selectedPetId: string) => {
  const { user } = useAuth();

  console.log('🔍 usePlansWithSteps: selectedPlanType =', selectedPlanType, 'selectedPetId =', selectedPetId);

  return useQuery({
    queryKey: ['training-plans-with-steps', user?.id, selectedPlanType, selectedPetId],
    queryFn: async (): Promise<TrainingPlanWithSteps[]> => {

      if (!user) {
        return [];
      }

      try {
        let query: any = supabase
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

        // Apply filters based on selection
        console.log('🔍 Filtering plans with selectedPlanType:', selectedPlanType, 'selectedPetId:', selectedPetId);
        
        // Apply plan type filter
        if (selectedPlanType === "supported") {
          console.log('🎯 Filtering for supported plans (trainer-supported)');
          query = query.eq('is_ai_generated', true);
        } else if (selectedPlanType === "manual") {
          console.log('🎯 Filtering for manual plans');
          query = query.eq('is_ai_generated', false);
        }
        // For "all" plan type - no additional filter needed
        
        // Apply pet filter
        if (selectedPetId !== "all") {
          console.log('🎯 Filtering for pet-specific plans (pet_id =', selectedPetId, 'or null)');
          // Pet-specific filter: show plans for this pet OR unassigned plans
          query = query.or(`pet_id.eq.${selectedPetId},pet_id.is.null`);
        }
        // For "all" pets - no additional filter needed

        const { data: plans, error: plansError } = await query
          .order('created_at', { ascending: false });
        
        console.log('🔍 Database query result:', { plansCount: plans?.length || 0, error: plansError });

        if (plansError) {
          console.error('❌ Database query error:', plansError);
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

        console.log('📊 Plans returned:', plansWithSteps.length);
        plansWithSteps.forEach(plan => {
          console.log(`📋 Plan: ${plan.title} | is_ai_generated: ${plan.is_ai_generated} | pet_id: ${plan.pet_id}`);
        });

        // Check for plans with null is_ai_generated values and log them
        const plansWithNullAI = plansWithSteps.filter(p => p.is_ai_generated === null || p.is_ai_generated === undefined);
        if (plansWithNullAI.length > 0) {
          console.log('⚠️ Plans with null is_ai_generated values:', plansWithNullAI.map(p => p.title));
          console.log('💡 These plans will not appear in either "Supported Plans" or "Manual Plans" filters');
        }

        // Debug: Show filter summary
        if (selectedPlanType === "supported" || selectedPlanType === "manual") {
          const supportedPlans = plansWithSteps.filter(p => p.is_ai_generated === true).length;
          const manualPlans = plansWithSteps.filter(p => p.is_ai_generated === false).length;
          const nullPlans = plansWithSteps.filter(p => p.is_ai_generated === null || p.is_ai_generated === undefined).length;
          console.log(`🔍 Filter Summary - Trainer Supported: ${supportedPlans}, Manual: ${manualPlans}, Null/Undefined: ${nullPlans}`);
          console.log(`🎯 Current Filter: ${selectedPlanType === "supported" ? "Trainer-Supported Plans" : "Manual Plans"}`);
        }





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
