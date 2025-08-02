
import { AnimalImageUpload } from './AnimalImageUpload';
import { IntroductionCard } from './IntroductionCard';
import { PetProfileWarning } from './PetProfileWarning';
import { AnalysisDisplaySection } from './AnalysisDisplaySection';
import { useImageAnalysisLogic } from './hooks/useImageAnalysisLogic';

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
  const {
    analysisResult,
    trainingPlan,
    showPlan,
    handleUploadComplete,
    handleCreatePlan,
    handleSavePlan,
    handleSaveAnalysis,
    handleStartOver
  } = useImageAnalysisLogic(selectedPet, onPlanCreated);

  return (
    <div className="space-y-6">
      {/* Introduction Card */}
      <IntroductionCard />

      {/* Pet Profile Warning - only show if no pet is selected */}
      {!selectedPet && <PetProfileWarning />}

      {/* Upload Section */}
      {!analysisResult ? (
        <AnimalImageUpload 
          onUploadComplete={handleUploadComplete}
          petName={selectedPet?.name || 'dein Tier'}
          petSpecies={selectedPet?.species || 'Tier'}
          disabled={!selectedPet}
        />
      ) : (
        <AnalysisDisplaySection
          selectedPet={selectedPet}
          analysisResult={analysisResult}
          trainingPlan={trainingPlan}
          showPlan={showPlan}
          onCreatePlan={handleCreatePlan}
          onSaveAnalysis={handleSaveAnalysis}
          onSavePlan={handleSavePlan}
          onStartOver={handleStartOver}
        />
      )}
    </div>
  );
};
