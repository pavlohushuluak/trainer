
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/useTranslations';

interface ImagePreviewProps {
  previewUrl: string;
  isUploading: boolean;
  uploadError: string | null;
  canAnalyze: boolean;
  onTriggerFileInput: () => void;
  onRetryUpload: () => void;
}

export const ImagePreview = ({
  previewUrl,
  isUploading,
  uploadError,
  canAnalyze,
  onTriggerFileInput,
  onRetryUpload
}: ImagePreviewProps) => {
  const { t } = useTranslations();
  
  return (
    <div className="space-y-4">
      <div className="relative">
        <img 
          src={previewUrl} 
          alt={t('imageAnalysis.imagePreview.alt')} 
          className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
        />
        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <p className="text-sm">{t('imageAnalysis.imagePreview.analyzing')}</p>
            </div>
          </div>
        )}
      </div>
      
      {!isUploading && (
        <div className="flex gap-2 justify-center">
          <Button 
            onClick={onTriggerFileInput}
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
            disabled={!canAnalyze}
          >
            {t('imageAnalysis.imagePreview.selectOther')}
          </Button>
          {uploadError && (
            <Button 
              onClick={onRetryUpload}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!canAnalyze}
            >
              {t('imageAnalysis.imagePreview.retryAnalysis')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
