
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';

interface UploadAreaProps {
  onTriggerFileInput: () => void;
  canAnalyze: boolean;
  isUploading: boolean;
}

export const UploadArea = ({ onTriggerFileInput, canAnalyze, isUploading }: UploadAreaProps) => {
  const { t } = useTranslations();
  
  return (
    <div className="space-y-4">
      <div 
        className="border-2 border-dashed border-blue-300 rounded-lg p-8 hover:border-blue-400 transition-colors cursor-pointer" 
        onClick={onTriggerFileInput}
      >
        <Upload className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <p className="text-blue-700 font-medium mb-2">{t('imageAnalysis.uploadArea.dragDrop')}</p>
        <p className="text-sm text-blue-600">
          {t('imageAnalysis.uploadArea.fileTypes')}
        </p>
      </div>
      
      <Button 
        onClick={onTriggerFileInput}
        disabled={isUploading || !canAnalyze}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        <Upload className="h-4 w-4 mr-2" />
        {t('imageAnalysis.uploadArea.selectButton')}
      </Button>
    </div>
  );
};
