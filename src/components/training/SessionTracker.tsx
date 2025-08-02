import { useState } from "react";
import { Plus, Minus, Clock, Target, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTrainingSessions } from "./hooks/useTrainingSessions";

interface SessionTrackerProps {
  stepId: string;
  stepTitle: string;
  targetSessions: number;
  masteryStatus: 'in_training' | 'partially_mastered' | 'fully_mastered';
  totalSessions: number;
}

export const SessionTracker = ({ 
  stepId, 
  stepTitle, 
  targetSessions, 
  masteryStatus, 
  totalSessions 
}: SessionTrackerProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sessionDuration, setSessionDuration] = useState("");
  const [sessionNotes, setSessionNotes] = useState("");
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  
  const { 
    todaySessions, 
    createSession, 
    deleteSession, 
    isCreating 
  } = useTrainingSessions(stepId);

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

  const getMasteryColor = () => {
    switch (masteryStatus) {
      case 'fully_mastered':
        return 'bg-green-500/20 text-green-700 border-green-200';
      case 'partially_mastered':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-200';
      default:
        return 'bg-blue-500/20 text-blue-700 border-blue-200';
    }
  };

  const getMasteryText = () => {
    switch (masteryStatus) {
      case 'fully_mastered':
        return 'Gemeistert';
      case 'partially_mastered':
        return 'Teilweise Gemeistert';
      default:
        return 'In Training';
    }
  };

  const progressPercentage = Math.min((totalSessions / 10) * 100, 100);

  const toggleNoteExpansion = (sessionId: string) => {
    setExpandedNotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  };

  const truncateNote = (note: string, maxLength: number = 30) => {
    if (note.length <= maxLength) return note;
    return note.substring(0, maxLength) + '...';
  };

  return (
    <Card className="bg-gradient-to-r from-background to-muted/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{stepTitle}</CardTitle>
          <Badge className={getMasteryColor()}>
            {getMasteryText()}
          </Badge>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="text-xs text-muted-foreground">
          {totalSessions}/10 Sessions für Meisterschaft
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              Heute: {todaySessions.length}/{targetSessions}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemoveSession}
              disabled={todaySessions.length === 0}
            >
              <Minus className="h-4 w-4" />
            </Button>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default" size="sm" disabled={isCreating}>
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Trainingseinheit hinzufügen</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="duration">Dauer (Minuten)</Label>
                    <Input
                      id="duration"
                      type="number"
                      placeholder="z.B. 5"
                      value={sessionDuration}
                      onChange={(e) => setSessionDuration(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Notizen (optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Wie ist es gelaufen?"
                      value={sessionNotes}
                      onChange={(e) => setSessionNotes(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleAddSession} className="w-full" disabled={isCreating}>
                    Session hinzufügen
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {todaySessions.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">Heutige Sessions:</div>
            {todaySessions.slice(0, 3).map((session, index) => {
              const isExpanded = expandedNotes.has(session.id);
              const hasLongNote = session.notes && session.notes.length > 30;
              
              return (
                <div key={session.id} className="bg-muted/50 rounded-lg p-2 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>
                      Session {index + 1}
                      {session.session_duration_minutes && ` (${session.session_duration_minutes} Min.)`}
                    </span>
                    {session.notes && (
                      <MessageSquare className="h-3 w-3 text-primary" />
                    )}
                  </div>
                  
                  {session.notes && (
                    <div className="text-xs text-foreground/80 leading-relaxed">
                      <div className="flex items-start gap-1">
                        <span className="flex-1">
                          {isExpanded || !hasLongNote ? session.notes : truncateNote(session.notes)}
                        </span>
                        {hasLongNote && (
                          <button
                            onClick={() => toggleNoteExpansion(session.id)}
                            className="text-primary hover:text-primary/80 p-0.5"
                          >
                            {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {todaySessions.length > 3 && (
              <div className="text-xs text-muted-foreground">
                +{todaySessions.length - 3} weitere Sessions
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};