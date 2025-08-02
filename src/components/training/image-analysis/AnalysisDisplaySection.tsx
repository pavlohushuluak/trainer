
import { Button } from '@/components/ui/button';
import { ImageAnalysisResult } from './ImageAnalysisResult';
import { TrainingPlanPreview } from './TrainingPlanPreview';
import { RotateCcw } from 'lucide-react';

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
}

export const AnalysisDisplaySection = ({
  selectedPet,
  analysisResult,
  trainingPlan,
  showPlan,
  onCreatePlan,
  onSaveAnalysis,
  onSavePlan,
  onStartOver
}: AnalysisDisplaySectionProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">📸 Analyse für {selectedPet?.name || 'dein Tier'}</h3>
        <Button variant="outline" size="sm" onClick={onStartOver}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Neues Bild
        </Button>
      </div>

      <ImageAnalysisResult 
        result={analysisResult}
        onCreatePlan={onCreatePlan}
        onSaveAnalysis={onSaveAnalysis}
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
