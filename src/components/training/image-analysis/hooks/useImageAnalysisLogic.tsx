
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTranslations } from '@/hooks/useTranslations';

interface Pet {
  id: string;
  name: string;
  species: string;
}

export const useImageAnalysisLogic = (selectedPet?: Pet, onPlanCreated?: () => void) => {
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [trainingPlan, setTrainingPlan] = useState<any>(null);
  const [showPlan, setShowPlan] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { currentLanguage, t } = useTranslations();

  const handleUploadComplete = (result: any) => {
    setAnalysisResult(result);
    setShowPlan(false);
    setTrainingPlan(null);
  };

  const handleCreatePlan = async () => {
    if (!analysisResult) return;

    const petName = selectedPet?.name || (currentLanguage === 'en' ? 'your pet' : 'dein Tier');
    
    // Language-specific training plan content
    const planContent = {
      de: {
        title: `${analysisResult.recommendation} - Training für ${petName}`,
        description: `Basierend auf der Bildanalyse: ${analysisResult.mood_estimation}`,
        goals: [
          t('training.imageAnalysis.logic.trainingPlan.goals.relaxed', { petName }),
          t('training.imageAnalysis.logic.trainingPlan.goals.bonding'),
          t('training.imageAnalysis.logic.trainingPlan.goals.wellbeing')
        ],
        steps: [
          {
            title: t('training.imageAnalysis.logic.trainingPlan.steps.observation.title'),
            description: t('training.imageAnalysis.logic.trainingPlan.steps.observation.description', { petName }),
            duration_minutes: 10,
            difficulty: t('training.imageAnalysis.logic.trainingPlan.steps.observation.difficulty')
          },
          {
            title: t('training.imageAnalysis.logic.trainingPlan.steps.targeted.title'),
            description: analysisResult.recommendation,
            duration_minutes: 15,
            difficulty: t('training.imageAnalysis.logic.trainingPlan.steps.targeted.difficulty')
          },
          {
            title: t('training.imageAnalysis.logic.trainingPlan.steps.reinforcement.title'),
            description: t('training.imageAnalysis.logic.trainingPlan.steps.reinforcement.description', { petName }),
            duration_minutes: 5,
            difficulty: t('training.imageAnalysis.logic.trainingPlan.steps.reinforcement.difficulty')
          }
        ]
      },
      en: {
        title: `${analysisResult.recommendation} - Training for ${petName}`,
        description: `Based on image analysis: ${analysisResult.mood_estimation}`,
        goals: [
          t('training.imageAnalysis.logic.trainingPlan.goals.relaxed', { petName }),
          t('training.imageAnalysis.logic.trainingPlan.goals.bonding'),
          t('training.imageAnalysis.logic.trainingPlan.goals.wellbeing')
        ],
        steps: [
          {
            title: t('training.imageAnalysis.logic.trainingPlan.steps.observation.title'),
            description: t('training.imageAnalysis.logic.trainingPlan.steps.observation.description', { petName }),
            duration_minutes: 10,
            difficulty: t('training.imageAnalysis.logic.trainingPlan.steps.observation.difficulty')
          },
          {
            title: t('training.imageAnalysis.logic.trainingPlan.steps.targeted.title'),
            description: analysisResult.recommendation,
            duration_minutes: 15,
            difficulty: t('training.imageAnalysis.logic.trainingPlan.steps.targeted.difficulty')
          },
          {
            title: t('training.imageAnalysis.logic.trainingPlan.steps.reinforcement.title'),
            description: t('training.imageAnalysis.logic.trainingPlan.steps.reinforcement.description', { petName }),
            duration_minutes: 5,
            difficulty: t('training.imageAnalysis.logic.trainingPlan.steps.reinforcement.difficulty')
          }
        ]
      }
    };

    const content = planContent[currentLanguage as keyof typeof planContent] || planContent.de;
    
    try {
      const planData = {
        title: content.title,
        description: content.description,
        goals: content.goals,
        steps: content.steps,
        estimated_days: 7
      };

      setTrainingPlan(planData);
      setShowPlan(true);
    } catch (error) {
      console.error('Error creating training plan:', error);
    }
  };

  const handleSavePlan = async () => {
    if (!trainingPlan || !user) return;

    if (!selectedPet) {
      toast({
        title: t('training.imageAnalysis.logic.petProfileRequired.title'),
        description: t('training.imageAnalysis.logic.petProfileRequired.description'),
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: plan, error: planError } = await supabase
        .from('training_plans')
        .insert({
          user_id: user.id,
          pet_id: selectedPet.id,
          title: trainingPlan.title,
          description: trainingPlan.description,
          status: 'planned'
        })
        .select()
        .single();

      if (planError) throw planError;

      const stepsToInsert = trainingPlan.steps.map((step: any, index: number) => ({
        training_plan_id: plan.id,
        step_number: index + 1,
        title: step.title,
        description: step.description,
        points_reward: 15
      }));

      const { error: stepsError } = await supabase
        .from('training_steps')
        .insert(stepsToInsert);

      if (stepsError) throw stepsError;

      toast({
        title: t('training.imageAnalysis.logic.planSaved.title'),
        description: t('training.imageAnalysis.logic.planSaved.description'),
      });

      if (onPlanCreated) onPlanCreated();
    } catch (error) {
      console.error('Error saving plan:', error);
      toast({
        title: t('training.imageAnalysis.logic.savePlanError.title'),
        description: t('training.imageAnalysis.logic.savePlanError.description'),
        variant: "destructive"
      });
    }
  };

  const handleSaveAnalysis = async () => {
    if (!analysisResult || !user) return;

    try {
      toast({
        title: t('training.imageAnalysis.logic.analysisSaved.title'),
        description: t('training.imageAnalysis.logic.analysisSaved.description'),
      });
    } catch (error) {
      console.error('Error saving analysis:', error);
      toast({
        title: t('training.imageAnalysis.logic.saveAnalysisError.title'),
        description: t('training.imageAnalysis.logic.saveAnalysisError.description'),
        variant: "destructive"
      });
    }
  };

  const handleStartOver = () => {
    setAnalysisResult(null);
    setTrainingPlan(null);
    setShowPlan(false);
  };

  return {
    analysisResult,
    trainingPlan,
    showPlan,
    handleUploadComplete,
    handleCreatePlan,
    handleSavePlan,
    handleSaveAnalysis,
    handleStartOver
  };
};
