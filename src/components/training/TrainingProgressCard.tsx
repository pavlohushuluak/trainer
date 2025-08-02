
import { Card, CardContent } from "@/components/ui/card";
import { TrainingProgressHeader } from "./components/TrainingProgressHeader";
import { TrainingStepItem } from "./components/TrainingStepItem";
import { EmptyStepsState } from "./components/EmptyStepsState";
import { CompletedPlanBanner } from "./components/CompletedPlanBanner";
import { Badge } from "@/components/ui/badge";
import { SessionTracker } from "./SessionTracker";

export interface TrainingStep {
  id: string;
  step_number: number;
  title: string;
  description: string;
  is_completed: boolean;
  points_reward: number;
  completed_at: string | null;
  mastery_status?: 'in_training' | 'partially_mastered' | 'fully_mastered';
  target_sessions_daily?: number;
  total_sessions_completed?: number;
}

interface TrainingProgressCardProps {
  planId: string;
  planTitle: string;
  steps: TrainingStep[];
  onStepComplete: () => void;
  petName?: string;
  petSpecies?: string;
}

const getPetIcon = (species?: string) => {
  if (!species) return '🐾';
  
  const normalizedSpecies = species.toLowerCase().trim();
  
  switch (normalizedSpecies) {
    case 'hund':
    case 'dog': 
      return '🐶';
    case 'katze':
    case 'cat':
    case 'katz':
      return '🐱';
    case 'pferd':
    case 'horse':
      return '🐴';
    case 'vogel':
    case 'bird':
      return '🐦';
    case 'nager':
    case 'hamster':
    case 'meerschweinchen':
    case 'guinea pig':
    case 'rabbit':
    case 'kaninchen':
      return '🐹';
    default: 
      return '🐾';
  }
};

const getPetColor = (species?: string) => {
  if (!species) return 'blue';
  
  const normalizedSpecies = species.toLowerCase().trim();
  
  switch (normalizedSpecies) {
    case 'hund':
    case 'dog': 
      return 'blue';
    case 'katze':
    case 'cat':
    case 'katz':
      return 'purple';
    case 'pferd':
    case 'horse':
      return 'green';
    case 'vogel':
    case 'bird':
      return 'yellow';
    default: 
      return 'gray';
  }
};

export const TrainingProgressCard = ({ 
  planId, 
  planTitle, 
  steps, 
  onStepComplete,
  petName,
  petSpecies
}: TrainingProgressCardProps) => {
  const completedSteps = steps.filter(step => step.is_completed).length;
  const totalSteps = steps.length;
  const progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  const totalPoints = steps.reduce((sum, step) => 
    step.is_completed ? sum + step.points_reward : sum, 0
  );

  const petColor = getPetColor(petSpecies);
  const borderColor = petName ? `border-l-${petColor}-500` : 'border-l-gray-400';

  return (
    <Card className={`w-full border-l-4 ${borderColor} bg-white shadow-sm hover:shadow-md transition-shadow`}>
      {/* Pet Badge */}
      {petName && (
        <div className="px-4 pt-3 pb-1">
          <Badge variant="outline" className={`bg-${petColor}-50 text-${petColor}-700 border-${petColor}-200`}>
            {getPetIcon(petSpecies)} {petName}
            {petSpecies && <span className="text-xs ml-1">({petSpecies})</span>}
          </Badge>
        </div>
      )}
      
      {!petName && (
        <div className="px-4 pt-3 pb-1">
          <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
            📋 Allgemeiner Plan
          </Badge>
        </div>
      )}

      <TrainingProgressHeader
        planTitle={planTitle}
        completedSteps={completedSteps}
        totalSteps={totalSteps}
        totalPoints={totalPoints}
        progressPercentage={progressPercentage}
      />
      
      <CardContent>
        {steps.length === 0 ? (
          <EmptyStepsState />
        ) : (
          <div className="space-y-6">
            {steps.map((step) => (
              <div key={step.id} className="space-y-3">
                <TrainingStepItem
                  step={step}
                  onStepComplete={onStepComplete}
                />
                <SessionTracker
                  stepId={step.id}
                  stepTitle={step.title}
                  targetSessions={step.target_sessions_daily || 1}
                  masteryStatus={step.mastery_status || 'in_training'}
                  totalSessions={step.total_sessions_completed || 0}
                />
              </div>
            ))}
          </div>
        )}

        {progressPercentage === 100 && <CompletedPlanBanner />}
      </CardContent>
    </Card>
  );
};
