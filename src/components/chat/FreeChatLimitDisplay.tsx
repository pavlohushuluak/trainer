
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
      <Card className="border-orange-200 dark:border-orange-400/50 bg-orange-50 dark:bg-orange-950/30 mb-4">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3 mb-3">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-orange-900 dark:text-orange-200 text-sm sm:text-base">
                {t('chat.freeChatLimit.limitReached.title')}
              </p>
              <p className="text-xs sm:text-sm text-orange-700 dark:text-orange-300 mt-1">
                {t('chat.freeChatLimit.limitReached.description')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-3 text-xs sm:text-sm text-orange-600 dark:text-orange-400">
            <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="truncate">{t('chat.freeChatLimit.limitReached.historyNote')}</span>
          </div>
          <Button 
            onClick={handleUpgradeClick}
            className="w-full bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white text-sm sm:text-base py-2 sm:py-2.5"
          >
            <Crown className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{t('chat.freeChatLimit.limitReached.button')}</span>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 dark:border-blue-400/50 bg-blue-50 dark:bg-blue-950/30 mb-4">
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-2 sm:gap-3 min-w-0">
            <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-blue-900 dark:text-blue-200 text-sm sm:text-base">
                {t('chat.freeChatLimit.active.title')} {questionsUsed}/{maxQuestions}
              </p>
              <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 mt-1">
                {maxQuestions - questionsUsed} {t('chat.freeChatLimit.active.remaining')}
              </p>
            </div>
          </div>
          <Button 
            onClick={handleUpgradeClick}
            variant="outline"
            className="border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 dark:hover:text-white text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4 w-full sm:w-auto flex-shrink-0"
            size="sm"
          >
            <span className="truncate">{t('chat.freeChatLimit.active.button')}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
