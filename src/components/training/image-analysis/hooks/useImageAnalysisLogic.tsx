
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTranslations } from '@/hooks/useTranslations';
import { useImageAnalysisHistory } from '@/hooks/useImageAnalysisHistory';
import { useQueryClient } from '@tanstack/react-query';

interface Pet {
  id: string;
  name: string;
  species: string;
}

export const useImageAnalysisLogic = (selectedPet?: Pet, onPlanCreated?: () => void) => {
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [analysisPet, setAnalysisPet] = useState<Pet | null>(null);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { currentLanguage, t } = useTranslations();
  const { saveAnalysis } = useImageAnalysisHistory();
  const queryClient = useQueryClient();

  const handleUploadComplete = async (result: any, pet?: Pet) => {
    setAnalysisResult(result);
    setAnalysisPet(pet || selectedPet || null);
  };

  const handleCreatePlan = async () => {
    if (!analysisResult || !user) return;

    const petToUse = analysisPet || selectedPet;
    
    if (!petToUse) {
      toast({
        title: t('training.imageAnalysis.logic.petProfileRequired.title'),
        description: t('training.imageAnalysis.logic.petProfileRequired.description'),
        variant: "destructive"
      });
      return;
    }

    setIsCreatingPlan(true);

    try {
      // Show loading state with proper translations
      const loadingMessages = {
        de: {
          title: 'Trainingsplan wird erstellt...',
          description: 'Bitte warten Sie, während wir Ihren personalisierten Plan erstellen.'
        },
        en: {
          title: 'Creating training plan...',
          description: 'Please wait while we generate your personalized plan.'
        }
      };
      
      const loadingT = loadingMessages[currentLanguage as keyof typeof loadingMessages] || loadingMessages.de;
      
      toast({
        title: loadingT.title,
        description: loadingT.description,
      });

      // Call the analyze-animal-image function with createPlan=true
      console.log('🌍 Frontend - Sending language:', currentLanguage);
      console.log('🌍 Frontend - User ID:', user.id);
      console.log('🌍 Frontend - Pet ID:', petToUse.id);
      
      const { data: result, error } = await supabase.functions.invoke('analyze-animal-image', {
        body: {
          image: analysisResult.original_image, // Use the original image from analysis result
          petName: petToUse.name,
          petSpecies: petToUse.species,
          language: currentLanguage,
          createPlan: true,
          userId: user.id,
          petId: petToUse.id
        }
      });

      if (error) {
        console.error('Edge Function error details:', error);
        throw new Error(`Edge Function error: ${error.message || 'Unknown error'}`);
      }

      if (!result) {
        throw new Error('No response from analyze-animal-image function');
      }

      console.log('Plan creation response:', result);

      if (result.plan_creation_success && result.created_plan) {
        // Plan was created successfully
        const successMessages = {
          de: {
            title: 'Trainingsplan erstellt!',
            description: `"${result.created_plan.title}" wurde in Ihren Trainingsplänen gespeichert.`
          },
          en: {
            title: 'Training plan created!',
            description: `"${result.created_plan.title}" has been saved to your training plans.`
          }
        };
        
        const successT = successMessages[currentLanguage as keyof typeof successMessages] || successMessages.de;
        
        toast({
          title: successT.title,
          description: successT.description,
        });

        // Invalidate training plans query to refresh the list
        queryClient.invalidateQueries({ queryKey: ['training-plans-with-steps'] });
        
        if (onPlanCreated) onPlanCreated();
        
        // Reset the analysis view after creating plan
        // No need to reset since we don't show plan preview anymore
      } else if (result.plan_creation_error) {
        // Plan creation failed
        const errorMessages = {
          de: {
            title: 'Plan-Erstellung fehlgeschlagen',
            description: result.plan_creation_error
          },
          en: {
            title: 'Plan creation failed',
            description: result.plan_creation_error
          }
        };
        
        const errorT = errorMessages[currentLanguage as keyof typeof errorMessages] || errorMessages.de;
        
        toast({
          title: errorT.title,
          description: errorT.description,
          variant: "destructive"
        });
      } else {
        // Unexpected response
        const unexpectedMessages = {
          de: {
            title: 'Unerwartete Antwort',
            description: 'Bitte versuchen Sie, den Plan erneut zu erstellen.'
          },
          en: {
            title: 'Unexpected response',
            description: 'Please try creating the plan again.'
          }
        };
        
        const unexpectedT = unexpectedMessages[currentLanguage as keyof typeof unexpectedMessages] || unexpectedMessages.de;
        
        toast({
          title: unexpectedT.title,
          description: unexpectedT.description,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating training plan:', error);
      const catchErrorMessages = {
        de: {
          title: 'Fehler beim Erstellen des Plans',
          description: 'Beim Erstellen Ihres Trainingsplans ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.'
        },
        en: {
          title: 'Error creating plan',
          description: 'There was an error creating your training plan. Please try again.'
        }
      };
      
      const catchErrorT = catchErrorMessages[currentLanguage as keyof typeof catchErrorMessages] || catchErrorMessages.de;
      
      toast({
        title: catchErrorT.title,
        description: catchErrorT.description,
        variant: "destructive"
      });
    } finally {
      setIsCreatingPlan(false);
    }
  };

  // handleSavePlan function removed - no longer needed since plans are created directly via API

  const handleSaveAnalysis = async () => {
    if (!analysisResult || !user) return;

    const petToUse = analysisPet || selectedPet;

    try {
      // Save analysis to history
      await saveAnalysis(petToUse?.id || null, undefined, analysisResult);
      
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
    setAnalysisPet(null);
  };

  return {
    analysisResult,
    analysisPet,
    isCreatingPlan,
    handleUploadComplete,
    handleCreatePlan,
    handleSaveAnalysis,
    handleStartOver
  };
};
