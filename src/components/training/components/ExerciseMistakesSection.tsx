
import { AlertTriangle } from 'lucide-react';
import { Exercise } from '../templateTypes';

interface ExerciseMistakesSectionProps {
  exercise: Exercise;
}

export const ExerciseMistakesSection = ({ exercise }: ExerciseMistakesSectionProps) => {
  if (!exercise.commonMistakes || exercise.commonMistakes.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 font-semibold text-red-700">
        <AlertTriangle className="h-4 w-4" />
        🚩 Typische Fehler vermeiden:
      </div>
      <div className="bg-red-50 p-4 rounded-lg">
        <ul className="space-y-1">
          {exercise.commonMistakes.map((mistake, index) => (
            <li key={index} className="text-sm text-red-800">❌ {mistake}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
