
import { TrainingProgressCard } from "../TrainingProgressCard";
import { CompactPlanCard } from "./CompactPlanCard";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export type ViewMode = 'list' | 'grid';

interface TrainingStep {
  id: string;
  step_number: number;
  title: string;
  title_en?: string | null;
  description: string;
  description_en?: string | null;
  is_completed: boolean;
  points_reward: number;
  completed_at: string | null;
}

interface TrainingPlanWithSteps {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  pet_id: string | null;
  pet_name?: string;
  pet_species?: string;
  steps: TrainingStep[];
}

interface PlansListProps {
  plans: TrainingPlanWithSteps[];
  onStepComplete: () => void;
  onDeletePlan: (planId: string) => void;
  viewMode?: ViewMode;
}

export const PlansList = ({ plans, onStepComplete, onDeletePlan, viewMode = 'list' }: PlansListProps) => {
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {plans.map((plan) => (
          <CompactPlanCard
            key={plan.id}
            plan={plan}
            onStepComplete={onStepComplete}
            onDeletePlan={onDeletePlan}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {plans.map((plan) => (
        <div key={plan.id} className="relative group">
          <TrainingProgressCard
            planId={plan.id}
            planTitle={plan.title}
            steps={plan.steps}
            onStepComplete={onStepComplete}
            petName={plan.pet_name}
            petSpecies={plan.pet_species}
          />
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            onClick={() => onDeletePlan(plan.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};
