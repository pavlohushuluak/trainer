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
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-secondary to-accent/5 mb-4 sm:mb-6 lg:mb-8">
      <CardHeader className="text-center px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-6">
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
          <Star className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500 flex-shrink-0" />
          <CardTitle className="text-base sm:text-lg lg:text-xl text-foreground">
            {t('training.firstStepsGuide.title')}
          </CardTitle>
          <Star className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500 flex-shrink-0" />
        </div>
        <CardDescription className="text-muted-foreground text-xs sm:text-sm lg:text-base">
          {t('training.firstStepsGuide.subtitle')}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4 lg:pb-6">
        {steps.map((step, index) => (
          <div 
            key={step.number}
            className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-card/70 border border-border ${
              step.disabled ? 'opacity-50' : 'hover:bg-card/90 transition-colors'
            }`}
          >
            <div className={`flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full ${step.color} text-white font-bold text-xs sm:text-sm flex-shrink-0`}>
              {step.number}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-1">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="flex-shrink-0">{step.icon}</span>
                  <h3 className="font-semibold text-foreground text-xs sm:text-sm lg:text-base truncate">{step.title}</h3>
                </div>
                {step.disabled && <Badge variant="outline" className="text-[10px] sm:text-xs w-fit">{t('training.firstStepsGuide.afterStep')} {step.number - 1}</Badge>}
              </div>
              <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
            
            <div className="flex-shrink-0">
              {step.onClick && !step.disabled && (
                <Button 
                  onClick={step.onClick}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto min-h-[40px] touch-manipulation text-xs sm:text-sm"
                  size="sm"
                >
                  <span className="truncate">{step.action}</span>
                  <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1 flex-shrink-0" />
                </Button>
              )}
              
              {step.disabled && (
                <Badge variant="secondary" className="text-[10px] sm:text-xs w-full sm:w-auto text-center py-1">
                  {t('training.firstStepsGuide.locked')}
                </Badge>
              )}
            </div>
          </div>
        ))}
        
        <div className="mt-4 sm:mt-5 lg:mt-6 p-3 sm:p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3">
            <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 sm:mt-0 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-foreground mb-1 text-xs sm:text-sm lg:text-base">{t('training.firstStepsGuide.tip.title')}</h4>
              <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground leading-relaxed">
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