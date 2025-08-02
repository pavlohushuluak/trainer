
import { Exercise } from '../templateTypes';

interface ExerciseFallbackSectionProps {
  exercise: Exercise;
}

export const ExerciseFallbackSection = ({ exercise }: ExerciseFallbackSectionProps) => {
  if (exercise.stepByStepGuide || !exercise.steps || exercise.steps.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="font-semibold">Anleitung:</h4>
      <div className="space-y-2">
        {exercise.steps.map((step, index) => (
          <div key={index} className="text-sm bg-gray-50 p-3 rounded">
            {step}
          </div>
        ))}
      </div>
    </div>
  );
};
