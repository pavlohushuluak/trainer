
import { Clock } from 'lucide-react';
import { Exercise } from '../templateTypes';

interface ExerciseScheduleSectionProps {
  exercise: Exercise;
}

export const ExerciseScheduleSection = ({ exercise }: ExerciseScheduleSectionProps) => {
  if (!exercise.repetitionSchedule) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 font-semibold text-purple-700">
        <Clock className="h-4 w-4" />
        🔁 Wiederholung & Dauer:
      </div>
      <div className="space-y-2 bg-purple-50 p-4 rounded-lg">
        <div><strong>Tägliche Übung:</strong> {exercise.repetitionSchedule.dailyPractice}</div>
        <div><strong>Häufigkeit:</strong> {exercise.repetitionSchedule.frequency}</div>
        <div><strong>Trainingsdauer:</strong> {exercise.repetitionSchedule.trainingDuration}</div>
        {exercise.repetitionSchedule.note && (
          <div className="text-sm text-purple-800 font-medium">
            ⚠️ {exercise.repetitionSchedule.note}
          </div>
        )}
      </div>
    </div>
  );
};
