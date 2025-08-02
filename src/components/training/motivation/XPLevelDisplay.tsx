import { Star, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface XPLevelDisplayProps {
  totalPoints: number;
}

export const XPLevelDisplay = ({ totalPoints }: XPLevelDisplayProps) => {
  // Calculate level based on points (every 100 points = 1 level)
  const currentLevel = Math.floor(totalPoints / 100) + 1;
  const pointsInCurrentLevel = totalPoints % 100;
  const pointsForNextLevel = 100;
  const progressPercentage = (pointsInCurrentLevel / pointsForNextLevel) * 100;

  const getLevelTitle = (level: number) => {
    if (level >= 20) return "Tier-Meister";
    if (level >= 15) return "Experten-Trainer";
    if (level >= 10) return "Profi-Trainer";
    if (level >= 5) return "Fortgeschrittener";
    return "Anfänger";
  };

  const getLevelColor = (level: number) => {
    if (level >= 20) return "text-purple-600";
    if (level >= 15) return "text-yellow-600";
    if (level >= 10) return "text-blue-600";
    if (level >= 5) return "text-green-600";
    return "text-gray-600";
  };

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-cta/5 border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Star className={`h-5 w-5 ${getLevelColor(currentLevel)}`} />
            <span className="font-semibold text-foreground">Level {currentLevel}</span>
          </div>
          <span className={`text-sm font-medium ${getLevelColor(currentLevel)}`}>
            {getLevelTitle(currentLevel)}
          </span>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{pointsInCurrentLevel} XP</span>
            <span>{pointsForNextLevel} XP</span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-2 bg-muted"
          />
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            <span>{pointsForNextLevel - pointsInCurrentLevel} XP bis Level {currentLevel + 1}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};