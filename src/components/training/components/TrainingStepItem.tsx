
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useConfetti } from "@/hooks/useConfetti";
import { useTranslations } from "@/hooks/useTranslations";
import { StepHeader } from "./StepHeader";
import { StepActions } from "./StepActions";
import { ModuleDetails } from "./ModuleDetails";
import { TrainingStepWithLocalization, useLocalizedTrainingStep } from "@/utils/trainingStepLocalization";
import { TrainingStep } from "../types";

interface TrainingStepItemProps {
  step: TrainingStep;
  onStepComplete: () => void;
}

export const TrainingStepItem = ({ step, onStepComplete }: TrainingStepItemProps) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { triggerStepConfetti } = useConfetti();
  const { t } = useTranslations();
  
  // Get localized step content based on user's language
  const localizedStep = useLocalizedTrainingStep(step as TrainingStepWithLocalization);

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
        title: t('training.stepCompleted.title'),
        description: t('training.stepCompleted.description', { points: step.points_reward }),
      });
      
      onStepComplete();
    } catch (error) {
      console.error('Error completing step:', error);
      toast({
        title: t('training.stepCompleted.error.title'),
        description: t('training.stepCompleted.error.description'),
        variant: "destructive",
      });
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className={`border rounded-lg overflow-hidden ${
      localizedStep.is_completed 
        ? 'border-green-200 bg-green-50 dark:border-green-400/30 dark:bg-green-950/20' 
        : 'border-border bg-background'
    }`}>
      {/* Step Header */}
      <div className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0 mb-3">
          <StepHeader step={localizedStep} />
          <StepActions 
            isCompleted={localizedStep.is_completed}
            isCompleting={isCompleting}
            onComplete={handleComplete}
          />
        </div>
      </div>

      {/* Expandable Module Details */}
      <ModuleDetails step={step} />
    </div>
  );
};
