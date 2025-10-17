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
    // If user is already signed in, go to training page
    // Otherwise, go to login page
    if (user && session) {
      console.log('✅ User is signed in, navigating to /mein-tiertraining');
      navigate('/mein-tiertraining');
    } else {
      console.log('📝 User not signed in, navigating to /login');
      navigate('/login');
    }
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
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 mb-6 sm:mb-8 lg:mb-12">
      <Card className="border-0 shadow-xl hover:shadow-2xl bg-gradient-to-br from-white/95 via-blue-50/95 to-purple-50/95 dark:from-gray-900/95 dark:via-blue-900/20 dark:to-purple-900/20 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 overflow-hidden relative transition-shadow duration-300">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-tr from-indigo-400/10 to-pink-400/10 rounded-full blur-2xl"></div>
        </div>

        <CardContent className="relative p-4 sm:p-6 lg:p-8 xl:p-10">
          <div className="text-center space-y-4 sm:space-y-5 lg:space-y-6">
            {/* Header */}
            <div className="space-y-2 sm:space-y-2.5 lg:space-y-3">
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-primary">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 animate-pulse" />
                <h3 className="text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {t('hero.freeTier.title')}
                </h3>
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 animate-pulse" />
              </div>
              <p className="text-xs sm:text-sm lg:text-base text-muted-foreground font-medium px-2 sm:px-0">
                {t('hero.freeTier.subtitle')}
              </p>
              <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
                {t('hero.freeTier.description')}
              </p>
            </div>

            {/* CTA Button */}
            <div className="space-y-2 sm:space-y-3">
              <Button
                onClick={handleStartFree}
                size="lg"
                className="w-full sm:w-auto min-h-[44px] sm:min-h-[48px] px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg font-semibold bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 rounded-xl border-0 group touch-manipulation"
              >
                <Sparkles className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:animate-pulse flex-shrink-0" />
                <span>{t('hero.freeTier.cta')}</span>
                <ArrowRight className="ml-1.5 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform duration-200 flex-shrink-0" />
              </Button>
              
              <p className="text-[10px] sm:text-xs text-muted-foreground/70 flex items-center justify-center gap-1 sm:gap-1.5">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0"></span>
                <span>{t('hero.freeTier.noCreditCard')}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
