import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Target, Settings, TrendingUp, Calendar } from "lucide-react";
import { useDailyProgress } from "./hooks/useDailyProgress";
import confetti from "canvas-confetti";

export const DailyGoalDisplay = () => {
  const { todayProgress, isLoading, updateDailyGoal, refreshProgress } = useDailyProgress();
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState(todayProgress?.daily_goal_target || 2);

  const handleGoalUpdate = () => {
    updateDailyGoal(newGoal);
    setIsEditingGoal(false);
  };

  const progressPercentage = todayProgress
    ? Math.min((todayProgress.steps_completed / todayProgress.daily_goal_target) * 100, 100)
    : 0;

  const stepsCompleted = todayProgress?.steps_completed || 0;
  const dailyGoal = todayProgress?.daily_goal_target || 2;
  const stepsRemaining = Math.max(dailyGoal - stepsCompleted, 0);
  const goalMet = todayProgress?.daily_goal_met || false;

  // Smart confetti trigger - only once per day when goal is achieved
  useEffect(() => {
    if (goalMet && todayProgress?.date) {
      const today = todayProgress.date;
      const confettiKey = `confetti_shown_${today}`;
      
      // Check if confetti was already shown today
      const alreadyShown = localStorage.getItem(confettiKey);
      
      if (!alreadyShown) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        
        // Mark confetti as shown for today
        localStorage.setItem(confettiKey, 'true');
      }
    }
  }, [goalMet, todayProgress?.date]);

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-3/4"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-background to-muted/30 border-primary/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-5 w-5 text-primary" />
          Heutiges Trainingsziel
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditingGoal(!isEditingGoal)}
            className="ml-auto h-8 w-8 p-0"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Goal Setting */}
        {isEditingGoal ? (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="1"
              max="20"
              value={newGoal}
              onChange={(e) => setNewGoal(Number(e.target.value))}
              className="w-20"
            />
            <span className="text-sm text-muted-foreground">Schritte pro Tag</span>
            <Button size="sm" onClick={handleGoalUpdate}>
              Speichern
            </Button>
          </div>
        ) : (
          <div className="text-2xl font-bold text-center">
            {stepsCompleted} / {dailyGoal} Schritte
          </div>
        )}

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progressPercentage} className="h-3" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{progressPercentage.toFixed(0)}% erreicht</span>
            <span>
              {goalMet ? "🎉 Ziel erreicht!" : `Noch ${stepsRemaining} Schritte`}
            </span>
          </div>
        </div>

        {/* Today Stats */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="text-center">
            <div className="text-lg font-semibold text-primary">
              {todayProgress?.points_earned || 0}
            </div>
            <div className="text-xs text-muted-foreground">Punkte heute</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-primary">
              {goalMet ? "✅" : "⏳"}
            </div>
            <div className="text-xs text-muted-foreground">Status</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshProgress()}
            className="flex-1"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Aktualisieren
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => {
              const today = new Date().toLocaleDateString("de-DE");
              alert(`Heute ist ${today}. Dein Fortschritt wird automatisch getrackt!`);
            }}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Heute
          </Button>
        </div>

        {goalMet && (
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-3 rounded-lg text-center">
            <div className="text-sm font-medium text-primary">
              🏆 Tagesziel erreicht! Weiter so!
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};