
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
  const { currentLanguage } = useTranslations();

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
          `${petName} soll sich in ähnlichen Situationen entspannter verhalten`,
          'Stärkung der Mensch-Tier-Bindung durch gezieltes Training',
          'Verbesserung der Körpersprache und des Wohlbefindens'
        ],
        steps: [
          {
            title: 'Beobachtung & Entspannung',
            description: `Beginne mit ruhiger Beobachtung von ${petName}. Schaffe eine entspannte Atmosphäre und belohne ruhiges Verhalten.`,
            duration_minutes: 10,
            difficulty: 'Anfänger'
          },
          {
            title: 'Gezielte Übung',
            description: analysisResult.recommendation,
            duration_minutes: 15,
            difficulty: 'Fortgeschritten'
          },
          {
            title: 'Positive Verstärkung',
            description: `Belohne ${petName} für jeden kleinen Fortschritt. Beende das Training immer mit einem positiven Erlebnis.`,
            duration_minutes: 5,
            difficulty: 'Anfänger'
          }
        ]
      },
      en: {
        title: `${analysisResult.recommendation} - Training for ${petName}`,
        description: `Based on image analysis: ${analysisResult.mood_estimation}`,
        goals: [
          `${petName} should behave more relaxed in similar situations`,
          'Strengthening the human-animal bond through targeted training',
          'Improving body language and well-being'
        ],
        steps: [
          {
            title: 'Observation & Relaxation',
            description: `Start with quiet observation of ${petName}. Create a relaxed atmosphere and reward calm behavior.`,
            duration_minutes: 10,
            difficulty: 'Beginner'
          },
          {
            title: 'Targeted Exercise',
            description: analysisResult.recommendation,
            duration_minutes: 15,
            difficulty: 'Advanced'
          },
          {
            title: 'Positive Reinforcement',
            description: `Reward ${petName} for every small progress. Always end training with a positive experience.`,
            duration_minutes: 5,
            difficulty: 'Beginner'
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
        title: "Tierprofil benötigt",
        description: "Um den Trainingsplan zu speichern, erstelle bitte zuerst ein Tierprofil.",
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
        title: "Trainingsplan gespeichert! 🎉",
        description: "Du findest deinen neuen Plan im Fortschrittsbereich.",
      });

      if (onPlanCreated) onPlanCreated();
    } catch (error) {
      console.error('Error saving plan:', error);
      toast({
        title: "Fehler beim Speichern",
        description: "Der Trainingsplan konnte nicht gespeichert werden.",
        variant: "destructive"
      });
    }
  };

  const handleSaveAnalysis = async () => {
    if (!analysisResult || !user) return;

    try {
      toast({
        title: "Analyse gespeichert! 💾",
        description: "Die Bildanalyse wurde in deinem Profil gespeichert.",
      });
    } catch (error) {
      console.error('Error saving analysis:', error);
      toast({
        title: "Fehler beim Speichern",
        description: "Die Analyse konnte nicht gespeichert werden.",
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
