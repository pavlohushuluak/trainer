
import { Exercise } from '../templateTypes';
import { useTranslations } from '@/hooks/useTranslations';

interface ExerciseStepsSectionProps {
  exercise: Exercise;
}

export const ExerciseStepsSection = ({ exercise }: ExerciseStepsSectionProps) => {
  const { t } = useTranslations();
  
  if (!exercise.stepByStepGuide) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 font-semibold text-green-700 dark:text-green-400">
        🧭 {t('training.exercise.stepByStepGuide')}:
      </div>
      <div className="space-y-3 bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-400/50">
        <div className="text-foreground">
          <strong className="text-foreground">{t('training.exercise.step1')}:</strong> {exercise.stepByStepGuide.step1}
        </div>
        <div className="text-foreground">
          <strong className="text-foreground">{t('training.exercise.step2')}:</strong> {exercise.stepByStepGuide.step2}
        </div>
        <div className="text-foreground">
          <strong className="text-foreground">{t('training.exercise.step3')}:</strong> {exercise.stepByStepGuide.step3}
        </div>
        <div className="border-t border-green-300 dark:border-green-400/50 pt-2 text-foreground">
          <strong className="text-foreground">{t('training.exercise.errorCorrection')}:</strong> {exercise.stepByStepGuide.errorCorrection}
        </div>
        {exercise.stepByStepGuide.speciesAdaptation && (
          <div className="border-t border-green-300 dark:border-green-400/50 pt-2 text-foreground">
            <strong className="text-foreground">💡 {t('training.exercise.speciesAdaptation')}:</strong> {exercise.stepByStepGuide.speciesAdaptation}
          </div>
        )}
      </div>
    </div>
  );
};
