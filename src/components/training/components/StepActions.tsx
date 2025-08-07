
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/hooks/useTranslations";

interface StepActionsProps {
  isCompleted: boolean;
  isCompleting: boolean;
  onComplete: () => void;
}

export const StepActions = ({ isCompleted, isCompleting, onComplete }: StepActionsProps) => {
  const { t } = useTranslations();
  
  if (isCompleted) return null;

  return (
    <Button 
      onClick={onComplete}
      disabled={isCompleting}
      size="sm"
      className="ml-4"
    >
      {isCompleting ? t('training.stepActions.saving') : t('training.stepActions.complete')}
    </Button>
  );
};
