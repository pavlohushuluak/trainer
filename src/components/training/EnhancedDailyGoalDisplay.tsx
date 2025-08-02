import { Target, TrendingUp, Calendar, Activity, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useDailyProgress } from "./hooks/useDailyProgress";
import { useTranslation } from "react-i18next";

export const EnhancedDailyGoalDisplay = () => {
  const { t } = useTranslation();
  const { todayProgress, isLoading, updateSessionTarget, isUpdating } = useDailyProgress();
  const [sessionTarget, setSessionTarget] = useState<number>(3);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Update local state when data loads
  useEffect(() => {
    if (todayProgress) {
      setSessionTarget(todayProgress.daily_session_target || 3);
    }
  }, [todayProgress]);

  const handleSaveTargets = () => {
    updateSessionTarget(sessionTarget);
    setIsDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="h-16 bg-muted/50 rounded-lg animate-pulse border border-border/50" />
    );
  }

  if (!todayProgress) {
    return (
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
        <div className="flex items-center gap-3">
          <Target className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{t('training.dailyGoal.startFirstTraining')}</span>
        </div>
      </div>
    );
  }

  const currentTarget = todayProgress.daily_session_target || 3;
  const sessionProgress = (todayProgress.sessions_completed / currentTarget) * 100;
  const isCompleted = sessionProgress >= 100;

  return (
    <div className="space-y-2 p-3 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/20">
      {/* Header with title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">{t('training.dailyGoal.title')}</span>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <Settings className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t('training.dailyGoal.adjustTitle')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="session-target">{t('training.dailyGoal.sessionsPerDay')}</Label>
                <Input
                  id="session-target"
                  type="number"
                  min="1"
                  max="10"
                  value={sessionTarget}
                  onChange={(e) => setSessionTarget(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  {t('training.dailyGoal.recommended')}
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleSaveTargets} disabled={isUpdating}>
                  {isUpdating ? t('training.dailyGoal.saving') : t('common.save')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Progress section */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">
            {todayProgress.sessions_completed}/{currentTarget}
          </span>
          <span className="text-xs text-muted-foreground">{t('training.dailyGoal.sessions')}</span>
          {isCompleted && (
            <div className="w-2 h-2 bg-green-500 rounded-full" />
          )}
        </div>
        <div className="flex-1 max-w-32">
          <Progress 
            value={Math.min(sessionProgress, 100)} 
            className="h-2"
          />
        </div>
      </div>
    </div>
  );
};