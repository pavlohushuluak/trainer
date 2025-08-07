
import { CheckCircle2, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "@/hooks/useTranslations";

interface StepHeaderProps {
  step: {
    step_number: number;
    title: string;
    description: string;
    is_completed: boolean;
    points_reward: number;
    completed_at: string | null;
  };
}

export const StepHeader = ({ step }: StepHeaderProps) => {
  const { t } = useTranslations();
  
  return (
    <div className="flex items-start gap-3 flex-1">
      {step.is_completed ? (
        <CheckCircle2 className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
      ) : (
        <Circle className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
      )}
      <div className="flex-1">
        <h4 className="font-semibold text-base mb-1">
          {t('training.stepHeader.module', { number: step.step_number })}: {step.title}
        </h4>
        <p className="text-sm text-gray-600 mb-2">{step.description}</p>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {t('training.stepHeader.points', { points: step.points_reward })}
          </Badge>
          {step.completed_at && (
            <Badge className="bg-green-100 text-green-800 text-xs">
              {t('training.stepHeader.completedOn', { date: new Date(step.completed_at).toLocaleDateString('de-DE') })}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};
