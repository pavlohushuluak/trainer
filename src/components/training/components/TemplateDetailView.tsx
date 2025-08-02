
import { PlanTemplate } from '../templateTypes';
import { ModularExerciseCard } from './ModularExerciseCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, BookOpen } from 'lucide-react';

interface TemplateDetailViewProps {
  template: PlanTemplate;
}

export const TemplateDetailView = ({ template }: TemplateDetailViewProps) => {
  return (
    <div className="space-y-6">
      {/* Template Header */}
      <Card className="border-2 border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{template.title}</CardTitle>
              <CardDescription className="text-base">
                {template.description}
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2">
              <Badge variant="outline" className="justify-center">
                {template.difficulty}
              </Badge>
              <Badge variant="secondary" className="justify-center">
                {template.category}
              </Badge>
            </div>
          </div>
          
          <div className="flex gap-4 text-sm text-gray-600 pt-4">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {template.duration}
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {template.species.join(', ')}
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              {template.exercises.length} Module
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Exercises */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">📚 Trainingsmodule</h3>
        {template.exercises.map((exercise, index) => (
          <ModularExerciseCard 
            key={exercise.id} 
            exercise={exercise} 
            moduleNumber={index + 1}
          />
        ))}
      </div>

      {/* Tips & Expected Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              💡 Wichtige Tipps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {template.tips.map((tip, index) => (
                <li key={index} className="text-sm">• {tip}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              🎯 Erwartete Ergebnisse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{template.expectedResults}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
