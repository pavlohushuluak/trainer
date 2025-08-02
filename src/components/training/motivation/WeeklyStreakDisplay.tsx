import { Calendar, Flame, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface WeeklyStreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  lastActivity: string | null;
}

export const WeeklyStreakDisplay = ({ currentStreak, longestStreak, lastActivity }: WeeklyStreakDisplayProps) => {
  const getStreakStatus = () => {
    if (!lastActivity) return { status: "start", message: "Starte deine Streak!" };
    
    const lastDate = new Date(lastActivity);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return { status: "active", message: "Heute schon trainiert! 🎉" };
    if (diffDays === 1) return { status: "grace", message: "Gnade-Tag aktiv - trainiere heute!" };
    if (diffDays > 1) return { status: "broken", message: "Streak unterbrochen - starte neu!" };
    
    return { status: "active", message: "Streak aktiv!" };
  };

  const getWeekProgress = () => {
    // Simulate weekly training progress (in real app, this would come from database)
    const daysThisWeek = Math.min(currentStreak, 7);
    return {
      trained: daysThisWeek,
      target: 3, // 3x per week minimum
      days: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
    };
  };

  const streakStatus = getStreakStatus();
  const weekProgress = getWeekProgress();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-green-600 bg-green-50 border-green-200";
      case "grace": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "broken": return "text-red-600 bg-red-50 border-red-200";
      default: return "text-blue-600 bg-blue-50 border-blue-200";
    }
  };

  return (
    <Card className="bg-gradient-to-br from-accent/20 to-accent/5 border-accent">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-accent-foreground">
          <Flame className="h-5 w-5 text-orange-500" />
          Streak System
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Daily Streak */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="font-medium">Tagestreak</span>
          </div>
          <Badge variant="outline" className={getStatusColor(streakStatus.status)}>
            {currentStreak} Tage
          </Badge>
        </div>

        {/* Weekly Progress */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-500" />
            <span className="font-medium">Diese Woche</span>
            <Badge variant="outline" className="ml-auto">
              {weekProgress.trained}/{weekProgress.target} Tage
            </Badge>
          </div>
          
          <div className="flex gap-1">
            {weekProgress.days.map((day, index) => (
              <div
                key={day}
                className={`flex-1 text-center p-1 rounded text-xs ${
                  index < weekProgress.trained
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-gray-100 text-gray-500 border border-gray-200"
                }`}
              >
                {day}
              </div>
            ))}
          </div>
        </div>

        {/* Status Message */}
        <div className={`p-3 rounded-lg border ${getStatusColor(streakStatus.status)}`}>
          <div className="flex items-center gap-2">
            {streakStatus.status === "grace" && <Shield className="h-4 w-4" />}
            <span className="text-sm font-medium">{streakStatus.message}</span>
          </div>
        </div>

        {/* Best Streak */}
        <div className="flex items-center justify-between pt-2 border-t border-accent/30">
          <span className="text-sm text-muted-foreground">Beste Serie</span>
          <div className="flex items-center gap-1">
            <Flame className="h-3 w-3 text-yellow-500" />
            <span className="font-semibold text-yellow-600">{longestStreak} Tage</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};