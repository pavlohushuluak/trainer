
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, AlertCircle } from 'lucide-react';
import { useImageAnalysisLimit } from '@/hooks/useImageAnalysisLimit';
import { ImageAnalysisLimitDisplay } from './ImageAnalysisLimitDisplay';
import { useImageUpload } from './hooks/useImageUpload';
import { UploadArea } from './UploadArea';
import { ImagePreview } from './ImagePreview';
import { LimitReachedState } from './LimitReachedState';
import { ErrorDisplay } from './ErrorDisplay';
import { LoadingStateManager } from '../LoadingStateManager';
import { useTranslations } from '@/hooks/useTranslations';
import { PetSelectionModal } from './PetSelectionModal';
import { usePetProfiles } from '@/hooks/usePetProfiles';

interface AnimalImageUploadProps {
  onUploadComplete: (result: any, pet?: any) => void;
  disabled?: boolean;
}

export const AnimalImageUpload = ({ onUploadComplete, disabled }: AnimalImageUploadProps) => {
  const { t } = useTranslations();
  const [isPetSelectionOpen, setIsPetSelectionOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingImagePreview, setPendingImagePreview] = useState<string | null>(null);
  
  const { pets = [] } = usePetProfiles();
  
  const {
    analysesUsed,
    canAnalyze,
    remainingAnalyses,
    hasReachedLimit,
    incrementUsage,
    loading: limitLoading,
    maxAnalyses,
    error: limitError
  } = useImageAnalysisLimit();

  const {
    isUploading,
    previewUrl,
    uploadError,
    fileInputRef,
    handleFileSelect,
    handleUpload,
    triggerFileInput,
    resetUpload,
    performAnalysis
  } = useImageUpload({
    onUploadComplete,
    onPetSelectionRequired: (file: File, imagePreview: string) => {
      setPendingFile(file);
      setPendingImagePreview(imagePreview);
      setIsPetSelectionOpen(true);
    },
    canAnalyze,
    incrementUsage
  });

  const handlePetSelected = async (pet: any) => {
    if (pendingFile) {
      try {
        const result = await performAnalysis(pendingFile, pet.name, pet.species);
        // Pass the selected pet to the parent component
        onUploadComplete(result, pet);
      } finally {
        // Always reset the modal state, even if analysis fails
        setPendingFile(null);
        setPendingImagePreview(null);
        setIsPetSelectionOpen(false);
      }
    }
  };

  const handlePetSelectionClose = () => {
    setPendingFile(null);
    setPendingImagePreview(null);
    setIsPetSelectionOpen(false);
  };



  if (disabled) {
    return (
      <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-orange-600 dark:text-orange-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200 mb-2">
            {t('imageAnalysis.uploadComponent.disabled.title')}
          </h3>
          <p className="text-orange-700 dark:text-orange-300 mb-4">
            {t('imageAnalysis.uploadComponent.disabled.description')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <LoadingStateManager
        isLoading={limitLoading && analysesUsed === 0}
        loadingMessage={t('imageAnalysis.usage.loading')}
        hasError={!!limitError}
        errorMessage={limitError?.message}
        fallbackComponent={
          <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
            <CardContent className="p-6 text-center">
              <p className="text-orange-700 dark:text-orange-300">
                {t('imageAnalysis.uploadComponent.unavailable.description')}
              </p>
            </CardContent>
          </Card>
        }
      >
        <ImageAnalysisLimitDisplay
          analysesUsed={analysesUsed}
          maxAnalyses={maxAnalyses}
          remainingAnalyses={remainingAnalyses}
          hasReachedLimit={hasReachedLimit}
          hasActiveSubscription={remainingAnalyses === 'Unbegrenzt'}
        />

        <Card className="border-2 border-dashed border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4 flex items-center justify-center gap-2">
                <Camera className="h-5 w-5" />
                {t('imageAnalysis.uploadComponent.uploadTitle')}
              </h3>
              
              {hasReachedLimit ? (
                <LimitReachedState maxAnalyses={maxAnalyses} onUpgradeClick={() => {}} />
              ) : !previewUrl ? (
                <>
                  <UploadArea 
                    onTriggerFileInput={triggerFileInput}
                    canAnalyze={canAnalyze}
                    isUploading={isUploading}
                  />
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={isUploading || !canAnalyze}
                  />

                  {uploadError && (
                    <ErrorDisplay 
                      uploadError={uploadError}
                      onRetry={resetUpload}
                    />
                  )}
                </>
              ) : (
                <ImagePreview
                  previewUrl={previewUrl}
                  isUploading={isUploading}
                  uploadError={uploadError}
                  canAnalyze={canAnalyze}
                  onTriggerFileInput={triggerFileInput}
                  onRetryUpload={() => {
                    if (fileInputRef.current?.files?.[0]) {
                      handleUpload(fileInputRef.current.files[0]);
                    }
                  }}
                />
              )}
              
              <div className="mt-4 text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 p-3 rounded-lg">
                <p className="font-medium mb-1">{t('imageAnalysis.uploadComponent.tips.title')}</p>
                <ul className="text-left space-y-1">
                  <li>{t('imageAnalysis.uploadComponent.tips.lighting')}</li>
                  <li>{t('imageAnalysis.uploadComponent.tips.visibility')}</li>
                  <li>{t('imageAnalysis.uploadComponent.tips.recency')}</li>
                  <li>{t('imageAnalysis.uploadComponent.tips.focus')}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </LoadingStateManager>

      {/* Pet Selection Modal */}
      <PetSelectionModal
        isOpen={isPetSelectionOpen}
        onClose={handlePetSelectionClose}
        onPetSelected={handlePetSelected}
        pets={pets}
        imagePreview={pendingImagePreview || undefined}
      />
    </div>
  );
};
