
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Exercise } from '../templateTypes';

interface ExerciseHeaderProps {
  exercise: Exercise;
  moduleNumber: number;
}

export const ExerciseHeader = ({ exercise, moduleNumber }: ExerciseHeaderProps) => {
  return (
    <CardHeader>
      <div className="flex items-start justify-between">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            📘 Modul {moduleNumber}: {exercise.title}
          </CardTitle>
          {exercise.shortDescription && (
            <CardDescription className="mt-2 text-base">
              {exercise.shortDescription}
            </CardDescription>
          )}
        </div>
        <Badge variant="outline" className="ml-4">
          {exercise.difficulty}
        </Badge>
      </div>
    </CardHeader>
  );
};
