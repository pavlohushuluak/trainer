
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useConfetti } from "@/hooks/useConfetti";
import { StepHeader } from "./StepHeader";
import { StepActions } from "./StepActions";
import { ModuleDetails } from "./ModuleDetails";

interface TrainingStep {
  id: string;
  step_number: number;
  title: string;
  description: string;
  is_completed: boolean;
  points_reward: number;
  completed_at: string | null;
}

interface TrainingStepItemProps {
  step: TrainingStep;
  onStepComplete: () => void;
}

export const TrainingStepItem = ({ step, onStepComplete }: TrainingStepItemProps) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { triggerStepConfetti } = useConfetti();

  const handleComplete = async () => {
    if (step.is_completed) return;
    
    
    
    setIsCompleting(true);
    
    try {
      

      const { data, error } = await supabase
        .from('training_steps')
        .update({ 
          is_completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('id', step.id)
        .select();



      if (error) throw error;

      // Invalidate rewards cache to trigger refresh
      queryClient.invalidateQueries({ queryKey: ['user-rewards'] });

      // Trigger step confetti celebration
      triggerStepConfetti();

      toast({
        title: "Schritt abgeschlossen! 🎉",
        description: `Du hast ${step.points_reward} Punkte erhalten!`,
      });
      
      onStepComplete();
    } catch (error) {
      console.error('Error completing step:', error);
      toast({
        title: "Fehler",
        description: "Beim Abschließen des Schritts ist ein Fehler aufgetreten.",
        variant: "destructive",
      });
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className={`border rounded-lg overflow-hidden ${
      step.is_completed 
        ? 'border-green-200 bg-green-50 dark:border-green-400/30 dark:bg-green-950/20' 
        : 'border-border bg-background'
    }`}>
      {/* Step Header */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <StepHeader step={step} />
          <StepActions 
            isCompleted={step.is_completed}
            isCompleting={isCompleting}
            onComplete={handleComplete}
          />
        </div>
      </div>

      {/* Expandable Module Details */}
      <ModuleDetails />
    </div>
  );
};
