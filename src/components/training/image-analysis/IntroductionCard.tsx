
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Heart, Sparkles, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const IntroductionCard = () => {
  const { t } = useTranslation();
  
  return (
    <Card className="border-2 border-gradient-to-r from-primary/20 to-accent/20 bg-gradient-to-br from-primary/5 via-secondary to-accent/5 shadow-sm">
      <CardHeader className="px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-6">
        <CardTitle className="text-base sm:text-lg lg:text-xl flex items-center gap-1.5 sm:gap-2 lg:gap-3">
          <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-primary flex-shrink-0" />
          <span className="truncate">{t('training.introductionCard.title')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4 lg:px-6 lg:pb-6 space-y-3 sm:space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          <div className="space-y-2 sm:space-y-3">
            <h3 className="font-semibold text-foreground flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
              <Camera className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
              <span>{t('training.introductionCard.whatToDo.title')}</span>
            </h3>
            <ul className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground space-y-1 sm:space-y-1.5 lg:space-y-2">
              <li className="flex items-start gap-1.5 sm:gap-2">
                <span className="text-primary font-bold flex-shrink-0 text-xs sm:text-sm">1.</span>
                <span className="leading-relaxed">{t('training.introductionCard.whatToDo.step1')}</span>
              </li>
              <li className="flex items-start gap-1.5 sm:gap-2">
                <span className="text-primary font-bold flex-shrink-0 text-xs sm:text-sm">2.</span>
                <span className="leading-relaxed">{t('training.introductionCard.whatToDo.step2')}</span>
              </li>
              <li className="flex items-start gap-1.5 sm:gap-2">
                <span className="text-primary font-bold flex-shrink-0 text-xs sm:text-sm">3.</span>
                <span className="leading-relaxed">{t('training.introductionCard.whatToDo.step3')}</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-2 sm:space-y-3">
            <h3 className="font-semibold text-foreground flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
              <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500 flex-shrink-0" />
              <span>{t('training.introductionCard.whatYouGet.title')}</span>
            </h3>
            <ul className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground space-y-1 sm:space-y-1.5 lg:space-y-2">
              <li className="flex items-start gap-1.5 sm:gap-2">
                <span className="text-green-600 dark:text-green-400 flex-shrink-0 font-bold">✓</span>
                <span className="leading-relaxed"><strong>{t('training.introductionCard.whatYouGet.moodAnalysis')}</strong></span>
              </li>
              <li className="flex items-start gap-1.5 sm:gap-2">
                <span className="text-green-600 dark:text-green-400 flex-shrink-0 font-bold">✓</span>
                <span className="leading-relaxed"><strong>{t('training.introductionCard.whatYouGet.bodyLanguage')}</strong></span>
              </li>
              <li className="flex items-start gap-1.5 sm:gap-2">
                <span className="text-green-600 dark:text-green-400 flex-shrink-0 font-bold">✓</span>
                <span className="leading-relaxed"><strong>{t('training.introductionCard.whatYouGet.recommendations')}</strong></span>
              </li>
              <li className="flex items-start gap-1.5 sm:gap-2">
                <span className="text-green-600 dark:text-green-400 flex-shrink-0 font-bold">✓</span>
                <span className="leading-relaxed"><strong>{t('training.introductionCard.whatYouGet.trainingPlan')}</strong></span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/30 p-2.5 sm:p-3 lg:p-4 rounded-lg">
          <p className="text-xs sm:text-sm lg:text-base text-foreground flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
            <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
            <strong>{t('training.introductionCard.freeForAll')}</strong>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
