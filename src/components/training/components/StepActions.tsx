
import { Button } from "@/components/ui/button";

interface StepActionsProps {
  isCompleted: boolean;
  isCompleting: boolean;
  onComplete: () => void;
}

export const StepActions = ({ isCompleted, isCompleting, onComplete }: StepActionsProps) => {
  if (isCompleted) return null;

  return (
    <Button 
      onClick={onComplete}
      disabled={isCompleting}
      size="sm"
      className="ml-4"
    >
      {isCompleting ? 'Wird gespeichert...' : 'Abschließen'}
    </Button>
  );
};
