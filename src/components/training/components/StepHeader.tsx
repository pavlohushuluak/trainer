
import { CheckCircle2, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "@/hooks/useTranslations";
import { parseTrainingContent } from "@/utils/trainingStepParser";

interface StepHeaderProps {
  step: {
    step_number: number;
    title: string;
    description: string;
    is_completed: boolean;
    points_reward: number;
    completed_at: string | null;
    exercise_goal?: string | null;
    exercise_goal_en?: string | null;
  };
}

export const StepHeader = ({ step }: StepHeaderProps) => {
  const { t, currentLanguage } = useTranslations();
  
  // Get exercise goal from structured data or parse from description
  const getExerciseGoal = () => {
    // First try to get from structured data
    if (currentLanguage === 'en' && step.exercise_goal_en) {
      return step.exercise_goal_en;
    }
    if (currentLanguage === 'de' && step.exercise_goal) {
      return step.exercise_goal;
    }
    
    // Fallback: parse from description
    try {
      const parsedContent = parseTrainingContent(step.description);
      return parsedContent.exerciseGoal;
    } catch (error) {
      return null;
    }
  };
  
  const exerciseGoal = getExerciseGoal();
  
  return (
    <div className="flex items-start gap-3 flex-1">
      {step.is_completed ? (
        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
      ) : (
        <Circle className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
      )}
      <div className="flex-1">
        <h4 className="font-semibold text-base mb-1 text-foreground">
          {t('training.stepHeader.module', { number: step.step_number })}: {step.title}
        </h4>
        {exerciseGoal && (
          <p className="text-sm text-blue-600 dark:text-blue-400 mb-1 font-medium">
            📌 {t('training.moduleDetails.exerciseGoal.title')}: {exerciseGoal}
          </p>
        )}
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs text-muted-foreground">
            {t('training.stepHeader.points', { points: step.points_reward })}
          </Badge>
          {step.completed_at && (
            <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs border-green-200 dark:border-green-800">
              {t('training.stepHeader.completedOn', { date: new Date(step.completed_at).toLocaleDateString('de-DE') })}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};
