
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
    <div className="space-y-3 sm:space-y-4">
      <div 
        className="border-2 border-dashed border-blue-300 dark:border-blue-600/50 rounded-lg p-4 sm:p-6 lg:p-8 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all cursor-pointer touch-manipulation" 
        onClick={onTriggerFileInput}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onTriggerFileInput()}
        aria-label={t('imageAnalysis.uploadArea.dragDrop')}
      >
        <Upload className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 text-blue-600 dark:text-blue-400 mx-auto mb-2 sm:mb-3 lg:mb-4" />
        <p className="text-blue-700 dark:text-blue-300 font-medium mb-1 sm:mb-2 text-xs sm:text-sm lg:text-base">
          {t('imageAnalysis.uploadArea.dragDrop')}
        </p>
        <p className="text-[10px] sm:text-xs lg:text-sm text-blue-600 dark:text-blue-400">
          {t('imageAnalysis.uploadArea.fileTypes')}
        </p>
      </div>
      
      <Button 
        onClick={onTriggerFileInput}
        disabled={isUploading || !canAnalyze}
        className="w-full sm:w-auto min-h-[44px] sm:min-h-[40px] bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs sm:text-sm touch-manipulation"
      >
        <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 flex-shrink-0" />
        <span>{t('imageAnalysis.uploadArea.selectButton')}</span>
      </Button>
    </div>
  );
};
