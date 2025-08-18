import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Play, CheckCircle, Target, Clock, Trophy, Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useTranslations } from "@/hooks/useTranslations";
import { useTrainingSessions } from "../hooks/useTrainingSessions";
import { TrainingStep, TrainingPlan } from "../types";

interface TrainingPlanWithSteps extends TrainingPlan {
  pet_name?: string;
  pet_species?: string;
  steps: TrainingStep[];
}

interface CompactPlanCardProps {
  plan: TrainingPlanWithSteps;
  onStepComplete: () => void;
  onDeletePlan: (planId: string) => void;
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

// Get static color classes based on pet species
const getPetColorClasses = (species?: string, isLinked: boolean = true) => {
  const normalizedSpecies = species?.toLowerCase().trim();
  
  const colorMap = {
    'hund': { 
      bg: 'bg-blue-50 dark:bg-blue-950/30', 
      text: 'text-blue-700 dark:text-blue-300', 
      border: 'border-blue-200 dark:border-blue-400/50', 
      leftBorder: 'border-l-blue-500 dark:border-l-blue-400',
      gradient: 'from-blue-500/10 to-blue-600/5',
      hover: 'hover:from-blue-500/20 hover:to-blue-600/15'
    },
    'dog': { 
      bg: 'bg-blue-50 dark:bg-blue-950/30', 
      text: 'text-blue-700 dark:text-blue-300', 
      border: 'border-blue-200 dark:border-blue-400/50', 
      leftBorder: 'border-l-blue-500 dark:border-l-blue-400',
      gradient: 'from-blue-500/10 to-blue-600/5',
      hover: 'hover:from-blue-500/20 hover:to-blue-600/15'
    },
    'katze': { 
      bg: 'bg-purple-50 dark:bg-purple-950/30', 
      text: 'text-purple-700 dark:text-purple-300', 
      border: 'border-purple-200 dark:border-purple-400/50', 
      leftBorder: 'border-l-purple-500 dark:border-l-purple-400',
      gradient: 'from-purple-500/10 to-purple-600/5',
      hover: 'hover:from-purple-500/20 hover:to-purple-600/15'
    },
    'cat': { 
      bg: 'bg-purple-50 dark:bg-purple-950/30', 
      text: 'text-purple-700 dark:text-purple-300', 
      border: 'border-purple-200 dark:border-purple-400/50', 
      leftBorder: 'border-l-purple-500 dark:border-l-purple-400',
      gradient: 'from-purple-500/10 to-purple-600/5',
      hover: 'hover:from-purple-500/20 hover:to-purple-600/15'
    },
    'katz': { 
      bg: 'bg-purple-50 dark:bg-purple-950/30', 
      text: 'text-purple-700 dark:text-purple-300', 
      border: 'border-purple-200 dark:border-purple-400/50', 
      leftBorder: 'border-l-purple-500 dark:border-l-purple-400',
      gradient: 'from-purple-500/10 to-purple-600/5',
      hover: 'hover:from-purple-500/20 hover:to-purple-600/15'
    },
    'pferd': { 
      bg: 'bg-green-50 dark:bg-green-950/30', 
      text: 'text-green-700 dark:text-green-300', 
      border: 'border-green-200 dark:border-green-400/50', 
      leftBorder: 'border-l-green-500 dark:border-l-green-400',
      gradient: 'from-green-500/10 to-green-600/5',
      hover: 'hover:from-green-500/20 hover:to-green-600/15'
    },
    'horse': { 
      bg: 'bg-green-50 dark:bg-green-950/30', 
      text: 'text-green-700 dark:text-green-300', 
      border: 'border-green-200 dark:border-green-400/50', 
      leftBorder: 'border-l-green-500 dark:border-l-green-400',
      gradient: 'from-green-500/10 to-green-600/5',
      hover: 'hover:from-green-500/20 hover:to-green-600/15'
    },
    'vogel': { 
      bg: 'bg-yellow-50 dark:bg-yellow-950/30', 
      text: 'text-yellow-700 dark:text-yellow-300', 
      border: 'border-yellow-200 dark:border-yellow-400/50', 
      leftBorder: 'border-l-yellow-500 dark:border-l-yellow-400',
      gradient: 'from-yellow-500/10 to-yellow-600/5',
      hover: 'hover:from-yellow-500/20 hover:to-yellow-600/15'
    },
    'bird': { 
      bg: 'bg-yellow-50 dark:bg-yellow-950/30', 
      text: 'text-yellow-700 dark:text-yellow-300', 
      border: 'border-yellow-200 dark:border-yellow-400/50', 
      leftBorder: 'border-l-yellow-500 dark:border-l-yellow-400',
      gradient: 'from-yellow-500/10 to-yellow-600/5',
      hover: 'hover:from-yellow-500/20 hover:to-yellow-600/15'
    },
    'orange': { 
      bg: 'bg-orange-50 dark:bg-orange-950/30', 
      text: 'text-orange-700 dark:text-orange-300', 
      border: 'border-orange-200 dark:border-orange-400/50', 
      leftBorder: 'border-l-orange-500 dark:border-l-orange-400',
      gradient: 'from-orange-500/10 to-orange-600/5',
      hover: 'hover:from-orange-500/20 hover:to-orange-600/15'
    },
    'gray': { 
      bg: 'bg-gray-50 dark:bg-gray-800/30', 
      text: 'text-gray-700 dark:text-gray-300', 
      border: 'border-gray-200 dark:border-gray-600/50', 
      leftBorder: 'border-l-gray-500 dark:border-l-gray-400',
      gradient: 'from-gray-500/10 to-gray-600/5',
      hover: 'hover:from-gray-500/20 hover:to-gray-600/15'
    }
  };

  const colors = colorMap[normalizedSpecies as keyof typeof colorMap] || colorMap.gray;
  
  return {
    ...colors,
    badgeClasses: `w-fit ${colors.bg} ${colors.text} ${colors.border} text-xs font-medium ${!isLinked ? 'border-dashed' : ''}`
  };
};

// Extract pet name from plan title when pet_id is null
const extractPetNameFromTitle = (title: string): string | null => {
  // Common patterns for pet names in titles
  const patterns = [
    /für\s+([A-Za-zÄÖÜäöüß]+)/i,  // "für Clark"
    /von\s+([A-Za-zÄÖÜäöüß]+)/i,  // "von Clark"
    /mit\s+([A-Za-zÄÖÜäöüß]+)/i,  // "mit Clark"
    /-\s*([A-Za-zÄÖÜäöüß]+)$/i,    // "Plan - Clark"
  ];
  
  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return null;
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

// Get session tracking info using actual session data
const getSessionInfo = (steps: TrainingStep[]) => {
  // Calculate total sessions from all steps using the sessions data
  let totalSessions = 0;
  let totalTargetSessions = 0;
  
  steps.forEach(step => {
    // Use the useTrainingSessions hook to get actual session count for each step
    // For now, we'll use the total_sessions_completed field as fallback
    // The real-time updates will come from the SessionTracker components
    totalSessions += step.total_sessions_completed || 0;
    totalTargetSessions += step.target_sessions_daily || 1;
  });
  
  return {
    totalSessions,
    totalTargetSessions,
    sessionProgress: totalTargetSessions > 0 ? Math.round((totalSessions / totalTargetSessions) * 100) : 0
  };
};

export const CompactPlanCard = ({ plan, onStepComplete, onDeletePlan }: CompactPlanCardProps) => {
  const { t } = useTranslations();
  
  // Get display information for pet
  const getPetDisplayInfo = (plan: TrainingPlanWithSteps) => {
    // If we have pet information from relation, use it
    if (plan.pet_name && plan.pet_species) {
      const colorClasses = getPetColorClasses(plan.pet_species, true);
      return {
        name: plan.pet_name,
        species: plan.pet_species,
        icon: getPetIcon(plan.pet_species),
        colorClasses,
        isLinked: true
      };
    }
    
    // Try to extract pet name from title
    const extractedName = extractPetNameFromTitle(plan.title);
    if (extractedName) {
      const colorClasses = getPetColorClasses('orange', false);
      return {
        name: extractedName,
        species: undefined,
        icon: '🐾',
        colorClasses,
        isLinked: false
      };
    }
    
    // Fallback to general
    const colorClasses = getPetColorClasses('gray', false);
    return {
      name: t('training.general'),
      species: undefined,
      icon: '📋',
      colorClasses,
      isLinked: false
    };
  };

  const completedSteps = plan.steps.filter(step => step.is_completed).length;
  const totalSteps = plan.steps.length;
  const progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  const totalPoints = plan.steps.reduce((sum, step) => 
    step.is_completed ? sum + step.points_reward : sum, 0
  );

  const petInfo = getPetDisplayInfo(plan);
  const masteryInfo = getMasteryInfo(plan.steps);
  const sessionInfo = getSessionInfo(plan.steps);

  return (
    <Card className={`relative group h-full border-l-4 ${petInfo.colorClasses.leftBorder} bg-gradient-to-br ${petInfo.colorClasses.gradient} ${petInfo.colorClasses.hover} shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer backdrop-blur-sm`}>
      <CardHeader className="pb-3">
        {/* Pet Badge */}
        <div className="flex items-center justify-between">
          <Badge 
            variant="outline" 
            className={petInfo.colorClasses.badgeClasses}
          >
            {petInfo.icon} {petInfo.name}
            {!petInfo.isLinked && (
              <span className="ml-1 text-xs opacity-75">*</span>
            )}
          </Badge>

          {/* Mastery Badge */}
          {masteryInfo.masteryPercentage > 0 && (
            <Badge 
              variant="secondary" 
              className="text-xs bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-200 dark:from-yellow-900/30 dark:to-orange-900/30 dark:text-yellow-200 dark:border-yellow-400/50"
            >
              <Trophy className="h-3 w-3 mr-1" />
              {masteryInfo.masteryPercentage}% Mastery
            </Badge>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-lg leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors">
          {plan.title}
        </h3>

        {/* Progress Bars */}
        <div className="space-y-3">
          {/* Step Progress */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span className="font-medium">{t('training.progressHeader.steps', { completed: completedSteps, total: totalSteps })}</span>
              <span className="font-medium">{t('training.progressHeader.points', { points: totalPoints })}</span>
            </div>
            <Progress value={progressPercentage} className="h-2 bg-muted/50" />
          </div>

          {/* Session Progress */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span className="font-medium flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {t('training.sessionTracker.masteryProgress', { current: sessionInfo.totalSessions })}
              </span>
              <span className="font-medium flex items-center gap-1">
                <Target className="h-3 w-3" />
                {sessionInfo.totalTargetSessions}/day
              </span>
            </div>
            <Progress value={Math.min(sessionInfo.sessionProgress, 100)} className="h-2 bg-muted/50" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Quick Actions */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {progressPercentage === 100 ? (
              <Badge variant="secondary" className="text-xs bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-300 dark:border-green-400/50">
                <CheckCircle className="h-3 w-3 mr-1" />
                {t('training.completedPlanBanner.title')}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs bg-background/80 backdrop-blur-sm">
                <Play className="h-3 w-3 mr-1" />
                {progressPercentage}% Complete
              </Badge>
            )}
          </div>

          {/* Click indicator */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              {t('training.trainingPlans.clickToView')}
            </span>
            
            {/* Delete Button */}
            <Button
              variant="destructive"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0 bg-red-500/90 hover:bg-red-600"
              onClick={(e) => {
                e.stopPropagation();
                onDeletePlan(plan.id);
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Mastery Status Summary */}
        {masteryInfo.totalSteps > 0 && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">Mastery Status:</span>
              <div className="flex items-center gap-2">
                {masteryInfo.masteredSteps > 0 && (
                  <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-400/50">
                    <Star className="h-3 w-3 mr-1" />
                    {masteryInfo.masteredSteps}
                  </Badge>
                )}
                {masteryInfo.partiallyMasteredSteps > 0 && (
                  <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-400/50">
                    <Target className="h-3 w-3 mr-1" />
                    {masteryInfo.partiallyMasteredSteps}
                  </Badge>
                )}
                {masteryInfo.inTrainingSteps > 0 && (
                  <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-400/50">
                    <Play className="h-3 w-3 mr-1" />
                    {masteryInfo.inTrainingSteps}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};