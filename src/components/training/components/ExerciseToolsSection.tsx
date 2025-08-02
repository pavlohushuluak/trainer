
import { Exercise } from '../templateTypes';

interface ExerciseToolsSectionProps {
  exercise: Exercise;
}

export const ExerciseToolsSection = ({ exercise }: ExerciseToolsSectionProps) => {
  if (!exercise.requiredTools) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 font-semibold text-orange-700">
        🧰 Benötigte Tools & Rahmenbedingungen:
      </div>
      <div className="bg-orange-50 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <strong>Equipment:</strong>
            <ul className="list-disc list-inside mt-1 text-sm">
              {exercise.requiredTools.equipment.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <strong>Ort:</strong> {exercise.requiredTools.location}
          </div>
          <div>
            <strong>Zeitraum:</strong> {exercise.requiredTools.timeframe}
          </div>
          {exercise.requiredTools.speciesAdaptation && (
            <div>
              <strong>Tierart-Anpassung:</strong> {exercise.requiredTools.speciesAdaptation}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
