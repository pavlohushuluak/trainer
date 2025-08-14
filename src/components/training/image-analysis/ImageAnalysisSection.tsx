
import { useState } from 'react';
import { AnimalImageUpload } from './AnimalImageUpload';
import { IntroductionCard } from './IntroductionCard';
import { PetProfileWarning } from './PetProfileWarning';
import { AnalysisDisplaySection } from './AnalysisDisplaySection';
import { ImageAnalysisHistoryModal } from './ImageAnalysisHistoryModal';
import { useImageAnalysisLogic } from './hooks/useImageAnalysisLogic';
import { useTranslations } from '@/hooks/useTranslations';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { History } from 'lucide-react';

interface Pet {
  id: string;
  name: string;
  species: string;
}

interface ImageAnalysisSectionProps {
  selectedPet?: Pet;
  onPlanCreated?: () => void;
}

export const ImageAnalysisSection = ({ selectedPet, onPlanCreated }: ImageAnalysisSectionProps) => {
  const { currentLanguage } = useTranslations();
  const { t } = useTranslation();
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  
  const {
    analysisResult,
    trainingPlan,
    showPlan,
    analysisPet,
    handleUploadComplete,
    handleCreatePlan,
    handleSavePlan,
    handleSaveAnalysis,
    handleStartOver
  } = useImageAnalysisLogic(selectedPet, onPlanCreated);

  // Language-specific translations
  const translations = {
    de: {
      yourPet: 'dein Tier',
      animal: 'Tier'
    },
    en: {
      yourPet: 'your pet',
      animal: 'animal'
    }
  };

  const localT = translations[currentLanguage as keyof typeof translations] || translations.de;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Introduction Card with History Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex-1">
          <IntroductionCard />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsHistoryModalOpen(true)}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <History className="h-4 w-4" />
          <span className="hidden sm:inline">{t('imageAnalysis.history.button')}</span>
          <span className="sm:hidden">History</span>
        </Button>
      </div>

      {/* Pet Profile Warning - only show if no pet is selected */}
      {!selectedPet && <PetProfileWarning />}

      {/* Upload Section */}
      {!analysisResult ? (
        <AnimalImageUpload 
          onUploadComplete={handleUploadComplete}
          disabled={false}
        />
      ) : (
        <AnalysisDisplaySection
          selectedPet={analysisPet || selectedPet}
          analysisResult={analysisResult}
          trainingPlan={trainingPlan}
          showPlan={showPlan}
          onCreatePlan={handleCreatePlan}
          onSaveAnalysis={handleSaveAnalysis}
          onSavePlan={handleSavePlan}
          onStartOver={handleStartOver}
        />
      )}

      {/* History Modal */}
      <ImageAnalysisHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        onViewAnalysis={(analysis) => {
          // Handle viewing a previous analysis
          console.log('Viewing analysis:', analysis);
          setIsHistoryModalOpen(false);
        }}
      />
    </div>
  );
};
