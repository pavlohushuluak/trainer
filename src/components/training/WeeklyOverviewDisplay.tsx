import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, Target, Activity } from "lucide-react";
import { useDailyProgress } from "./hooks/useDailyProgress";

export const WeeklyOverviewDisplay = () => {
  const { weeklyProgress, isLoading } = useDailyProgress();

  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    return days[date.getDay()];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.getDate().toString();
  };

  const weeklyGoalsMet = weeklyProgress?.filter(day => day.daily_goal_met).length || 0;
  const activeDays = weeklyProgress?.filter(day => day.steps_completed > 0).length || 0;
  const totalPointsThisWeek = weeklyProgress?.reduce((sum, day) => sum + day.points_earned, 0) || 0;

  // Generate last 7 days array
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-3/4"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded"></div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-background to-secondary/10">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Wochenübersicht
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 7-Day Calendar */}
        <div className="grid grid-cols-7 gap-2">
          {last7Days.map((date) => {
            const dayProgress = weeklyProgress?.find(day => day.date === date);
            const goalMet = dayProgress?.daily_goal_met || false;
            const steps = dayProgress?.steps_completed || 0;
            const isToday = date === new Date().toISOString().split('T')[0];

            return (
              <div
                key={date}
                className={`
                  p-2 rounded-lg text-center border transition-all
                  ${goalMet 
                    ? 'bg-primary/20 border-primary text-primary' 
                    : 'bg-muted/50 border-muted'
                  }
                  ${isToday ? 'ring-2 ring-primary/50' : ''}
                `}
              >
                <div className="text-xs font-medium">
                  {getDayName(date)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(date)}
                </div>
                <div className="mt-1">
                  {goalMet ? (
                    <div className="text-lg">✅</div>
                  ) : steps > 0 ? (
                    <div className="text-lg">⏳</div>
                  ) : (
                    <div className="text-lg text-muted-foreground">○</div>
                  )}
                </div>
                <div className="text-xs font-medium">
                  {steps > 0 ? steps : ''}
                </div>
              </div>
            );
          })}
        </div>

        {/* Week Stats */}
        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Target className="h-4 w-4 text-primary mr-1" />
              <span className="text-lg font-bold text-primary">{weeklyGoalsMet}</span>
            </div>
            <div className="text-xs text-muted-foreground">Ziele erreicht</div>
          </div>

          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Activity className="h-4 w-4 text-blue-500 mr-1" />
              <span className="text-lg font-bold text-blue-500">{activeDays}</span>
            </div>
            <div className="text-xs text-muted-foreground">Aktive Tage</div>
          </div>

          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-lg font-bold text-green-500">{totalPointsThisWeek}</span>
            </div>
            <div className="text-xs text-muted-foreground">Punkte</div>
          </div>
        </div>

        {/* Weekly Performance Badge */}
        <div className="flex justify-center pt-2">
          {weeklyGoalsMet >= 6 && (
            <Badge variant="default" className="bg-gradient-to-r from-primary to-secondary">
              🏆 Perfekte Woche!
            </Badge>
          )}
          {weeklyGoalsMet >= 4 && weeklyGoalsMet < 6 && (
            <Badge variant="secondary">
              🎯 Starke Woche!
            </Badge>
          )}
          {weeklyGoalsMet >= 2 && weeklyGoalsMet < 4 && (
            <Badge variant="outline">
              💪 Guter Start!
            </Badge>
          )}
          {weeklyGoalsMet < 2 && (
            <Badge variant="outline" className="opacity-60">
              🌱 Jeden Tag zählt!
            </Badge>
          )}
        </div>

      </CardContent>
    </Card>
  );
};