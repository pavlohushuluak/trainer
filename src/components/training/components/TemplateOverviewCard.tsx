
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Clock, Users, BookOpen } from 'lucide-react';
import { PlanTemplate } from '../templateTypes';
import { ExerciseAccordion } from './ExerciseAccordion';
import { useTranslations } from '@/hooks/useTranslations';

interface TemplateOverviewCardProps {
  template: PlanTemplate;
  onSelectTemplate: (template: PlanTemplate) => void;
  onViewDetails: (template: PlanTemplate) => void;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Anfänger': 
    case 'Beginner': 
      return 'bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-300';
    case 'Fortgeschritten': 
    case 'Advanced': 
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-300';
    case 'Experte': 
    case 'Expert': 
      return 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-300';
    default: 
      return 'bg-muted text-muted-foreground';
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Grundtraining':
    case 'Basic Training': 
      return 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-300';
    case 'Rassespezifisch':
    case 'Breed Specific': 
      return 'bg-purple-100 text-purple-800 dark:bg-purple-950/30 dark:text-purple-300';
    case 'Seniorentraining':
    case 'Senior Training': 
      return 'bg-orange-100 text-orange-800 dark:bg-orange-950/30 dark:text-orange-300';
    case 'Verhalten':
    case 'Behavior': 
      return 'bg-pink-100 text-pink-800 dark:bg-pink-950/30 dark:text-pink-300';
    case 'Sozialisation':
    case 'Socialization': 
      return 'bg-teal-100 text-teal-800 dark:bg-teal-950/30 dark:text-teal-300';
    default: 
      return 'bg-muted text-muted-foreground';
  }
};

// Translation helper functions
const translateDifficulty = (difficulty: string, t: any) => {
  switch (difficulty) {
    case 'Anfänger': return t('training.template.difficulty.beginner');
    case 'Fortgeschritten': return t('training.template.difficulty.advanced');
    case 'Experte': return t('training.template.difficulty.expert');
    case 'Beginner': return t('training.template.difficulty.beginner');
    case 'Advanced': return t('training.template.difficulty.advanced');
    case 'Expert': return t('training.template.difficulty.expert');
    default: return difficulty;
  }
};

const translateCategory = (category: string, t: any) => {
  switch (category) {
    case 'Grundtraining': return t('training.template.category.basicTraining');
    case 'Rassespezifisch': return t('training.template.category.breedSpecific');
    case 'Seniorentraining': return t('training.template.category.seniorTraining');
    case 'Verhalten': return t('training.template.category.behavior');
    case 'Sozialisation': return t('training.template.category.socialization');
    case 'Basic Training': return t('training.template.category.basicTraining');
    case 'Breed Specific': return t('training.template.category.breedSpecific');
    case 'Senior Training': return t('training.template.category.seniorTraining');
    case 'Behavior': return t('training.template.category.behavior');
    case 'Socialization': return t('training.template.category.socialization');
    default: return category;
  }
};

export const TemplateOverviewCard = ({ 
  template, 
  onSelectTemplate, 
  onViewDetails 
}: TemplateOverviewCardProps) => {
  const { t } = useTranslations();
  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      {/* Template Header */}
      <div className="p-4 bg-gradient-to-r from-muted/50 to-muted/30 border-b border-border">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2 text-foreground">{template.title}</h3>
            <p className="text-muted-foreground text-sm mb-3">{template.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge className={getDifficultyColor(template.difficulty)}>
                {translateDifficulty(template.difficulty, t)}
              </Badge>
              <Badge className={getCategoryColor(template.category)}>
                {translateCategory(template.category, t)}
              </Badge>
            </div>
          </div>
          <Button 
            onClick={() => onViewDetails(template)}
            className="ml-4"
          >
            {t('training.template.fullView')}
          </Button>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
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
            {t('training.template.moduleCount', { count: template.exercises.length })}
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          <strong className="text-foreground">{t('training.template.for')}:</strong> {template.species.join(', ')}
          {template.ageGroups && (
            <>
              <br />
              <strong className="text-foreground">{t('training.template.age')}:</strong> {template.ageGroups.join(', ')}
            </>
          )}
        </div>
      </div>

      {/* Expandable Modules */}
      <Accordion type="multiple" className="w-full">
        <AccordionItem value="modules" className="border-0">
          <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 transition-colors">
            <span className="font-medium text-foreground">
              📚 {t('training.template.browseModules', { count: template.exercises.length })}
            </span>
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
              <div className="pt-4 border-t border-border">
                <Button 
                  onClick={() => onSelectTemplate(template)}
                  className="w-full"
                >
                  {t('training.template.useTemplate')}
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
