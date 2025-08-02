
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Clock, Target, Edit, Trash2, Eye } from 'lucide-react';
import { TrainingPlan } from './types';

interface PlanCardProps {
  plan: TrainingPlan;
  onStatusChange: (planId: string, newStatus: TrainingPlan['status']) => void;
  onEdit: (plan: TrainingPlan) => void;
  onView: (plan: TrainingPlan) => void;
  onDelete: (planId: string) => void;
}

export const PlanCard = ({ plan, onStatusChange, onEdit, onView, onDelete }: PlanCardProps) => {
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
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              {getStatusIcon(plan.status)}
              <h4 className="font-medium text-sm">{plan.title}</h4>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">{plan.description}</p>
            {plan.pet_name && (
              <p className="text-xs text-blue-600">🐾 {plan.pet_name}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Select 
              value={plan.status} 
              onValueChange={(value: TrainingPlan['status']) => onStatusChange(plan.id, value)}
            >
              <SelectTrigger className="w-auto h-8">
                <Badge variant={getStatusVariant(plan.status)} className="text-xs">
                  {getStatusLabel(plan.status)}
                </Badge>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">Geplant</SelectItem>
                <SelectItem value="in_progress">In Arbeit</SelectItem>
                <SelectItem value="completed">Erledigt</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(plan)}
              title="Plan anzeigen"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(plan)}
              title="Plan bearbeiten"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(plan.id)}
              title="Plan löschen"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
