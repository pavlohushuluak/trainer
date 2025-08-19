
import { Card, CardContent } from "@/components/ui/card";
import { TrainingProgressHeader } from "./components/TrainingProgressHeader";
import { useTranslations } from "@/hooks/useTranslations";
import { TrainingStepItem } from "./components/TrainingStepItem";
import { EmptyStepsState } from "./components/EmptyStepsState";
import { CompletedPlanBanner } from "./components/CompletedPlanBanner";
import { Badge } from "@/components/ui/badge";
import { SessionTracker } from "./SessionTracker";
import { useLocalizedTrainingStep } from "@/utils/trainingStepLocalization";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Target, Clock, Award, Sparkles } from "lucide-react";

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
  is_ai_generated?: boolean; // Add AI-generated flag
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

const getPetColorClasses = (species?: string) => {
  const normalizedSpecies = species?.toLowerCase().trim();
  
  const colorMap = {
    'hund': { 
      bg: 'bg-blue-50 dark:bg-blue-950/30', 
      text: 'text-blue-700 dark:text-blue-300', 
      border: 'border-blue-200 dark:border-blue-400/50', 
      leftBorder: 'border-l-blue-500 dark:border-l-blue-400',
      gradient: 'from-blue-500/10 to-blue-600/5'
    },
    'dog': { 
      bg: 'bg-blue-50 dark:bg-blue-950/30', 
      text: 'text-blue-700 dark:text-blue-300', 
      border: 'border-blue-200 dark:border-blue-400/50', 
      leftBorder: 'border-l-blue-500 dark:border-l-blue-400',
      gradient: 'from-blue-500/10 to-blue-600/5'
    },
    'katze': { 
      bg: 'bg-purple-50 dark:bg-purple-950/30', 
      text: 'text-purple-700 dark:text-purple-300', 
      border: 'border-purple-200 dark:border-purple-400/50', 
      leftBorder: 'border-l-purple-500 dark:border-l-purple-400',
      gradient: 'from-purple-500/10 to-purple-600/5'
    },
    'cat': { 
      bg: 'bg-purple-50 dark:bg-purple-950/30', 
      text: 'text-purple-700 dark:text-purple-300', 
      border: 'border-purple-200 dark:border-purple-400/50', 
      leftBorder: 'border-l-purple-500 dark:border-l-purple-400',
      gradient: 'from-purple-500/10 to-purple-600/5'
    },
    'katz': { 
      bg: 'bg-purple-50 dark:bg-purple-950/30', 
      text: 'text-purple-700 dark:text-purple-300', 
      border: 'border-purple-200 dark:border-purple-400/50', 
      leftBorder: 'border-l-purple-500 dark:border-l-purple-400',
      gradient: 'from-purple-500/10 to-purple-600/5'
    },
    'pferd': { 
      bg: 'bg-green-50 dark:bg-green-950/30', 
      text: 'text-green-700 dark:text-green-300', 
      border: 'border-green-200 dark:border-green-400/50', 
      leftBorder: 'border-l-green-500 dark:border-l-green-400',
      gradient: 'from-green-500/10 to-green-600/5'
    },
    'horse': { 
      bg: 'bg-green-50 dark:bg-green-950/30', 
      text: 'text-green-700 dark:text-green-300', 
      border: 'border-green-200 dark:border-green-400/50', 
      leftBorder: 'border-l-green-500 dark:border-l-green-400',
      gradient: 'from-green-500/10 to-green-600/5'
    },
    'vogel': { 
      bg: 'bg-yellow-50 dark:bg-yellow-950/30', 
      text: 'text-yellow-700 dark:text-yellow-300', 
      border: 'border-yellow-200 dark:border-yellow-400/50', 
      leftBorder: 'border-l-yellow-500 dark:border-l-yellow-400',
      gradient: 'from-yellow-500/10 to-yellow-600/5'
    },
    'bird': { 
      bg: 'bg-yellow-50 dark:bg-yellow-950/30', 
      text: 'text-yellow-700 dark:text-yellow-300', 
      border: 'border-yellow-200 dark:border-yellow-400/50', 
      leftBorder: 'border-l-yellow-500 dark:border-l-yellow-400',
      gradient: 'from-yellow-500/10 to-yellow-600/5'
    }
  };

  return colorMap[normalizedSpecies as keyof typeof colorMap] || {
    bg: 'bg-gray-50 dark:bg-gray-800/30', 
    text: 'text-gray-700 dark:text-gray-300', 
    border: 'border-gray-200 dark:border-gray-600/50', 
    leftBorder: 'border-l-gray-500 dark:border-l-gray-400',
    gradient: 'from-gray-500/10 to-gray-600/5'
  };
};

// Get mastery status info
const getMasteryInfo = (steps: TrainingStep[]) => {
  const totalSteps = steps.length;
  const masteredSteps = steps.filter(step => step.mastery_status === 'fully_mastered').length;
  const partiallyMasteredSteps = steps.filter(step => step.mastery_status === 'partially_mastered').length;
  const inTrainingSteps = steps.filter(step => step.mastery_status === 'in_training').length;

  return {
    totalSteps,
    masteredSteps,
    partiallyMasteredSteps,
    inTrainingSteps,
    masteryPercentage: totalSteps > 0 ? Math.round((masteredSteps / totalSteps) * 100) : 0
  };
};

