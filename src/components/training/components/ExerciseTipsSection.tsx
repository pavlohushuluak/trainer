
import { Lightbulb } from 'lucide-react';
import { Exercise } from '../templateTypes';

interface ExerciseTipsSectionProps {
  exercise: Exercise;
}

export const ExerciseTipsSection = ({ exercise }: ExerciseTipsSectionProps) => {
  if (!exercise.learningTips || exercise.learningTips.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 font-semibold text-indigo-700">
        <Lightbulb className="h-4 w-4" />
        🧠 Lerntipps & Motivation:
      </div>
      <div className="bg-indigo-50 p-4 rounded-lg">
        <ul className="space-y-1">
          {exercise.learningTips.map((tip, index) => (
            <li key={index} className="text-sm">• {tip}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
