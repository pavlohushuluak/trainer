
import { Button } from '@/components/ui/button';
import { ImageAnalysisResult } from './ImageAnalysisResult';
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
  isCreatingPlan?: boolean;
  onCreatePlan: () => void;
  onSaveAnalysis: () => void;
  onStartOver: () => void;
  onPlanCreated?: (plan: any) => void;
}

export const AnalysisDisplaySection = ({
  selectedPet,
  analysisResult,
  isCreatingPlan,
  onCreatePlan,
  onSaveAnalysis,
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
        isCreatingPlan={isCreatingPlan}
        onCreatePlan={onCreatePlan}
        onSaveAnalysis={onSaveAnalysis}
        onPlanCreated={onPlanCreated}
      />
    </div>
  );
};
