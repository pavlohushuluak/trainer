
import { Exercise } from '../templateTypes';
import { useTranslations } from '@/hooks/useTranslations';

interface ExerciseToolsSectionProps {
  exercise: Exercise;
}

export const ExerciseToolsSection = ({ exercise }: ExerciseToolsSectionProps) => {
  const { t } = useTranslations();
  
  if (!exercise.requiredTools) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 font-semibold text-orange-700 dark:text-orange-400">
        🧰 {t('training.exercise.requiredToolsAndConditions')}:
      </div>
      <div className="bg-orange-50 dark:bg-orange-950/30 p-4 rounded-lg border border-orange-200 dark:border-orange-400/50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-foreground">
            <strong className="text-foreground">{t('training.exercise.equipment')}:</strong>
            <ul className="list-disc list-inside mt-1 text-sm text-muted-foreground">
              {exercise.requiredTools.equipment.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="text-foreground">
            <strong className="text-foreground">{t('training.exercise.location')}:</strong> {exercise.requiredTools.location}
          </div>
          <div className="text-foreground">
            <strong className="text-foreground">{t('training.exercise.timeframe')}:</strong> {exercise.requiredTools.timeframe}
          </div>
          {exercise.requiredTools.speciesAdaptation && (
            <div className="text-foreground">
              <strong className="text-foreground">{t('training.exercise.speciesAdaptation')}:</strong> {exercise.requiredTools.speciesAdaptation}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
