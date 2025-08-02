
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Target, CheckCircle, Clock } from 'lucide-react';

interface TrainingPlan {
  id: string;
  title: string;
  description: string;
  status: 'planned' | 'in_progress' | 'completed';
  created_at: string;
  pet_name?: string;
}

export const TrainingPlansSection = () => {
  // Placeholder data - wird später durch echte Daten ersetzt
  const [trainingPlans] = useState<TrainingPlan[]>([
    {
      id: '1',
      title: 'Grundgehorsam',
      description: 'Sitz, Platz und Bleib üben',
      status: 'in_progress',
      created_at: '2024-01-15',
      pet_name: 'Luna'
    },
    {
      id: '2', 
      title: 'Leinenführigkeit',
      description: 'Entspanntes Gehen an der Leine',
      status: 'planned',
      created_at: '2024-01-10',
      pet_name: 'Luna'
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-600" />;
      default: return <Target className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Erledigt';
      case 'in_progress': return 'In Arbeit';
      default: return 'Geplant';
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">🎯 Aktuelle Pläne</h3>
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-1" />
          Neuer Plan
        </Button>
      </div>

      {trainingPlans.length === 0 ? (
        <div className="text-center text-muted-foreground py-6">
          <Target className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">Noch keine Trainingspläne erstellt</p>
          <p className="text-xs">Starte mit deinem ersten Trainingsplan!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {trainingPlans.map((plan) => (
            <Card key={plan.id} className="border-l-4 border-l-blue-500">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(plan.status)}
                      <h4 className="font-medium text-sm">{plan.title}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">{plan.description}</p>
                    {plan.pet_name && (
                      <p className="text-xs text-blue-600">🐾 {plan.pet_name}</p>
                    )}
                  </div>
                  <Badge variant={getStatusVariant(plan.status)} className="text-xs">
                    {getStatusLabel(plan.status)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
