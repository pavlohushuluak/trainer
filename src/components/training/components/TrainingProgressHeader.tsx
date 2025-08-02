
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star } from "lucide-react";

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
  const getStatusColor = () => {
    if (progressPercentage === 100) return "text-green-600";
    if (progressPercentage >= 50) return "text-blue-600";
    return "text-gray-600";
  };

  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          {planTitle}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={getStatusColor()}>
            {completedSteps}/{totalSteps} Schritte
          </Badge>
          <Badge className="bg-yellow-500 text-white">
            <Star className="h-3 w-3 mr-1" />
            {totalPoints} Punkte
          </Badge>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Fortschritt</span>
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
