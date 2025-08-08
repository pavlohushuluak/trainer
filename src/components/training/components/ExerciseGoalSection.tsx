
import { Target } from 'lucide-react';
import { Exercise } from '../templateTypes';
import { useTranslations } from '@/hooks/useTranslations';

interface ExerciseGoalSectionProps {
  exercise: Exercise;
}

export const ExerciseGoalSection = ({ exercise }: ExerciseGoalSectionProps) => {
  const { t } = useTranslations();
  
  if (!exercise.goal) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 font-semibold text-blue-700 dark:text-blue-400">
        <Target className="h-4 w-4" />
        📌 {t('training.exercise.goal')}:
      </div>
      <p className="text-foreground bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-200 dark:border-blue-400/50">
        {exercise.goal}
      </p>
    </div>
  );
};
