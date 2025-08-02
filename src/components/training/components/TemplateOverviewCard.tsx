
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Clock, Users, BookOpen } from 'lucide-react';
import { PlanTemplate } from '../templateTypes';
import { ExerciseAccordion } from './ExerciseAccordion';

interface TemplateOverviewCardProps {
  template: PlanTemplate;
  onSelectTemplate: (template: PlanTemplate) => void;
  onViewDetails: (template: PlanTemplate) => void;
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

export const TemplateOverviewCard = ({ 
  template, 
  onSelectTemplate, 
  onViewDetails 
}: TemplateOverviewCardProps) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Template Header */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">{template.title}</h3>
            <p className="text-gray-600 text-sm mb-3">{template.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge className={getDifficultyColor(template.difficulty)}>
                {template.difficulty}
              </Badge>
              <Badge className={getCategoryColor(template.category)}>
                {template.category}
              </Badge>
            </div>
          </div>
          <Button 
            onClick={() => onViewDetails(template)}
            className="ml-4"
          >
            Vollansicht
          </Button>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
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

        <div className="text-sm text-gray-600">
          <strong>Für:</strong> {template.species.join(', ')}
          {template.ageGroups && (
            <>
              <br />
              <strong>Alter:</strong> {template.ageGroups.join(', ')}
            </>
          )}
        </div>
      </div>

      {/* Expandable Modules */}
      <Accordion type="multiple" className="w-full">
        <AccordionItem value="modules" className="border-0">
          <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
            <span className="font-medium">📚 Module durchstöbern ({template.exercises.length} verfügbar)</span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-4">
              {template.exercises.map((exercise, index) => (
                <ExerciseAccordion 
                  key={exercise.id} 
                  exercise={exercise} 
                  exerciseIndex={index}
                />
              ))}

              {/* Template Use Button */}
              <div className="pt-4 border-t">
                <Button 
                  onClick={() => onSelectTemplate(template)}
                  className="w-full"
                >
                  Diese Vorlage verwenden
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
