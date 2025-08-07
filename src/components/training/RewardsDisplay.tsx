
import { Trophy, Target, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useUserRewards } from "./hooks/useUserRewards";
import { LoadingStateManager } from "./LoadingStateManager";
import { XPLevelDisplay } from "./motivation/XPLevelDisplay";
import { WeeklyStreakDisplay } from "./motivation/WeeklyStreakDisplay";
import { MotivationalQuotes } from "./motivation/MotivationalQuotes";
import { EnhancedDailyGoalDisplay } from "./EnhancedDailyGoalDisplay";
import { useTranslation } from 'react-i18next';


const getNextBadgeInfo = (currentBadges: string[], completedSteps: number, t: any) => {
  const badgeThresholds = [
    { name: t('training.rewards.badges.trainingStarter'), steps: 1 },
    { name: t('training.rewards.badges.diligentTrainer'), steps: 3 },
    { name: t('training.rewards.badges.trainingExpert'), steps: 5 },
    { name: t('training.rewards.badges.trainingMaster'), steps: 10 },
    { name: t('training.rewards.badges.trainingLegend'), steps: 20 },
    { name: t('training.rewards.badges.trainingChampion'), steps: 50 }
  ];
  
  for (const badge of badgeThresholds) {
    if (!currentBadges.includes(badge.name) && completedSteps < badge.steps) {
      return {
        name: badge.name,
        stepsNeeded: badge.steps - completedSteps
      };
    }
  }
  
  // Fallback: If all badges are earned, show progress towards a hypothetical next level
  const highestThreshold = Math.max(...badgeThresholds.map(b => b.steps));
  if (completedSteps >= highestThreshold) {
    const nextLevel = Math.ceil(completedSteps / 10) * 10 + 10;
    return {
      name: t('training.rewards.badges.nextLevel'),
      stepsNeeded: nextLevel - completedSteps
    };
  }
  
  return null;
};

export const RewardsDisplay = () => {
  const { t } = useTranslation();
  const { rewards, isLoading, error, updateRewards } = useUserRewards();

  // Default-Werte falls rewards noch nicht existieren
  const defaultRewards = {
    total_points: 0,
    current_streak: 0,
    longest_streak: 0,
    badges: []
  };
  
  const rewardsData = rewards || defaultRewards;
  
  // Estimate completed steps based on points (10 points per step)
  const estimatedCompletedSteps = Math.floor(rewardsData.total_points / 10);
  const nextBadge = getNextBadgeInfo(rewardsData.badges, estimatedCompletedSteps, t);

  const weeklyGoalProgress = Math.min((estimatedCompletedSteps % 7) * (100/3), 100); // 3x per week goal

  return (
    <TooltipProvider>
    <LoadingStateManager
      isLoading={isLoading}
      hasError={!!error}
      errorMessage={t('training.rewards.loadingError')}
      loadingMessage={t('training.rewards.loadingMessage')}
    >
      <div className="space-y-6">
        {/* Motivational Quote */}
        <MotivationalQuotes />

        {/* Daily Goal Display - moved here under Errungenschaften */}
        <EnhancedDailyGoalDisplay />

        {/* Compact Badges Card */}
        <Card className="bg-gradient-to-r from-secondary/30 to-accent/20 border-secondary">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between text-foreground">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" />
                {t('training.rewards.awards')}
              </div>
              {/* Compact Points Display in Header */}
              <div className="flex items-center gap-2 text-sm">
                <Target className="h-4 w-4 text-primary" />
                <span className="font-bold text-primary">{rewardsData.total_points}</span>
                <span className="text-xs text-muted-foreground">{t('training.rewards.points')}</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {/* Next Badge Progress - Compact */}
            {nextBadge && (
              <div className="bg-accent/5 rounded-lg p-3 border border-accent/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium">{nextBadge.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    -{nextBadge.stepsNeeded}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-accent h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.max(0, Math.min(100, ((estimatedCompletedSteps) / (estimatedCompletedSteps + nextBadge.stepsNeeded)) * 100))}%` 
                    }}
                  />
                </div>
              </div>
            )}

            {/* Compact Badges List */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-sm font-medium text-foreground">{t('training.rewards.achievements')}</h4>
                {nextBadge && (
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('training.rewards.nextBadgeTooltip', { steps: nextBadge.stepsNeeded, name: nextBadge.name })}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {rewardsData.badges.length > 0 ? (
                  rewardsData.badges.map((badge, index) => {
                    // Map German badge names to translation keys
                    const getBadgeTranslationKey = (badgeName: string) => {
                      const badgeMap: { [key: string]: string } = {
                        'Trainings-Starter': 'training.rewards.badges.trainingStarter',
                        'Fleißiger Trainer': 'training.rewards.badges.diligentTrainer',
                        'Trainings-Experte': 'training.rewards.badges.trainingExpert',
                        'Training-Master': 'training.rewards.badges.trainingMaster',
                        'Trainings-Legende': 'training.rewards.badges.trainingLegend',
                        'Trainings-Meister': 'training.rewards.badges.trainingChampion'
                      };
                      return badgeMap[badgeName] || badgeName;
                    };
                    
                    return (
                      <Badge key={index} variant="secondary" className="bg-primary/10 text-primary text-xs border-primary/20 px-2 py-0.5">
                        {t(getBadgeTranslationKey(badge))}
                      </Badge>
                    );
                  })
                ) : (
                  <span className="text-xs text-muted-foreground">{t('training.rewards.noAwardsYet')}</span>
                )}
              </div>
            </div>

            {/* Compact Last Activity */}
            {rewards?.last_activity && (
              <div className="text-xs text-muted-foreground">
                {t('training.rewards.lastActivity')}: {new Date(rewards.last_activity).toLocaleDateString()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </LoadingStateManager>
    </TooltipProvider>
  );
};
