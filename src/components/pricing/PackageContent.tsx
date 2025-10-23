import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, MessageSquare, Camera, FileText, BarChart3, Zap, Users, Target } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

export const PackageContent = () => {
  const { t } = useTranslations();
  return (
    <div className="mb-6 sm:mb-8 md:mb-10 lg:mb-12 px-3 sm:px-4">
      <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-3 sm:mb-4 md:mb-6 leading-tight">
        {t('pricing.packageContent.title')}
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6 max-w-7xl mx-auto">
        {/* Chat with Professional Trainer */}
        <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-indigo-500/10 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="text-center pb-3 sm:pb-4 px-3 sm:px-4 md:px-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0" />
            </div>
            <CardTitle className="text-base sm:text-lg md:text-xl leading-tight">{t('pricing.packageContent.cards.chatTrainer.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-2.5 md:space-y-3 px-3 sm:px-4 md:px-6 pb-4 sm:pb-5 md:pb-6">
            <div className="flex items-start gap-1.5 sm:gap-2">
              <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-xs sm:text-sm leading-relaxed">{t('pricing.packageContent.cards.chatTrainer.feature1')}</span>
            </div>
            <div className="flex items-start gap-1.5 sm:gap-2">
              <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-xs sm:text-sm leading-relaxed">{t('pricing.packageContent.cards.chatTrainer.feature2')}</span>
            </div>
            <div className="flex items-start gap-1.5 sm:gap-2">
              <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-xs sm:text-sm leading-relaxed">{t('pricing.packageContent.cards.chatTrainer.feature3')}</span>
            </div>
          </CardContent>
        </Card>

        {/* Image Analysis */}
        <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/10 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="text-center pb-3 sm:pb-4 px-3 sm:px-4 md:px-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <Camera className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 flex-shrink-0" />
            </div>
            <CardTitle className="text-base sm:text-lg md:text-xl leading-tight">{t('pricing.packageContent.cards.imageAnalysis.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-2.5 md:space-y-3 px-3 sm:px-4 md:px-6 pb-4 sm:pb-5 md:pb-6">
            <div className="flex items-start gap-1.5 sm:gap-2">
              <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-xs sm:text-sm leading-relaxed">{t('pricing.packageContent.cards.imageAnalysis.feature1')}</span>
            </div>
            <div className="flex items-start gap-1.5 sm:gap-2">
              <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-xs sm:text-sm leading-relaxed">{t('pricing.packageContent.cards.imageAnalysis.feature2')}</span>
            </div>
            <div className="flex items-start gap-1.5 sm:gap-2">
              <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-xs sm:text-sm leading-relaxed">{t('pricing.packageContent.cards.imageAnalysis.feature3')}</span>
            </div>
          </CardContent>
        </Card>

        {/* Training Plans */}
        <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/10 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="text-center pb-3 sm:pb-4 px-3 sm:px-4 md:px-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 flex-shrink-0" />
            </div>
            <CardTitle className="text-base sm:text-lg md:text-xl leading-tight">{t('pricing.packageContent.cards.trainingPlans.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-2.5 md:space-y-3 px-3 sm:px-4 md:px-6 pb-4 sm:pb-5 md:pb-6">
            <div className="flex items-start gap-1.5 sm:gap-2">
              <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-xs sm:text-sm leading-relaxed">{t('pricing.packageContent.cards.trainingPlans.feature1')}</span>
            </div>
            <div className="flex items-start gap-1.5 sm:gap-2">
              <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-xs sm:text-sm leading-relaxed">{t('pricing.packageContent.cards.trainingPlans.feature2')}</span>
            </div>
            <div className="flex items-start gap-1.5 sm:gap-2">
              <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-xs sm:text-sm leading-relaxed">{t('pricing.packageContent.cards.trainingPlans.feature3')}</span>
            </div>
          </CardContent>
        </Card>

        {/* Progress Tracking */}
        <Card className="border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-red-500/10 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="text-center pb-3 sm:pb-4 px-3 sm:px-4 md:px-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 flex-shrink-0" />
            </div>
            <CardTitle className="text-base sm:text-lg md:text-xl leading-tight">{t('pricing.packageContent.cards.progressTracking.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-2.5 md:space-y-3 px-3 sm:px-4 md:px-6 pb-4 sm:pb-5 md:pb-6">
            <div className="flex items-start gap-1.5 sm:gap-2">
              <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-xs sm:text-sm leading-relaxed">{t('pricing.packageContent.cards.progressTracking.feature1')}</span>
            </div>
            <div className="flex items-start gap-1.5 sm:gap-2">
              <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-xs sm:text-sm leading-relaxed">{t('pricing.packageContent.cards.progressTracking.feature2')}</span>
            </div>
            <div className="flex items-start gap-1.5 sm:gap-2">
              <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-xs sm:text-sm leading-relaxed">{t('pricing.packageContent.cards.progressTracking.feature3')}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center mt-6 sm:mt-8 md:mt-10 px-3 sm:px-4">
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          {t('pricing.packageContent.features.allInclusive')}
        </p>
      </div>
    </div>
  );
};
