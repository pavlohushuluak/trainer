
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface PlanTemplateForCreation {
  title: string;
  description: string;
  exercises: Array<{
    title: string;
    description: string;
    points_reward?: number;
  }>;
}

export const usePlanActions = (refetch: () => void) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleTemplateSelect = useCallback(async (template: PlanTemplateForCreation, selectedPetId?: string) => {
    if (!user) return;

    try {
      
      // Create the plan based on template
      const { data: newPlan, error: planError } = await supabase
        .from('training_plans')
        .insert({
          title: template.title,
          description: template.description,
          user_id: user.id,
          pet_id: selectedPetId === 'none' ? null : selectedPetId,
          status: 'planned'
        })
        .select()
        .single();

      if (planError) {
        console.error('Error creating plan:', planError);
        throw planError;
      }

      

      // Create training steps from template exercises
      const stepsToInsert = template.exercises.map((exercise, index) => ({
        training_plan_id: newPlan.id,
        step_number: index + 1,
        title: exercise.title,
        description: exercise.description,
        points_reward: exercise.points_reward || 10,
        is_completed: false
      }));

      

      const { error: stepsError } = await supabase
        .from('training_steps')
        .insert(stepsToInsert);

      if (stepsError) {
        console.error('Error creating steps:', stepsError);
        throw stepsError;
      }


      toast({
        title: t('training.toasts.planActions.templateCreated.title'),
        description: t('training.toasts.planActions.templateCreated.description', { 
          title: template.title, 
          steps: template.exercises.length 
        }),
      });

      refetch();
    } catch (error) {
      console.error('Error creating plan from template:', error);
      toast({
        title: t('training.toasts.planActions.templateError.title'),
        description: t('training.toasts.planActions.templateError.description'),
        variant: "destructive"
      });
    }
  }, [user, toast, refetch, t]);

  const handleDeletePlan = useCallback(async (planId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('training_plans')
        .delete()
        .eq('id', planId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: t('training.toasts.planActions.planDeleted.title'),
        description: t('training.toasts.planActions.planDeleted.description'),
      });

      refetch();
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast({
        title: t('training.toasts.planActions.deleteError.title'),
        description: t('training.toasts.planActions.deleteError.description'),
        variant: "destructive"
      });
    }
  }, [user, toast, refetch, t]);

  return {
    handleTemplateSelect,
    handleDeletePlan
  };
};
