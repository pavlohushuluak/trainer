
import { Clock } from 'lucide-react';
import { Exercise } from '../templateTypes';
import { useTranslations } from '@/hooks/useTranslations';

interface ExerciseScheduleSectionProps {
  exercise: Exercise;
}

export const ExerciseScheduleSection = ({ exercise }: ExerciseScheduleSectionProps) => {
  const { t } = useTranslations();
  
  if (!exercise.repetitionSchedule) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 font-semibold text-purple-700 dark:text-purple-400">
        <Clock className="h-4 w-4" />
        🔁 {t('training.exercise.repetitionAndDuration')}:
      </div>
      <div className="space-y-2 bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg border border-purple-200 dark:border-purple-400/50">
        <div className="text-foreground">
          <strong className="text-foreground">{t('training.exercise.dailyPractice')}:</strong> {exercise.repetitionSchedule.dailyPractice}
        </div>
        <div className="text-foreground">
          <strong className="text-foreground">{t('training.exercise.frequency')}:</strong> {exercise.repetitionSchedule.frequency}
        </div>
        <div className="text-foreground">
          <strong className="text-foreground">{t('training.exercise.trainingDuration')}:</strong> {exercise.repetitionSchedule.trainingDuration}
        </div>
        {exercise.repetitionSchedule.note && (
          <div className="text-sm text-purple-800 dark:text-purple-300 font-medium">
            ⚠️ {exercise.repetitionSchedule.note}
          </div>
        )}
      </div>
    </div>
  );
};
