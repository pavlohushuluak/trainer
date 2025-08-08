
import { Exercise } from '../templateTypes';
import { useTranslations } from '@/hooks/useTranslations';

interface ExerciseFallbackSectionProps {
  exercise: Exercise;
}

export const ExerciseFallbackSection = ({ exercise }: ExerciseFallbackSectionProps) => {
  const { t } = useTranslations();
  
  if (exercise.stepByStepGuide || !exercise.steps || exercise.steps.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-foreground">{t('training.exercise.instructions')}:</h4>
      <div className="space-y-2">
        {exercise.steps.map((step, index) => (
          <div key={index} className="text-sm text-foreground bg-muted/50 dark:bg-muted/30 p-3 rounded border border-border">
            {step}
          </div>
        ))}
      </div>
    </div>
  );
};
