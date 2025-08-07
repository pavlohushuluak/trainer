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