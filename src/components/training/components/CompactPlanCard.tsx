import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Play, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useTranslations } from "@/hooks/useTranslations";

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
      leftBorder: 'border-l-blue-500 dark:border-l-blue-400' 
    },
    'dog': { 
      bg: 'bg-blue-50 dark:bg-blue-950/30', 
      text: 'text-blue-700 dark:text-blue-300', 
      border: 'border-blue-200 dark:border-blue-400/50', 
      leftBorder: 'border-l-blue-500 dark:border-l-blue-400' 
    },
    'katze': { 
      bg: 'bg-purple-50 dark:bg-purple-950/30', 
      text: 'text-purple-700 dark:text-purple-300', 
      border: 'border-purple-200 dark:border-purple-400/50', 
      leftBorder: 'border-l-purple-500 dark:border-l-purple-400' 
    },
    'cat': { 
      bg: 'bg-purple-50 dark:bg-purple-950/30', 
      text: 'text-purple-700 dark:text-purple-300', 
      border: 'border-purple-200 dark:border-purple-400/50', 
      leftBorder: 'border-l-purple-500 dark:border-l-purple-400' 
    },
    'katz': { 
      bg: 'bg-purple-50 dark:bg-purple-950/30', 
      text: 'text-purple-700 dark:text-purple-300', 
      border: 'border-purple-200 dark:border-purple-400/50', 
      leftBorder: 'border-l-purple-500 dark:border-l-purple-400' 
    },
    'pferd': { 
      bg: 'bg-green-50 dark:bg-green-950/30', 
      text: 'text-green-700 dark:text-green-300', 
      border: 'border-green-200 dark:border-green-400/50', 
      leftBorder: 'border-l-green-500 dark:border-l-green-400' 
    },
    'horse': { 
      bg: 'bg-green-50 dark:bg-green-950/30', 
      text: 'text-green-700 dark:text-green-300', 
      border: 'border-green-200 dark:border-green-400/50', 
      leftBorder: 'border-l-green-500 dark:border-l-green-400' 
    },
    'vogel': { 
      bg: 'bg-yellow-50 dark:bg-yellow-950/30', 
      text: 'text-yellow-700 dark:text-yellow-300', 
      border: 'border-yellow-200 dark:border-yellow-400/50', 
      leftBorder: 'border-l-yellow-500 dark:border-l-yellow-400' 
    },
    'bird': { 
      bg: 'bg-yellow-50 dark:bg-yellow-950/30', 
      text: 'text-yellow-700 dark:text-yellow-300', 
      border: 'border-yellow-200 dark:border-yellow-400/50', 
      leftBorder: 'border-l-yellow-500 dark:border-l-yellow-400' 
    },
    'orange': { 
      bg: 'bg-orange-50 dark:bg-orange-950/30', 
      text: 'text-orange-700 dark:text-orange-300', 
      border: 'border-orange-200 dark:border-orange-400/50', 
      leftBorder: 'border-l-orange-500 dark:border-l-orange-400' 
    },
    'gray': { 
      bg: 'bg-gray-50 dark:bg-gray-800/30', 
      text: 'text-gray-700 dark:text-gray-300', 
      border: 'border-gray-200 dark:border-gray-600/50', 
      leftBorder: 'border-l-gray-500 dark:border-l-gray-400' 
    }
  };

  const colors = colorMap[normalizedSpecies as keyof typeof colorMap] || colorMap.gray;
  
  return {
    ...colors,
    badgeClasses: `w-fit ${colors.bg} ${colors.text} ${colors.border} text-xs ${!isLinked ? 'border-dashed' : ''}`
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

  return (
    <Card className={`relative group h-full border-l-4 ${petInfo.colorClasses.leftBorder} bg-background shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]`}>
      <CardHeader className="pb-3">
        {/* Pet Badge */}
        <Badge 
          variant="outline" 
          className={petInfo.colorClasses.badgeClasses}
        >
          {petInfo.icon} {petInfo.name}
          {!petInfo.isLinked && (
            <span className="ml-1 text-xs opacity-75">*</span>
          )}
        </Badge>

        {/* Title */}
        <h3 className="font-semibold text-lg leading-tight line-clamp-2 text-foreground">
          {plan.title}
        </h3>

        {/* Progress */}
        <div className="space-y-2">
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>{t('training.progressHeader.steps', { completed: completedSteps, total: totalSteps })}</span>
            <span>{t('training.progressHeader.points', { points: totalPoints })}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Quick Actions */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {progressPercentage === 100 ? (
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-400/50">
                <CheckCircle className="h-3 w-3 mr-1" />
                {t('training.completedPlanBanner.title')}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs">
                <Play className="h-3 w-3 mr-1" />
                {progressPercentage}%
              </Badge>
            )}
          </div>

          {/* Delete Button */}
          <Button
            variant="destructive"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0"
            onClick={() => onDeletePlan(plan.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};