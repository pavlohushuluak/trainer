
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Target, Lightbulb, Trophy, CheckCircle } from 'lucide-react';
import { TrainingPlan } from './types';
import { PlanTemplate, planTemplates } from './PlanTemplates';

interface PlanDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: TrainingPlan | null;
}

export const PlanDetailModal = ({
  isOpen,
  onClose,
  plan
}: PlanDetailModalProps) => {
  if (!plan) return null;

  // Try to find the template this plan was based on
  const template = planTemplates.find(t => t.title === plan.title);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Anfänger': return 'bg-green-100 text-green-800';
      case 'Fortgeschritten': return 'bg-yellow-100 text-yellow-800';
      case 'Experte': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {plan.title}
          </DialogTitle>
        </DialogHeader>
        
        {template ? (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Übersicht</TabsTrigger>
              <TabsTrigger value="exercises">Übungen</TabsTrigger>
              <TabsTrigger value="tips">Tipps</TabsTrigger>
              <TabsTrigger value="progress">Fortschritt</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-4">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{template.title}</CardTitle>
                        <CardDescription>{template.description}</CardDescription>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge className={getDifficultyColor(template.difficulty)}>
                          {template.difficulty}
                        </Badge>
                        <Badge variant="outline">{template.category}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Dauer: {template.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <span>{template.exercises.length} Übungen</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Erwartete Ergebnisse:</h4>
                      <p className="text-sm text-muted-foreground">{template.expectedResults}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="exercises" className="mt-4">
              <div className="space-y-4">
                {template.exercises.map((exercise, index) => (
                  <Card key={exercise.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {index + 1}. {exercise.title}
                          </CardTitle>
                          <CardDescription>{exercise.description}</CardDescription>
                        </div>
                        <Badge variant="outline">{exercise.difficulty}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{exercise.duration}</span>
                        </div>
                        {exercise.repetitions && (
                          <div>
                            <span className="font-medium">Wiederholungen: </span>
                            {exercise.repetitions}
                          </div>
                        )}
                      </div>
                      
                      {exercise.materials && (
                        <div className="mb-4">
                          <h5 className="font-medium mb-2">Benötigte Materialien:</h5>
                          <ul className="text-sm text-muted-foreground">
                            {exercise.materials.map((material, idx) => (
                              <li key={idx}>• {material}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div>
                        <h5 className="font-medium mb-2">Schritte:</h5>
                        <ol className="text-sm text-muted-foreground space-y-1">
                          {exercise.steps.map((step, idx) => (
                            <li key={idx} className="flex gap-2">
                              <span className="font-medium text-primary">{idx + 1}.</span>
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="tips" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Trainingstipps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {template.tips.map((tip, index) => (
                      <li key={index} className="flex gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="progress" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Fortschritt verfolgen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Verfolgen Sie hier Ihren Trainingsfortschritt. Diese Funktion wird bald verfügbar sein.
                  </p>
                  <div className="text-center py-8 text-muted-foreground">
                    📊 Fortschritts-Tracking kommt bald!
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{plan.title}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Dies ist ein individueller Plan ohne Vorlage. Sie können ihn nach Ihren Bedürfnissen anpassen.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
