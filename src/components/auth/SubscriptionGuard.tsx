
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { Loader2, Crown, Lock, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SubscriptionModeDisplay } from '../subscription/SubscriptionModeDisplay';
import { useTranslations } from '@/hooks/useTranslations';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  fallbackMessage?: string;
  showUpgradeButton?: boolean;
  showPreview?: boolean; // Neue Option um Preview zu zeigen
}

const scrollToSubscriptionManagement = () => {
  const subscriptionSection = document.querySelector('.subscription-management-section');
  if (subscriptionSection) {
    subscriptionSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    setTimeout(() => {
      const paketeTab = document.querySelector('[data-value="plans"]') as HTMLElement;
      if (paketeTab) {
        paketeTab.click();
      }
    }, 500);
  }
};

export const SubscriptionGuard = ({ 
  children, 
  fallbackMessage,
  showUpgradeButton = true,
  showPreview = true 
}: SubscriptionGuardProps) => {
  const { t } = useTranslations();
  const { user, loading } = useAuth();
  const { subscriptionMode, subscription, isLoading: subscriptionLoading } = useSubscriptionStatus();

  // Use default fallback message if none provided
  const defaultFallbackMessage = t('auth.subscriptionGuard.defaultMessage');

  if (loading || subscriptionLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <Card className="border-orange-200 dark:border-orange-400/50 bg-orange-50 dark:bg-orange-950/30">
        <CardContent className="p-6 text-center">
          <Lock className="h-8 w-8 mx-auto text-orange-500 dark:text-orange-400 mb-2" />
          <p className="text-sm text-muted-foreground">
            {t('auth.subscriptionGuard.loginRequired')}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Allow access for premium and trial modes
  if (subscriptionMode === 'premium' || subscriptionMode === 'trial') {
    return <>{children}</>;
  }

  // Show preview with upgrade overlay for free users
  if (showPreview) {
    return (
      <div className="relative">
        {/* Content mit Overlay */}
        <div className="relative">
          {children}
          {/* Upgrade Overlay */}
          <div className="absolute inset-0 bg-background/90 dark:bg-background/95 backdrop-blur-sm flex items-center justify-center">
            <Card className="w-full max-w-md mx-4 border-orange-200 dark:border-orange-400/50 bg-orange-50 dark:bg-orange-950/30">
              <CardHeader className="text-center pb-3">
                {subscriptionMode === 'trial_expired' ? (
                  <Clock className="h-8 w-8 mx-auto text-orange-500 dark:text-orange-400 mb-2" />
                ) : (
                  <Crown className="h-8 w-8 mx-auto text-yellow-500 dark:text-yellow-400 mb-2" />
                )}
                <CardTitle className="text-sm flex items-center justify-center gap-2">
                  {subscriptionMode === 'trial_expired' ? t('auth.subscriptionGuard.trialExpired') : t('auth.subscriptionGuard.premiumFeature')}
                  <SubscriptionModeDisplay 
                    mode={subscriptionMode}
                    subscriptionTier={subscription?.subscription_tier}
                    trialEnd={subscription?.trial_end}
                  />
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="mb-4">
                  {fallbackMessage || defaultFallbackMessage}
                </CardDescription>
                {showUpgradeButton && (
                  <Button 
                    onClick={scrollToSubscriptionManagement}
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    {t('auth.subscriptionGuard.upgradeNow')}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Fallback ohne Preview
  const getIcon = () => {
    switch (subscriptionMode) {
      case 'trial_expired':
        return <Clock className="h-8 w-8 mx-auto text-orange-500 dark:text-orange-400 mb-2" />;
      default:
        return <Crown className="h-8 w-8 mx-auto text-yellow-500 dark:text-yellow-400 mb-2" />;
    }
  };

  const getTitle = () => {
    switch (subscriptionMode) {
      case 'trial_expired':
        return t('auth.subscriptionGuard.trialExpired');
      default:
        return t('auth.subscriptionGuard.premiumFeature');
    }
  };

  return (
    <Card className="border-orange-200 dark:border-orange-400/50 bg-orange-50 dark:bg-orange-950/30">
      <CardHeader className="text-center pb-3">
        {getIcon()}
        <CardTitle className="text-sm flex items-center justify-center gap-2">
          {getTitle()}
          <SubscriptionModeDisplay 
            mode={subscriptionMode}
            subscriptionTier={subscription?.subscription_tier}
            trialEnd={subscription?.trial_end}
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <CardDescription className="mb-4">
          {fallbackMessage || defaultFallbackMessage}
        </CardDescription>
        {showUpgradeButton && (
          <Button 
            onClick={scrollToSubscriptionManagement}
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Crown className="h-4 w-4 mr-2" />
            {t('auth.subscriptionGuard.upgradeNow')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