// Get session tracking info
const getSessionInfo = (steps: TrainingStep[]) => {
  const totalSessions = steps.reduce((sum, step) => sum + (step.total_sessions_completed || 0), 0);
  const totalTargetSessions = steps.reduce((sum, step) => sum + (step.target_sessions_daily || 1), 0);
  
  return {
    totalSessions,
    totalTargetSessions,
    sessionProgress: totalTargetSessions > 0 ? Math.round((totalSessions / totalTargetSessions) * 100) : 0
  };
};

export const TrainingProgressCard = ({ 
  planId, 
  planTitle, 
  steps,
  onStepComplete,
  petName,
  petSpecies,
  is_ai_generated
}: TrainingProgressCardProps) => {
  const { t } = useTranslations();
  
  const completedSteps = steps.filter(step => step.is_completed).length;
  const totalSteps = steps.length;
  const progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  const totalPoints = steps.reduce((sum, step) => 
    step.is_completed ? sum + step.points_reward : sum, 0
  );

  const getBorderColor = () => {
    if (petSpecies) {
      const colors = getPetColorClasses(petSpecies);
      return colors.leftBorder;
    }
    return 'border-l-gray-500 dark:border-l-gray-400';
  };

  const getBadgeClasses = () => {
    if (petSpecies) {
      const colors = getPetColorClasses(petSpecies);
      return `${colors.bg} ${colors.text} ${colors.border}`;
    }
    return 'bg-muted/50 text-muted-foreground border-border';
  };

  const masteryInfo = getMasteryInfo(steps);
  const sessionInfo = getSessionInfo(steps);

  return (
    <Card className={`w-full border-l-4 ${getBorderColor()} bg-gradient-to-br from-background via-background to-muted/20 shadow-sm hover:shadow-lg transition-all duration-300 backdrop-blur-sm`}>
      {/* Pet Badge and AI Generated Badge */}
      {petName && (
        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getBadgeClasses()}>
              {getPetIcon(petSpecies)} {petName}
              {petSpecies && <span className="text-xs ml-1">({petSpecies})</span>}
            </Badge>
            
            {/* AI Generated Badge */}
            {is_ai_generated && (
              <Badge 
                variant="secondary" 
                className="text-xs bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 border-purple-200 dark:from-purple-900/30 dark:to-blue-900/30 dark:text-purple-200 dark:border-purple-400/50"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                AI Generated
              </Badge>
            )}
          </div>
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
      
      {/* Enhanced Progress Overview */}
      <div className="px-4 pb-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          {/* Step Progress */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 rounded-lg p-3 border border-blue-200/50 dark:border-blue-800/50">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Step Progress</span>
            </div>
            <Progress value={progressPercentage} className="h-2 bg-blue-200/50 dark:bg-blue-800/50" />
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              {completedSteps}/{totalSteps} completed
            </p>
          </div>

          {/* Mastery Progress */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-100/50 dark:from-yellow-950/30 dark:to-orange-900/20 rounded-lg p-3 border border-yellow-200/50 dark:border-yellow-800/50">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">Mastery</span>
            </div>
            <Progress value={masteryInfo.masteryPercentage} className="h-2 bg-yellow-200/50 dark:bg-yellow-800/50" />
            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
              {masteryInfo.masteredSteps}/{totalSteps} mastered
            </p>
          </div>

          {/* Session Progress */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-100/50 dark:from-green-950/30 dark:to-emerald-900/20 rounded-lg p-3 border border-green-200/50 dark:border-green-800/50">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-semibold text-green-700 dark:text-green-300">Sessions</span>
            </div>
            <Progress value={Math.min(sessionInfo.sessionProgress, 100)} className="h-2 bg-green-200/50 dark:bg-green-800/50" />
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              {sessionInfo.totalSessions} total sessions
            </p>
          </div>
        </div>

        {/* Mastery Status Summary */}
        {masteryInfo.totalSteps > 0 && (
          <div className="bg-gradient-to-r from-muted/30 to-muted/20 rounded-lg p-3 border border-border/50 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-foreground">Mastery Status Overview</span>
              <div className="flex items-center gap-1">
                {[...Array(3)].map((_, i) => {
                  let iconColor = "text-gray-300 dark:text-gray-600";
                  if (masteryInfo.masteryPercentage >= 100 && i < 3) {
                    iconColor = "text-yellow-500 dark:text-yellow-400";
                  } else if (masteryInfo.masteryPercentage >= 66 && i < 2) {
                    iconColor = "text-yellow-500 dark:text-yellow-400";
                  } else if (masteryInfo.masteryPercentage >= 33 && i < 1) {
                    iconColor = "text-blue-500 dark:text-blue-400";
                  }
                  return <Star key={i} className={`h-4 w-4 ${iconColor}`} />;
                })}
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs">
              {masteryInfo.masteredSteps > 0 && (
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-400/50">
                  <Trophy className="h-3 w-3 mr-1" />
                  {masteryInfo.masteredSteps} Mastered
                </Badge>
              )}
              {masteryInfo.partiallyMasteredSteps > 0 && (
                <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-400/50">
                  <Award className="h-3 w-3 mr-1" />
                  {masteryInfo.partiallyMasteredSteps} Partially
                </Badge>
              )}
              {masteryInfo.inTrainingSteps > 0 && (
                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-400/50">
                  <Target className="h-3 w-3 mr-1" />
                  {masteryInfo.inTrainingSteps} In Training
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
      
      <CardContent className="pt-0">
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
                    masteryStatus={(step.mastery_status as 'in_training' | 'partially_mastered' | 'fully_mastered') || 'in_training'}
                    totalSessions={step.total_sessions_completed || 0}
                    isCompleted={step.is_completed}
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
