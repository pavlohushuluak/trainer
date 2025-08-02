import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Crown, 
  Lock, 
  Users, 
  CheckCircle, 
  ArrowRight, 
  Sparkles,
  Shield,
  Zap
} from "lucide-react";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { PRICING_PLANS } from "@/config/pricing";
import { useTranslation } from "react-i18next";

interface SubscriptionRequiredWarningProps {
  onUpgradeClick?: () => void;
  variant?: 'modal' | 'inline';
}

export const SubscriptionRequiredWarning = ({ 
  onUpgradeClick, 
  variant = 'inline' 
}: SubscriptionRequiredWarningProps) => {
  const { t } = useTranslation();
  const { hasActiveSubscription, subscriptionTierName } = useSubscriptionStatus();

  const handleUpgrade = () => {
    if (onUpgradeClick) {
      onUpgradeClick();
    } else {
      // Scroll to subscription management section
      const subscriptionSection = document.querySelector('.subscription-management-section');
      if (subscriptionSection) {
        subscriptionSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Activate the plans tab after scrolling
        setTimeout(() => {
          const plansTab = document.querySelector('[data-value="plans"]') as HTMLElement;
          if (plansTab) {
            plansTab.click();
          }
        }, 500);
      }
    }
  };

  const containerClass = variant === 'modal' 
    ? 'w-full max-w-2xl mx-auto' 
    : 'w-full';

  return (
    <div className={containerClass}>
      <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-3">
            <div className="relative">
              <Crown className="h-12 w-12 text-orange-500" />
              <Lock className="h-6 w-6 text-orange-600 absolute -top-1 -right-1 bg-white rounded-full p-0.5" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800 mb-2">
            {t('subscription.requiredWarning.title')}
          </CardTitle>
          <CardDescription className="text-gray-600 text-base">
            {t('subscription.requiredWarning.description')}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Current Status */}
          <Alert className="border-orange-200 bg-orange-50">
            <Shield className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>{t('subscription.requiredWarning.currentStatus')}:</strong> {hasActiveSubscription ? subscriptionTierName : t('subscription.requiredWarning.freeAccount')}
            </AlertDescription>
          </Alert>

          {/* CTA Section */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                <span>{t('subscription.requiredWarning.startToday')}</span>
              </div>
              <Button 
                onClick={handleUpgrade}
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Crown className="mr-2 h-5 w-5" />
                {t('subscription.requiredWarning.upgradeNow')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <p className="text-xs text-gray-500">
                {t('subscription.requiredWarning.trialInfo')}
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {t('subscription.requiredWarning.supportInfo')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 