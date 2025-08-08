
import { PlanTemplate } from '../templateTypes';
import { ModularExerciseCard } from './ModularExerciseCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, BookOpen } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';

interface TemplateDetailViewProps {
  template: PlanTemplate;
}

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

export const TemplateDetailView = ({ template }: TemplateDetailViewProps) => {
  const { t } = useTranslations();
  
  return (
    <div className="space-y-6">
      {/* Template Header */}
      <Card className="border-2 border-primary/20 dark:border-primary/30">
        <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/30">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl text-foreground">{template.title}</CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                {template.description}
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2">
              <Badge variant="outline" className="justify-center">
                {translateDifficulty(template.difficulty, t)}
              </Badge>
              <Badge variant="secondary" className="justify-center">
                {translateCategory(template.category, t)}
              </Badge>
            </div>
          </div>
          
          <div className="flex gap-4 text-sm text-muted-foreground pt-4">
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
        </CardHeader>
      </Card>

      {/* Exercises */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">📚 {t('training.template.trainingModules')}</h3>
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
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              💡 {t('training.template.importantTips')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {template.tips.map((tip, index) => (
                <li key={index} className="text-sm text-muted-foreground">• {tip}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              🎯 {t('training.template.expectedResults')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{template.expectedResults}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
