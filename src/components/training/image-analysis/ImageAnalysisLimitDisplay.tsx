
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Camera, Crown, Lock } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';

interface ImageAnalysisLimitDisplayProps {
  analysesUsed: number;
  maxAnalyses: number;
  remainingAnalyses: string | number;
  hasReachedLimit: boolean;
  hasActiveSubscription: boolean;
}

const scrollToSubscriptionManagement = () => {
  const subscriptionSection = document.querySelector('.subscription-management-section');
  if (subscriptionSection) {
    subscriptionSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Nach dem Scrollen den "Pakete" Tab aktivieren
    setTimeout(() => {
      const paketeTab = document.querySelector('[data-value="plans"]') as HTMLElement;
      if (paketeTab) {
        paketeTab.click();
      }
    }, 500);
  }
};

export const ImageAnalysisLimitDisplay = ({ 
  analysesUsed, 
  maxAnalyses, 
  remainingAnalyses,
  hasReachedLimit,
  hasActiveSubscription
}: ImageAnalysisLimitDisplayProps) => {
  const { t } = useTranslations();
  if (hasActiveSubscription) {
    return (
      <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Camera className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-200">{t('imageAnalysis.limitDisplay.premium.title')}</h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {t('imageAnalysis.limitDisplay.premium.description')}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="border-green-300 dark:border-green-700 text-green-800 dark:text-green-200 bg-white dark:bg-card">
              <Crown className="h-3 w-3 mr-1" />
              {t('imageAnalysis.limitDisplay.premium.badge')}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hasReachedLimit) {
    return (
      <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20 mb-4">
        <CardContent className="p-4 text-center">
          <Lock className="h-8 w-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
          <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">
            {t('imageAnalysis.limitDisplay.limitReached.title')} ({analysesUsed}/{maxAnalyses})
          </h3>
          <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
            {t('imageAnalysis.limitDisplay.limitReached.description')}
          </p>
          <Button 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white"
            onClick={scrollToSubscriptionManagement}
          >
            <Crown className="h-4 w-4 mr-2" />
            {t('imageAnalysis.limitDisplay.limitReached.button')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Camera className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          <div>
                <h3 className="font-semibold text-blue-800 dark:text-blue-200">{t('imageAnalysis.limitDisplay.free.title')}</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {remainingAnalyses} {t('imageAnalysis.limitDisplay.free.description')} {maxAnalyses}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200 bg-white dark:bg-card">
              {t('imageAnalysis.limitDisplay.free.badge')}
            </Badge>
        </div>
        <div className="mt-3">
          <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
            <div 
              className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${(analysesUsed / maxAnalyses) * 100}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
