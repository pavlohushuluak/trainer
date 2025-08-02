
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/useTranslations';

interface ErrorDisplayProps {
  uploadError: string;
  onRetry: () => void;
}

export const ErrorDisplay = ({ uploadError, onRetry }: ErrorDisplayProps) => {
  const { t } = useTranslations();
  
  return (
    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-red-800 text-sm">
        <strong>{t('imageAnalysis.errorDisplay.error')}</strong> {uploadError}
      </p>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onRetry}
        className="mt-2"
      >
        {t('imageAnalysis.errorDisplay.retryButton')}
      </Button>
    </div>
  );
};
