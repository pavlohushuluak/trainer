
import { Target } from 'lucide-react';
import { Exercise } from '../templateTypes';

interface ExerciseGoalSectionProps {
  exercise: Exercise;
}

export const ExerciseGoalSection = ({ exercise }: ExerciseGoalSectionProps) => {
  if (!exercise.goal) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 font-semibold text-blue-700">
        <Target className="h-4 w-4" />
        📌 Ziel der Übung:
      </div>
      <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">{exercise.goal}</p>
    </div>
  );
};
