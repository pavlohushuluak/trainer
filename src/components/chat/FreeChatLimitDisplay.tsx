
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Crown, AlertCircle, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslations } from "@/hooks/useTranslations";

interface FreeChatLimitDisplayProps {
  questionsUsed: number;
  maxQuestions: number;
  hasReachedLimit: boolean;
  onUpgrade?: () => void;
}

export const FreeChatLimitDisplay = ({ 
  questionsUsed, 
  maxQuestions, 
  hasReachedLimit,
  onUpgrade 
}: FreeChatLimitDisplayProps) => {
  // Ensure values are valid numbers
  const safeQuestionsUsed = Math.max(0, Math.min(questionsUsed, maxQuestions));
  const safeMaxQuestions = Math.max(1, maxQuestions);
  const usagePercentage = (safeQuestionsUsed / safeMaxQuestions) * 100;
  const navigate = useNavigate();
  const { t } = useTranslations();

  const handleUpgradeClick = () => {
    // Close the modal first
    if (onUpgrade) {
      onUpgrade();
    }
    
    // Navigate to homepage with pricing hash
    navigate('/#pricing');
    
    // Use requestAnimationFrame for smooth scrolling
    requestAnimationFrame(() => {
      setTimeout(() => {
        // Ensure page can scroll
        document.body.style.overflow = 'auto';
        document.documentElement.style.overflow = 'auto';
        
        const pricingSection = document.getElementById('pricing');
        if (pricingSection) {
          pricingSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
          });
        }
      }, 200);
    });
  };

  if (hasReachedLimit) {
    return (
      <Card className="border-orange-200 dark:border-orange-400/50 bg-orange-50 dark:bg-orange-950/30 mb-4 shadow-sm">
        <CardContent className="p-2.5 sm:p-3 md:p-4 lg:p-5">
          <div className="flex items-start gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 mb-2 sm:mb-3">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-orange-900 dark:text-orange-200 text-sm sm:text-base md:text-lg leading-tight">
                {t('chat.freeChatLimit.limitReached.title')}
              </p>
              <p className="text-xs sm:text-sm md:text-base text-orange-700 dark:text-orange-300 mt-1 leading-relaxed">
                {t('chat.freeChatLimit.limitReached.description')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-3 text-xs sm:text-sm md:text-base text-orange-600 dark:text-orange-400">
            <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 flex-shrink-0" />
            <span className="truncate">{t('chat.freeChatLimit.limitReached.historyNote')}</span>
          </div>
          <Button 
            onClick={handleUpgradeClick}
            className="w-full bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white text-sm sm:text-base md:text-lg py-2.5 sm:py-3 md:py-3.5 px-4 sm:px-6 md:px-8 font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Crown className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-2 flex-shrink-0" />
            <span className="truncate">{t('chat.freeChatLimit.limitReached.button')}</span>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
          <Card className="border-blue-200 dark:border-blue-400/50 bg-blue-50 dark:bg-blue-950/30 mb-4 shadow-sm">
        <CardContent className="p-2.5 sm:p-3 md:p-4 lg:p-5">
          <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 sm:gap-3 md:gap-4">
            <div className="flex items-start gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 min-w-0">
            <Crown className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-blue-900 dark:text-blue-200 text-sm sm:text-base md:text-lg leading-tight">
                {t('chat.freeChatLimit.active.title')} {safeQuestionsUsed}/{safeMaxQuestions}
              </p>
              <p className="text-xs sm:text-sm md:text-base text-blue-700 dark:text-blue-300 mt-1 leading-relaxed">
                {safeMaxQuestions - safeQuestionsUsed} {t('chat.freeChatLimit.active.remaining')}
              </p>
              <div className="mt-2 sm:mt-3">
                <Progress 
                  value={usagePercentage} 
                  className="h-2 sm:h-2.5 md:h-3 bg-blue-200 dark:bg-blue-800"
                />
                <div className="flex justify-between text-xs text-blue-600 dark:text-blue-400 mt-1">
                  <span>{safeQuestionsUsed} {t('chat.freeChatLimit.active.used')}</span>
                  <span>{safeMaxQuestions} {t('chat.freeChatLimit.active.total')}</span>
                </div>
              </div>
            </div>
          </div>
          <Button 
            onClick={handleUpgradeClick}
            variant="outline"
            className="border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 dark:hover:text-white text-xs sm:text-sm md:text-base py-2 sm:py-2.5 md:py-3 px-4 sm:px-6 md:px-8 w-full xs:w-auto flex-shrink-0 font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm"
            size="sm"
          >
            <span className="truncate">{t('chat.freeChatLimit.active.button')}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
