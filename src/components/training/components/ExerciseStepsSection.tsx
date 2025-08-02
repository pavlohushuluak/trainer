
import { Exercise } from '../templateTypes';

interface ExerciseStepsSectionProps {
  exercise: Exercise;
}

export const ExerciseStepsSection = ({ exercise }: ExerciseStepsSectionProps) => {
  if (!exercise.stepByStepGuide) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 font-semibold text-green-700">
        🧭 Schritt-für-Schritt-Anleitung:
      </div>
      <div className="space-y-3 bg-green-50 p-4 rounded-lg">
        <div>
          <strong>Schritt 1:</strong> {exercise.stepByStepGuide.step1}
        </div>
        <div>
          <strong>Schritt 2:</strong> {exercise.stepByStepGuide.step2}
        </div>
        <div>
          <strong>Schritt 3:</strong> {exercise.stepByStepGuide.step3}
        </div>
        <div className="border-t pt-2">
          <strong>Fehlerkorrektur:</strong> {exercise.stepByStepGuide.errorCorrection}
        </div>
        {exercise.stepByStepGuide.speciesAdaptation && (
          <div className="border-t pt-2">
            <strong>💡 Tierart-Anpassung:</strong> {exercise.stepByStepGuide.speciesAdaptation}
          </div>
        )}
      </div>
    </div>
  );
};
