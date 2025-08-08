import { useTranslations } from '@/hooks/useTranslations';

export interface TrainingStepWithLocalization {
  id: string;
  step_number: number;
  title: string;
  title_en?: string | null;
  description: string;
  description_en?: string | null;
  is_completed: boolean;
  points_reward: number;
  completed_at: string | null;
  mastery_status?: 'in_training' | 'partially_mastered' | 'fully_mastered';
  target_sessions_daily?: number;
  total_sessions_completed?: number;
}

/**
 * Get localized title and description for a training step based on user's language
 */
export const getLocalizedTrainingStep = (
  step: TrainingStepWithLocalization,
  currentLanguage: 'de' | 'en'
) => {
  const localizedTitle = currentLanguage === 'en' && step.title_en 
    ? step.title_en 
    : step.title;
    
  const localizedDescription = currentLanguage === 'en' && step.description_en 
    ? step.description_en 
    : step.description;

  return {
    ...step,
    title: localizedTitle,
    description: localizedDescription,
  };
};

/**
 * Hook to get localized training step content
 */
export const useLocalizedTrainingStep = (step: TrainingStepWithLocalization) => {
  const { currentLanguage } = useTranslations();
  return getLocalizedTrainingStep(step, currentLanguage);
};

export interface TrainingPlanWithLocalization {
  id: string;
  title: string;
  title_en?: string | null;
  description: string;
  description_en?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  pet_id: string | null;
}

/**
 * Get localized title and description for a training plan based on user's language
 */
export const getLocalizedTrainingPlan = (
  plan: TrainingPlanWithLocalization,
  currentLanguage: 'de' | 'en'
) => {
  const localizedTitle = currentLanguage === 'en' && plan.title_en 
    ? plan.title_en 
    : plan.title;
    
  const localizedDescription = currentLanguage === 'en' && plan.description_en 
    ? plan.description_en 
    : plan.description;

  return {
    ...plan,
    title: localizedTitle,
    description: localizedDescription,
  };
};

/**
 * Hook to get localized training plan content
 */
export const useLocalizedTrainingPlan = (plan: TrainingPlanWithLocalization) => {
  const { currentLanguage } = useTranslations();
  return getLocalizedTrainingPlan(plan, currentLanguage);
}; 