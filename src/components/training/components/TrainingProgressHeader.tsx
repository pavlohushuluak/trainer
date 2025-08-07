
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
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
          {planTitle}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={getStatusColor()}>
            {t('training.progressHeader.steps', { completed: completedSteps, total: totalSteps })}
          </Badge>
          <Badge className="bg-yellow-500 dark:bg-yellow-600 text-white">
            <Star className="h-3 w-3 mr-1" />
            {t('training.progressHeader.points', { points: totalPoints })}
          </Badge>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">{t('training.progressHeader.progress')}</span>
          <span className={`font-bold ${getStatusColor()}`}>{progressPercentage}%</span>
        </div>
        <Progress 
          value={progressPercentage} 
          className="h-3"
        />
      </div>
    </CardHeader>
  );
};
