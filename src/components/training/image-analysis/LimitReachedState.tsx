
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
    <div className="space-y-3 sm:space-y-4">
      <div className="border-2 border-dashed border-orange-300 dark:border-orange-400 rounded-lg p-4 sm:p-6 lg:p-8 bg-orange-50 dark:bg-orange-950/20 text-center">
        <Crown className="h-10 w-10 sm:h-12 sm:w-12 text-orange-600 dark:text-orange-400 mx-auto mb-3 sm:mb-4" />
        <p className="text-sm sm:text-base text-orange-700 dark:text-orange-300 font-medium mb-2 px-2">{t('imageAnalysis.limitReachedState.title')}</p>
        <p className="text-xs sm:text-sm text-orange-600 dark:text-orange-400 mb-4 px-2 leading-relaxed">
          {t('imageAnalysis.limitReachedState.description')}
        </p>
        <Button 
          onClick={scrollToSubscriptionManagement}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white w-full sm:w-auto min-h-[44px] touch-manipulation"
        >
          <Crown className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="text-sm sm:text-base">{t('imageAnalysis.limitReachedState.button')}</span>
        </Button>
      </div>
    </div>
  );
};
