
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Exercise } from '../templateTypes';
import { ExerciseHeader } from './ExerciseHeader';
import { ExerciseGoalSection } from './ExerciseGoalSection';
import { ExerciseStepsSection } from './ExerciseStepsSection';
import { ExerciseScheduleSection } from './ExerciseScheduleSection';
import { ExerciseToolsSection } from './ExerciseToolsSection';
import { ExerciseTipsSection } from './ExerciseTipsSection';
import { ExerciseMistakesSection } from './ExerciseMistakesSection';
import { ExerciseFallbackSection } from './ExerciseFallbackSection';

interface ModularExerciseCardProps {
  exercise: Exercise;
  moduleNumber: number;
}

export const ModularExerciseCard = ({ exercise, moduleNumber }: ModularExerciseCardProps) => {
  return (
    <Card className="mb-6 border-l-4 border-l-blue-500">
      <ExerciseHeader exercise={exercise} moduleNumber={moduleNumber} />

      <CardContent className="space-y-6">
        <ExerciseGoalSection exercise={exercise} />
        <ExerciseStepsSection exercise={exercise} />
        <ExerciseScheduleSection exercise={exercise} />
        <ExerciseToolsSection exercise={exercise} />
        <ExerciseTipsSection exercise={exercise} />
        <ExerciseMistakesSection exercise={exercise} />

        <Separator />

        <ExerciseFallbackSection exercise={exercise} />
      </CardContent>
    </Card>
  );
};
