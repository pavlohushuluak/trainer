
import { Lightbulb } from 'lucide-react';
import { Exercise } from '../templateTypes';
import { useTranslations } from '@/hooks/useTranslations';

interface ExerciseTipsSectionProps {
  exercise: Exercise;
}

export const ExerciseTipsSection = ({ exercise }: ExerciseTipsSectionProps) => {
  const { t } = useTranslations();
  
  if (!exercise.learningTips || exercise.learningTips.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 font-semibold text-indigo-700 dark:text-indigo-400">
        <Lightbulb className="h-4 w-4" />
        🧠 {t('training.exercise.learningTipsAndMotivation')}:
      </div>
      <div className="bg-indigo-50 dark:bg-indigo-950/30 p-4 rounded-lg border border-indigo-200 dark:border-indigo-400/50">
        <ul className="space-y-1">
          {exercise.learningTips.map((tip, index) => (
            <li key={index} className="text-sm text-foreground">• {tip}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
