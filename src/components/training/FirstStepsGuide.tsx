import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Plus, Camera, Target, BookOpen, Star } from "lucide-react";
import { Pet } from './types';
import { useTranslations } from '@/hooks/useTranslations';

interface FirstStepsGuideProps {
  pets: Pet[];
}

export const FirstStepsGuide = React.memo(({ pets }: FirstStepsGuideProps) => {
  const { t } = useTranslations();
  const isNewUser = pets.length === 0;

  if (!isNewUser) {
    return null;
  }

  const handleScrollToPetSection = () => {
    const petSection = document.getElementById('pet-section');
    if (petSection) {
      petSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const steps = [
    {
      number: 1,
      title: t('training.firstStepsGuide.steps.step1.title'),
      description: t('training.firstStepsGuide.steps.step1.description'),
      icon: <Plus className="h-5 w-5" />,
      action: t('training.firstStepsGuide.steps.step1.action'),
      onClick: handleScrollToPetSection,
      color: "bg-orange-500"
    },
    {
      number: 2,
      title: t('training.firstStepsGuide.steps.step2.title'),
      description: t('training.firstStepsGuide.steps.step2.description'),
      icon: <Camera className="h-5 w-5" />,
      action: t('training.firstStepsGuide.steps.step2.action'),
      disabled: true,
      color: "bg-blue-500"
    },
    {
      number: 3,
      title: t('training.firstStepsGuide.steps.step3.title'),
      description: t('training.firstStepsGuide.steps.step3.description'),
      icon: <Target className="h-5 w-5" />,
      action: t('training.firstStepsGuide.steps.step3.action'),
      disabled: true,
      color: "bg-green-500"
    }
  ];

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-secondary to-accent/5 mb-8">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Star className="h-6 w-6 text-yellow-500" />
          <CardTitle className="text-xl text-foreground">
            {t('training.firstStepsGuide.title')}
          </CardTitle>
          <Star className="h-6 w-6 text-yellow-500" />
        </div>
        <CardDescription className="text-muted-foreground">
          {t('training.firstStepsGuide.subtitle')}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {steps.map((step, index) => (
          <div 
            key={step.number}
            className={`flex items-center gap-4 p-4 rounded-lg bg-card/70 border border-border ${
              step.disabled ? 'opacity-50' : 'hover:bg-card/90 transition-colors'
            }`}
          >
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step.color} text-white font-bold text-sm`}>
              {step.number}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {step.icon}
                <h3 className="font-semibold text-foreground">{step.title}</h3>
                {step.disabled && <Badge variant="outline" className="text-xs">{t('training.firstStepsGuide.afterStep')} {step.number - 1}</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
            
            {step.onClick && !step.disabled && (
              <Button 
                onClick={step.onClick}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                size="sm"
              >
                {step.action}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
            
            {step.disabled && (
              <Badge variant="secondary" className="text-xs">
                {t('training.firstStepsGuide.locked')}
              </Badge>
            )}
          </div>
        ))}
        
        <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-start gap-3">
            <BookOpen className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium text-foreground mb-1">{t('training.firstStepsGuide.tip.title')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('training.firstStepsGuide.tip.description')}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

FirstStepsGuide.displayName = 'FirstStepsGuide';