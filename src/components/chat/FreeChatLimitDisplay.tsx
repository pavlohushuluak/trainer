
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
      <Card className="border-orange-200 bg-orange-50 mb-4">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <div className="flex-1">
              <p className="font-medium text-orange-900">
                {t('chat.freeChatLimit.limitReached.title')}
              </p>
              <p className="text-sm text-orange-700">
                {t('chat.freeChatLimit.limitReached.description')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-3 text-sm text-orange-600">
            <MessageCircle className="h-4 w-4" />
            <span>{t('chat.freeChatLimit.limitReached.historyNote')}</span>
          </div>
          <Button 
            onClick={handleUpgradeClick}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Crown className="h-4 w-4 mr-2" />
            {t('chat.freeChatLimit.limitReached.button')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50 mb-4">
      <CardContent className="p-4">
                  <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">
                  {t('chat.freeChatLimit.active.title')} {questionsUsed}/{maxQuestions}
                </p>
                <p className="text-sm text-blue-700">
                  {maxQuestions - questionsUsed} {t('chat.freeChatLimit.active.remaining')}
                </p>
              </div>
            </div>
            <Button 
              onClick={handleUpgradeClick}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
              size="sm"
            >
              {t('chat.freeChatLimit.active.button')}
            </Button>
          </div>
      </CardContent>
    </Card>
  );
};
