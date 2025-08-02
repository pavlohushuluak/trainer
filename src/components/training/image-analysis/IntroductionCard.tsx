
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Heart, Sparkles, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const IntroductionCard = () => {
  const { t } = useTranslation();
  
  return (
    <Card className="border-2 border-gradient-to-r from-primary/20 to-accent/20 bg-gradient-to-br from-primary/5 via-secondary to-accent/5">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-primary" />
          {t('training.introductionCard.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Camera className="h-4 w-4 text-primary" />
              {t('training.introductionCard.whatToDo.title')}
            </h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">1.</span>
                <span>{t('training.introductionCard.whatToDo.step1')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">2.</span>
                <span>{t('training.introductionCard.whatToDo.step2')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">3.</span>
                <span>{t('training.introductionCard.whatToDo.step3')}</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              {t('training.introductionCard.whatYouGet.title')}
            </h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span><strong>{t('training.introductionCard.whatYouGet.moodAnalysis')}</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span><strong>{t('training.introductionCard.whatYouGet.bodyLanguage')}</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span><strong>{t('training.introductionCard.whatYouGet.recommendations')}</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span><strong>{t('training.introductionCard.whatYouGet.trainingPlan')}</strong></span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
          <p className="text-sm text-foreground flex items-center gap-2">
            <Target className="h-4 w-4" />
            <strong>{t('training.introductionCard.freeForAll')}</strong>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
