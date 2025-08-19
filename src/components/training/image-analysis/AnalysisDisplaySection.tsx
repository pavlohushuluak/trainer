
import { Button } from '@/components/ui/button';
import { ImageAnalysisResult } from './ImageAnalysisResult';
import { TrainingPlanPreview } from './TrainingPlanPreview';
import { RotateCcw } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';

interface Pet {
  id: string;
  name: string;
  species: string;
}

interface AnalysisDisplaySectionProps {
  selectedPet?: Pet;
  analysisResult: any;
  trainingPlan: any;
  showPlan: boolean;
  onCreatePlan: () => void;
  onSaveAnalysis: () => void;
  onSavePlan: () => void;
  onStartOver: () => void;
  onPlanCreated?: (plan: any) => void;
}

export const AnalysisDisplaySection = ({
  selectedPet,
  analysisResult,
  trainingPlan,
  showPlan,
  onCreatePlan,
  onSaveAnalysis,
  onSavePlan,
  onStartOver,
  onPlanCreated
}: AnalysisDisplaySectionProps) => {
  const { currentLanguage } = useTranslations();

  // Language-specific translations
  const translations = {
    de: {
      analysisFor: 'Analyse für',
      yourPet: 'dein Tier',
      newImage: 'Neues Bild'
    },
    en: {
      analysisFor: 'Analysis for',
      yourPet: 'your pet',
      newImage: 'New image'
    }
  };

  const t = translations[currentLanguage as keyof typeof translations] || translations.de;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">📸 {t.analysisFor} {selectedPet?.name || t.yourPet}</h3>
        <Button variant="outline" size="sm" onClick={onStartOver}>
          <RotateCcw className="h-4 w-4 mr-2" />
          {t.newImage}
        </Button>
      </div>

      <ImageAnalysisResult 
        result={analysisResult}
        onCreatePlan={onCreatePlan}
        onSaveAnalysis={onSaveAnalysis}
        onPlanCreated={onPlanCreated}
      />

      {showPlan && trainingPlan && (
        <TrainingPlanPreview 
          plan={trainingPlan}
          onSavePlan={onSavePlan}
        />
      )}
    </div>
  );
};
