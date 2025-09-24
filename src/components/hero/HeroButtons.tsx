
import { Button } from "@/components/ui/button";
import { Camera, Star, MessageCircle } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface HeroButtonsProps {
  handleGoToTraining: () => void;
}

export const HeroButtons = ({ handleGoToTraining }: HeroButtonsProps) => {
  const { t } = useTranslations();
  const navigate = useNavigate();
  const { user, session } = useAuth();

  const handleImageAnalysis = () => {
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

  const handleChatWithTrainer = () => {
    // Check if user is authenticated
    if (!user || !session) {
      navigate('/login');
      return;
    }
    
    navigate('/chat');
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-md mx-auto">
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        {/* Image Analysis Button */}
        <Button
          onClick={handleImageAnalysis}
          size="lg"
          className="flex-1 px-4 sm:px-6 py-3 text-sm sm:text-base font-medium bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 min-h-[44px] border-0"
        >
          <Camera className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          {t('hero.toImageAnalysis')}
        </Button>

        {/* Chat with Trainer Button */}
        <Button
          onClick={handleChatWithTrainer}
          size="lg"
          className="flex-1 px-4 sm:px-6 py-3 text-sm sm:text-base font-medium bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 min-h-[44px] border-0"
        >
          <MessageCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          {t('hero.chatWithTrainer')}
        </Button>
      </div>
      {/* Main Premium Button */}
      <Button
        onClick={handleGoToTraining}
        size="lg"
        className="w-full px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold bg-brand-gradient hover:opacity-90 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200 min-h-[48px]"
      >
        <Star className="mr-2 h-5 w-5" />
        {t('hero.startPremium')}
      </Button>

      {/* Secondary Action Buttons */}

    </div>
  );
};
