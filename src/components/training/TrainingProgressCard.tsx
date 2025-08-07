
import { Card, CardContent } from "@/components/ui/card";
import { TrainingProgressHeader } from "./components/TrainingProgressHeader";
import { useTranslations } from "@/hooks/useTranslations";
import { TrainingStepItem } from "./components/TrainingStepItem";
import { EmptyStepsState } from "./components/EmptyStepsState";
import { CompletedPlanBanner } from "./components/CompletedPlanBanner";
import { Badge } from "@/components/ui/badge";
import { SessionTracker } from "./SessionTracker";
import { useLocalizedTrainingStep } from "@/utils/trainingStepLocalization";

export interface TrainingStep {
  id: string;
  step_number: number;
  title: string;
  title_en?: string | null;
  description: string;
  description_en?: string | null;
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
  const { t } = useTranslations();
  const completedSteps = steps.filter(step => step.is_completed).length;
  const totalSteps = steps.length;
  const progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  const totalPoints = steps.reduce((sum, step) => 
    step.is_completed ? sum + step.points_reward : sum, 0
  );

  const petColor = getPetColor(petSpecies);
  
  const getBorderColor = () => {
    if (!petName) return 'border-l-muted-foreground/30';
    switch (petColor) {
      case 'blue': return 'border-l-blue-500 dark:border-l-blue-400';
      case 'purple': return 'border-l-purple-500 dark:border-l-purple-400';
      case 'green': return 'border-l-green-500 dark:border-l-green-400';
      case 'yellow': return 'border-l-yellow-500 dark:border-l-yellow-400';
      default: return 'border-l-muted-foreground/30';
    }
  };

  const getBadgeClasses = () => {
    if (!petName) return 'bg-muted/50 text-muted-foreground border-border';
    switch (petColor) {
      case 'blue': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-400/50';
      case 'purple': return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-400/50';
      case 'green': return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-400/50';
      case 'yellow': return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-300 dark:border-yellow-400/50';
      default: return 'bg-muted/50 text-muted-foreground border-border';
    }
  };

  return (
    <Card className={`w-full border-l-4 ${getBorderColor()} bg-background shadow-sm hover:shadow-md transition-shadow`}>
      {/* Pet Badge */}
      {petName && (
        <div className="px-4 pt-3 pb-1">
          <Badge variant="outline" className={getBadgeClasses()}>
            {getPetIcon(petSpecies)} {petName}
            {petSpecies && <span className="text-xs ml-1">({petSpecies})</span>}
          </Badge>
        </div>
      )}
      
      {!petName && (
        <div className="px-4 pt-3 pb-1">
          <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-border">
            📋 {t('training.progressCard.generalPlan')}
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
            {steps.map((step) => {
              const localizedStep = useLocalizedTrainingStep(step);
              return (
                <div key={step.id} className="space-y-3">
                  <TrainingStepItem
                    step={localizedStep}
                    onStepComplete={onStepComplete}
                  />
                  <SessionTracker
                    stepId={step.id}
                    stepTitle={localizedStep.title}
                    targetSessions={step.target_sessions_daily || 1}
                    masteryStatus={step.mastery_status || 'in_training'}
                    totalSessions={step.total_sessions_completed || 0}
                  />
                </div>
              );
            })}
          </div>
        )}

        {progressPercentage === 100 && <CompletedPlanBanner />}
      </CardContent>
    </Card>
  );
};
