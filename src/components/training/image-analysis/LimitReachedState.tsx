
import { Button } from '@/components/ui/button';
import { Crown } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';

interface LimitReachedStateProps {
  maxAnalyses: number;
  onUpgradeClick: () => void;
}

const scrollToSubscriptionManagement = () => {
  const subscriptionSection = document.querySelector('.subscription-management-section');
  if (subscriptionSection) {
    subscriptionSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    setTimeout(() => {
      const paketeTab = document.querySelector('[data-value="plans"]') as HTMLElement;
      if (paketeTab) {
        paketeTab.click();
      }
    }, 500);
  }
};

export const LimitReachedState = ({ maxAnalyses }: LimitReachedStateProps) => {
  const { t } = useTranslations();
  
  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-orange-300 dark:border-orange-400 rounded-lg p-8 bg-orange-50 dark:bg-orange-950/20">
        <Crown className="h-12 w-12 text-orange-600 dark:text-orange-400 mx-auto mb-4" />
        <p className="text-orange-700 dark:text-orange-300 font-medium mb-2">{t('imageAnalysis.limitReachedState.title')}</p>
        <p className="text-sm text-orange-600 dark:text-orange-400 mb-4">
          {t('imageAnalysis.limitReachedState.description')}
        </p>
        <Button 
          onClick={scrollToSubscriptionManagement}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white"
        >
          <Crown className="h-4 w-4 mr-2" />
          {t('imageAnalysis.limitReachedState.button')}
        </Button>
      </div>
    </div>
  );
};
