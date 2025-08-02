
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Target, CheckCircle, Calendar, Scissors } from 'lucide-react';
import { PlanTemplate } from './PlanTemplates';

interface TemplateCardProps {
  template: PlanTemplate;
  userSpecies: string[];
  onSelectTemplate: (template: PlanTemplate) => void;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Anfänger': return 'bg-green-100 text-green-800';
    case 'Fortgeschritten': return 'bg-yellow-100 text-yellow-800';
    case 'Experte': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Grundtraining': return 'bg-blue-100 text-blue-800';
    case 'Rassespezifisch': return 'bg-purple-100 text-purple-800';
    case 'Seniorentraining': return 'bg-orange-100 text-orange-800';
    case 'Verhalten': return 'bg-pink-100 text-pink-800';
    case 'Sozialisation': return 'bg-teal-100 text-teal-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const TemplateCard = ({ template, userSpecies, onSelectTemplate }: TemplateCardProps) => {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{template.title}</CardTitle>
            <CardDescription className="mb-3">
              {template.description}
            </CardDescription>
            
            <div className="flex flex-wrap gap-2">
              <Badge className={getDifficultyColor(template.difficulty)}>
                {template.difficulty}
              </Badge>
              <Badge className={getCategoryColor(template.category)}>
                {template.category}
              </Badge>
              
              {template.ageGroups && template.ageGroups.length > 0 && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {template.ageGroups[0]}
                </Badge>
              )}
              
              {template.breeds && template.breeds.length > 0 && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Scissors className="h-3 w-3" />
                  {template.breeds[0]}
                  {template.breeds.length > 1 && ` +${template.breeds.length - 1}`}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {template.duration}
          </div>
          <div className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            {template.exercises.length} Übungen
          </div>
        </div>
        
        <div className="text-sm text-gray-600 mb-3">
          <strong>Für:</strong> {template.species.join(', ')}
          {template.ageGroups && (
            <>
              <br />
              <strong>Alter:</strong> {template.ageGroups.join(', ')}
            </>
          )}
          {template.breeds && (
            <>
              <br />
              <strong>Rassen:</strong> {template.breeds.join(', ')}
            </>
          )}
        </div>
        
        <div className="mb-4">
          <h4 className="font-medium mb-2">Übungen:</h4>
          <div className="grid gap-1">
            {template.exercises.slice(0, 2).map((exercise) => (
              <div key={exercise.id} className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-3 w-3 text-green-600" />
                {exercise.title} - {exercise.duration}
              </div>
            ))}
            {template.exercises.length > 2 && (
              <div className="text-sm text-muted-foreground">
                +{template.exercises.length - 2} weitere Übungen
              </div>
            )}
          </div>
        </div>
        
        <Button 
          onClick={() => onSelectTemplate(template)}
          className="w-full"
        >
          Vorlage verwenden
        </Button>
      </CardContent>
    </Card>
  );
};
