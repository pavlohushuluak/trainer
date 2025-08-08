
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

interface TrainingProgressHeaderProps {
  planTitle: string;
  completedSteps: number;
  totalSteps: number;
  totalPoints: number;
  progressPercentage: number;
}

export const TrainingProgressHeader = ({ 
  planTitle, 
  completedSteps, 
  totalSteps, 
  totalPoints, 
  progressPercentage 
}: TrainingProgressHeaderProps) => {
  const { t } = useTranslations();
  
  const getStatusColor = () => {
    if (progressPercentage === 100) return "text-green-600 dark:text-green-400";
    if (progressPercentage >= 50) return "text-blue-600 dark:text-blue-400";
    return "text-muted-foreground";
  };

  return (
    <CardHeader>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 dark:text-yellow-400 flex-shrink-0" />
          <span className="break-words">{planTitle}</span>
        </CardTitle>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={`${getStatusColor()} text-xs sm:text-sm`}>
            {t('training.progressHeader.steps', { completed: completedSteps, total: totalSteps })}
          </Badge>
          <Badge className="bg-yellow-500 dark:bg-yellow-600 text-white text-xs sm:text-sm">
            <Star className="h-3 w-3 mr-1 flex-shrink-0" />
            {t('training.progressHeader.points', { points: totalPoints })}
          </Badge>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="font-medium text-foreground">{t('training.progressHeader.progress')}</span>
          <span className={`font-bold ${getStatusColor()}`}>{progressPercentage}%</span>
        </div>
        <Progress 
          value={progressPercentage} 
          className="h-2 sm:h-3"
        />
      </div>
    </CardHeader>
  );
};
