import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { QuickSignUpModal } from "@/components/auth/QuickSignUpModal";
import { useTranslation } from "react-i18next";

interface PricingCardsProps {
  isYearly: boolean;
}

export const PricingCards = ({ isYearly }: PricingCardsProps) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [showQuickSignUp, setShowQuickSignUp] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleCheckout = async (priceType: 'monthly' | 'yearly') => {
    if (!user) {
      setShowQuickSignUp(true);
      toast({
        title: t('pricing.checkout.loginRequired'),
        description: t('pricing.checkout.loginDescription'),
      });
      return;
    }

    setLoading(true);
    try {
      // Get current language from localStorage or default to 'de'
      const currentLanguage = localStorage.getItem('i18nextLng') || 'de';
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          priceType,
          successUrl: `${window.location.origin}/mein-tiertraining?success=true&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/?canceled=true`,
          language: currentLanguage,
          customerInfo: {
            name: user?.user_metadata?.full_name || user?.email?.split('@')[0]
          }
        }
      });

      if (error) throw error;
      
      window.open(data.url, '_blank');
      
      toast({
        title: t('pricing.checkout.redirectingToStripe'),
        description: t('pricing.checkout.guaranteeIncluded')
      });
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: t('pricing.checkout.error'),
        description: t('pricing.checkout.couldNotCreate'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpSuccess = () => {
    setTimeout(() => {
      handleCheckout('monthly');
    }, 1500);
  };

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Monatlich */}
          <Card className={`${!isYearly ? 'border-2 border-primary shadow-lg scale-105' : 'border-border'} transition-all duration-300`}>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">
                {t('pricing.monthly')}
                {!isYearly && <Star className="inline ml-2 h-5 w-5 text-primary" />}
              </CardTitle>
              <div className="text-4xl font-bold text-primary">
                9,99€
                <span className="text-lg text-muted-foreground font-normal">{t('pricing.perMonth')}</span>
              </div>
              <div className="flex items-center justify-center gap-2 bg-green-50 p-2 rounded mt-2 border border-green-200">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700 font-medium">{t('pricing.guarantee')}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">{t('pricing.features.guarantee')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">{t('pricing.features.allPremium')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">{t('pricing.features.cancelAnytime')}</span>
                </div>
              </div>
              <Button 
                onClick={() => handleCheckout('monthly')}
                className="w-full"
                disabled={loading}
              >
                {loading ? t('pricing.loading') : user ? t('pricing.startNow') : t('pricing.signUpAndBuy')}
              </Button>
              {!user && (
                <p className="text-xs text-muted-foreground text-center">
                  {t('pricing.quickSignUp')}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Jährlich */}
          <Card className={`${isYearly ? 'border-2 border-cta shadow-lg scale-105 bg-gradient-to-br from-cta/5 to-cta/10' : 'border-border'} transition-all duration-300`}>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                <span className="bg-cta text-cta-foreground px-3 py-1 rounded-full text-sm font-medium">
                  {t('pricing.recommended')}
                </span>
              </div>
              <CardTitle className="text-2xl font-bold">
                {t('pricing.yearly')}
                {isYearly && <Star className="inline ml-2 h-5 w-5 text-cta" />}
              </CardTitle>
              <div className="space-y-1">
                <div className="text-4xl font-bold text-cta">
                  89€
                  <span className="text-lg text-muted-foreground font-normal">{t('pricing.perYear')}</span>
                </div>
                <div className="text-sm text-cta font-medium">
                  {t('pricing.equivalentTo')} 7,42€{t('pricing.perMonth')}
                </div>
                <div className="text-sm text-muted-foreground line-through">
                  {t('pricing.insteadOf')} 119,88€
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 bg-green-50 p-2 rounded mt-2 border border-green-200">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700 font-medium">{t('pricing.guarantee')}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">{t('pricing.features.guarantee')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-cta" />
                  <span className="text-sm font-medium">{t('pricing.saveYearly')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">{t('pricing.features.allPremium')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">{t('pricing.features.cancelAnytime')}</span>
                </div>
              </div>
              <Button 
                onClick={() => handleCheckout('yearly')}
                className="w-full bg-cta hover:bg-cta/90 text-cta-foreground"
                disabled={loading}
              >
                {loading ? t('pricing.loading') : user ? t('pricing.saveNow') : t('pricing.signUpAndSave')}
              </Button>
              {!user && (
                <p className="text-xs text-muted-foreground text-center">
                  {t('pricing.quickSignUp')}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <QuickSignUpModal
        isOpen={showQuickSignUp}
        onClose={() => setShowQuickSignUp(false)}
        onSignUpSuccess={handleSignUpSuccess}
      />
    </>
  );
};
