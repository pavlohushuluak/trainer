
import { AlertTriangle } from 'lucide-react';
import { Exercise } from '../templateTypes';
import { useTranslations } from '@/hooks/useTranslations';

interface ExerciseMistakesSectionProps {
  exercise: Exercise;
}

export const ExerciseMistakesSection = ({ exercise }: ExerciseMistakesSectionProps) => {
  const { t } = useTranslations();
  
  if (!exercise.commonMistakes || exercise.commonMistakes.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 font-semibold text-red-700 dark:text-red-400">
        <AlertTriangle className="h-4 w-4" />
        🚩 {t('training.exercise.avoidCommonMistakes')}:
      </div>
      <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg border border-red-200 dark:border-red-400/50">
        <ul className="space-y-1">
          {exercise.commonMistakes.map((mistake, index) => (
            <li key={index} className="text-sm text-red-800 dark:text-red-300">❌ {mistake}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
