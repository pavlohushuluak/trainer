import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Camera, Sparkles, ArrowRight } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const FreeTierSection = () => {
  const { t } = useTranslations();
  const navigate = useNavigate();
  const { user, session } = useAuth();

  const handleStartFree = () => {
    navigate('/login');
  };

  const handleChatClick = () => {
    // Check if user is authenticated
    if (!user || !session) {
      navigate('/login');
      return;
    }
    
    navigate('/chat');
  };

  const handleImageAnalysisClick = () => {
    // Check if user is authenticated
    if (!user || !session) {
      navigate('/login');
      return;
    }
    
    navigate('/mein-tiertraining');
    // Scroll to image analysis section after navigation
    setTimeout(() => {
      const imageAnalysisSection = document.querySelector('[data-section="image-analysis"]') || 
                                   document.querySelector('.image-analysis-section') ||
                                   document.querySelector('[class*="ImageAnalysis"]');
      if (imageAnalysisSection) {
        imageAnalysisSection.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 500);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 mb-8 sm:mb-12">
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-white/95 via-blue-50/95 to-purple-50/95 dark:from-gray-900/95 dark:via-blue-900/20 dark:to-purple-900/20 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 overflow-hidden relative">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-tr from-indigo-400/10 to-pink-400/10 rounded-full blur-2xl"></div>
        </div>

        <CardContent className="relative p-6 sm:p-8 lg:p-10">
          <div className="text-center space-y-6">
            {/* Header */}
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-primary">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
                <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {t('hero.freeTier.title')}
                </h3>
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <p className="text-sm sm:text-base text-muted-foreground font-medium">
                {t('hero.freeTier.subtitle')}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground/80 max-w-2xl mx-auto">
                {t('hero.freeTier.description')}
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto">
              {/* Free Chats */}
              <div 
                onClick={handleChatClick}
                className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/50 dark:border-green-700/50 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 group"
              >
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-lg group-hover:shadow-xl transition-shadow duration-200">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-sm sm:text-base font-semibold text-green-700 dark:text-green-300 group-hover:text-green-800 dark:group-hover:text-green-200 transition-colors duration-200">
                    {t('hero.freeTier.features.chats')}
                  </div>
                  <div className="text-xs text-green-600/80 dark:text-green-400/80 group-hover:text-green-700/90 dark:group-hover:text-green-300/90 transition-colors duration-200">
                    {t('hero.freeTier.features.chatsDescription')}
                  </div>
                </div>
              </div>

              {/* Free Image Analysis */}
              <div 
                onClick={handleImageAnalysisClick}
                className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/50 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 group"
              >
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-lg group-hover:shadow-xl transition-shadow duration-200">
                  <Camera className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-sm sm:text-base font-semibold text-blue-700 dark:text-blue-300 group-hover:text-blue-800 dark:group-hover:text-blue-200 transition-colors duration-200">
                    {t('hero.freeTier.features.imageAnalysis')}
                  </div>
                  <div className="text-xs text-blue-600/80 dark:text-blue-400/80 group-hover:text-blue-700/90 dark:group-hover:text-blue-300/90 transition-colors duration-200">
                    {t('hero.freeTier.features.imageAnalysisDescription')}
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="space-y-3">
              <Button
                onClick={handleStartFree}
                size="lg"
                className="w-full sm:w-auto px-8 py-4 text-base sm:text-lg font-semibold bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 rounded-xl border-0 group"
              >
                <Sparkles className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                {t('hero.freeTier.cta')}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
              
              <p className="text-xs text-muted-foreground/70 flex items-center justify-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                {t('hero.freeTier.noCreditCard')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
