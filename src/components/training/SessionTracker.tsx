import { useState } from "react";
import { Plus, Minus, Clock, Target, MessageSquare, ChevronDown, ChevronUp, Star, Trophy, Award, Zap, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useTranslations } from "@/hooks/useTranslations";
import { useTrainingSessions } from "./hooks/useTrainingSessions";

interface SessionTrackerProps {
  stepId: string;
  stepTitle: string;
  targetSessions: number;
  masteryStatus: 'in_training' | 'partially_mastered' | 'fully_mastered';
  totalSessions: number;
  isCompleted?: boolean;
}

export const SessionTracker = ({ 
  stepId, 
  stepTitle, 
  targetSessions,
  masteryStatus, 
  totalSessions,
  isCompleted = false
}: SessionTrackerProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sessionDuration, setSessionDuration] = useState("");
  const [sessionNotes, setSessionNotes] = useState("");
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const { t } = useTranslations();
  
  // Get today's date for proper session tracking
  const today = new Date().toISOString().split('T')[0];
  
  const { 
    todaySessions, 
    allSessions,
    createSession, 
    deleteSession,
    completeStep,
    isCreating,
    isCompleting
  } = useTrainingSessions(stepId, today);

  const handleAddSession = () => {
    createSession({
      training_step_id: stepId,
      session_duration_minutes: sessionDuration ? parseInt(sessionDuration) : undefined,
      notes: sessionNotes || undefined,
    });
    setIsDialogOpen(false);
    setSessionDuration("");
    setSessionNotes("");
  };

  const handleRemoveSession = () => {
    const lastSession = todaySessions[0];
    if (lastSession) {
      deleteSession(lastSession.id);
    }
  };

  const handleCompleteStep = () => {
    completeStep(stepId);
  };

  const getMasteryColor = () => {
    switch (masteryStatus) {
      case 'fully_mastered':
        return {
          bg: 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30',
          text: 'text-green-700 dark:text-green-300',
          border: 'border-green-200 dark:border-green-400/50',
          icon: 'text-green-600 dark:text-green-400'
        };
      case 'partially_mastered':
        return {
          bg: 'bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30',
          text: 'text-yellow-700 dark:text-yellow-300',
          border: 'border-yellow-200 dark:border-yellow-400/50',
          icon: 'text-yellow-600 dark:text-yellow-400'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30',
          text: 'text-blue-700 dark:text-blue-300',
          border: 'border-blue-200 dark:border-blue-400/50',
          icon: 'text-blue-600 dark:text-blue-400'
        };
    }
  };

  const getMasteryText = () => {
    switch (masteryStatus) {
      case 'fully_mastered':
        return t('training.sessionTracker.mastery.fullyMastered');
      case 'partially_mastered':
        return t('training.sessionTracker.mastery.partiallyMastered');
      default:
        return t('training.sessionTracker.mastery.inTraining');
    }
  };

  const getMasteryIcon = () => {
    switch (masteryStatus) {
      case 'fully_mastered':
        return <Trophy className="h-4 w-4" />;
      case 'partially_mastered':
        return <Award className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  // Use actual session count from allSessions for real-time updates
  const actualTotalSessions = allSessions.length;
  const progressPercentage = Math.min((actualTotalSessions / 10) * 100, 100);
  const todayProgress = Math.min((todaySessions.length / targetSessions) * 100, 100);

  // Check if step can be completed (10 sessions reached and not already completed)
  const canComplete = actualTotalSessions >= 10 && !isCompleted;

  const toggleNoteExpansion = (sessionId: string) => {
    const newExpanded = new Set(expandedNotes);
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId);
    } else {
      newExpanded.add(sessionId);
    }
    setExpandedNotes(newExpanded);
  };

  const masteryColors = getMasteryColor();

  return (
    <Card className="bg-gradient-to-br from-background via-background to-muted/20 border border-border/50 shadow-sm hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${masteryColors.bg} ${masteryColors.border}`}>
              <div className={masteryColors.icon}>
                {getMasteryIcon()}
              </div>
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">
                {getMasteryText()}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {t('training.sessionTracker.masteryProgress', { current: actualTotalSessions })}
              </p>
            </div>
          </div>
          
          <Badge 
            variant="outline" 
            className={`text-xs font-medium ${masteryColors.bg} ${masteryColors.text} ${masteryColors.border}`}
          >
            <Clock className="h-3 w-3 mr-1" />
            {t('training.sessionTracker.todaySessions', { current: todaySessions.length, target: targetSessions })}
          </Badge>
        </div>

        {/* Progress Bars */}
        <div className="space-y-2 mt-3">
          {/* Daily Progress */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span className="font-medium">Today's Progress</span>
              <span className="font-medium">{todaySessions.length}/{targetSessions}</span>
            </div>
            <Progress value={todayProgress} className="h-2 bg-muted/50" />
          </div>

          {/* Mastery Progress */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span className="font-medium">Mastery Progress</span>
              <span className="font-medium">{actualTotalSessions}/10</span>
            </div>
            <Progress value={progressPercentage} className="h-2 bg-muted/50" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Session Actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-sm"
                  disabled={isCreating || isCompleted}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {t('training.sessionTracker.addSession.button')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-green-500" />
                    {t('training.sessionTracker.addSession.title')}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="duration">{t('training.sessionTracker.addSession.duration')}</Label>
                    <Input
                      id="duration"
                      type="number"
                      placeholder={t('training.sessionTracker.addSession.durationPlaceholder')}
                      value={sessionDuration}
                      onChange={(e) => setSessionDuration(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">{t('training.sessionTracker.addSession.notes')}</Label>
                    <Textarea
                      id="notes"
                      placeholder={t('training.sessionTracker.addSession.notesPlaceholder')}
                      value={sessionNotes}
                      onChange={(e) => setSessionNotes(e.target.value)}
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  <Button 
                    onClick={handleAddSession} 
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    disabled={isCreating}
                  >
                    {isCreating ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Adding...
                      </div>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        {t('training.sessionTracker.addSession.button')}
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {todaySessions.length > 0 && !isCompleted && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRemoveSession}
                className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                <Minus className="h-3 w-3 mr-1" />
                Remove
              </Button>
            )}

            {/* Complete Button - Only show when 10 sessions reached and not already completed */}
            {canComplete && (
              <Button 
                size="sm"
                onClick={handleCompleteStep}
                disabled={isCompleting}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-sm"
              >
                {isCompleting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Completing...
                  </div>
                ) : (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Complete Step
                  </>
                )}
              </Button>
            )}

            {/* Completed Badge */}
            {isCompleted && (
              <Badge variant="secondary" className="text-xs bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-300 dark:border-green-400/50">
                <CheckCircle className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>

          {/* Mastery Level Indicator */}
          <div className="flex items-center gap-1">
            {[...Array(3)].map((_, i) => {
              let iconColor = "text-gray-300 dark:text-gray-600";
              if (actualTotalSessions >= 10 && i < 3) {
                iconColor = "text-yellow-500 dark:text-yellow-400";
              } else if (actualTotalSessions >= 5 && i < 2) {
                iconColor = "text-yellow-500 dark:text-yellow-400";
              } else if (actualTotalSessions >= 1 && i < 1) {
                iconColor = "text-blue-500 dark:text-blue-400";
              }
              return <Star key={i} className={`h-4 w-4 ${iconColor}`} />;
            })}
          </div>
        </div>

        {/* Today's Sessions */}
        {todaySessions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              {t('training.sessionTracker.todaySessionsTitle')}
            </h4>
            <div className="space-y-2">
              {todaySessions.slice(0, 3).map((session, index) => (
                <div 
                  key={session.id} 
                  className="bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg p-3 border border-border/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-400/50">
                        {t('training.sessionTracker.sessionNumber', { number: index + 1 })}
                      </Badge>
                      {session.session_duration_minutes && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {session.session_duration_minutes} {t('training.sessionTracker.minutes')}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(session.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  {session.notes && (
                    <div className="space-y-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => toggleNoteExpansion(session.id)}
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Notes
                        {expandedNotes.has(session.id) ? (
                          <ChevronUp className="h-3 w-3 ml-1" />
                        ) : (
                          <ChevronDown className="h-3 w-3 ml-1" />
                        )}
                      </Button>
                      {expandedNotes.has(session.id) && (
                        <p className="text-xs text-muted-foreground bg-background/50 rounded p-2 border border-border/30">
                          {session.notes}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              {todaySessions.length > 3 && (
                <div className="text-center">
                  <Badge variant="outline" className="text-xs bg-muted/50 text-muted-foreground">
                    {t('training.sessionTracker.moreSessions', { count: todaySessions.length - 3 })}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {todaySessions.length === 0 && !isCompleted && (
          <div className="text-center py-4">
            <div className="text-muted-foreground/50 mb-2">
              <Target className="h-8 w-8 mx-auto" />
            </div>
            <p className="text-xs text-muted-foreground">
              No sessions today. Start your training!
            </p>
          </div>
        )}

        {/* Completion Message */}
        {isCompleted && (
          <div className="text-center py-4">
            <div className="text-green-500 mb-2">
              <CheckCircle className="h-8 w-8 mx-auto" />
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 font-medium">
              This step has been completed! Great job!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};