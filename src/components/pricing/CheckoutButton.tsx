
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShoppingCart } from 'lucide-react';
import { SmartLoginModal } from '@/components/auth/SmartLoginModal';
import { useSmartLogin } from '@/hooks/useSmartLogin';
import { useGTM } from '@/hooks/useGTM';
import { setCheckoutFlags, clearCheckoutFlags, debugCheckoutState } from '@/utils/checkoutStorage';
import { getPrice } from '@/config/pricing';
import { useTranslation } from 'react-i18next';

interface CheckoutButtonProps {
  priceType: string;
  children: React.ReactNode;
  className?: string;
}

export const CheckoutButton = ({ priceType, children, className = "" }: CheckoutButtonProps) => {
  const { t } = useTranslation();
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { trackAddToCart } = useGTM();

  // Smart Login with checkout context
  const { 
    isLoginModalOpen, 
    setIsLoginModalOpen, 
    handleLoginSuccess 
  } = useSmartLogin({
    loginContext: 'checkout',
    redirectToCheckout: true,
    skipRedirect: true
  });

  const handleCheckout = async () => {
    
    // Debug current state before setting flags
    debugCheckoutState();
    
    // Set checkout flags IMMEDIATELY using centralized utility
    const sessionId = setCheckoutFlags(priceType, window.location.href);
    
    
    // Immediate loading feedback
    setLoading(true);
    
    try {
      // Track add to cart event
      // Extract plan ID and billing cycle from priceType (e.g., "plan1-monthly" -> planId: "plan1", isHalfYearly: false)
      const [planId, billingCycle] = priceType.split('-');
      const isHalfYearly = billingCycle === 'halfyearly';
      const amount = getPrice(planId, isHalfYearly);
      trackAddToCart(amount);

      // If not logged in, show login modal
      if (!user || !session) {
        setLoading(false);
        setIsLoginModalOpen(true);
        return;
      }

      await executeDirectStripeCheckout();
    } catch (error) {
      setLoading(false);
      clearCheckoutFlags();
      toast({
        title: t('training.checkoutButton.checkoutError'),
        description: t('training.checkoutButton.unknownError'),
        variant: "destructive",
      });
    }
  };

  const executeDirectStripeCheckout = async () => {

    
    try {
      const requestBody = { 
        priceType,
        successUrl: `${window.location.origin}/mein-tiertraining?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/?canceled=true`
      };
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: requestBody
      });


      if (error) {
        throw error;
      }

      if (data?.url) {
        // Clear flags before redirect
        clearCheckoutFlags();
        
        // SAME TAB redirect to Stripe
        window.location.href = data.url;
      } else {
        throw new Error(t('training.checkoutButton.noCheckoutUrl'));
      }
    } catch (error: any) {
      toast({
        title: t('training.checkoutButton.checkoutError'),
        description: error.message || t('training.checkoutButton.unknownError'),
        variant: "destructive",
      });
      setLoading(false);
      clearCheckoutFlags();
    }
  };

  const handleLoginSuccessForCheckout = async () => { 
    
    try {
      await handleLoginSuccess();
      // Don't clear loading here - let auth handler manage the checkout flow
    } catch (error) {
      setLoading(false);
      clearCheckoutFlags();
    }
  };

  return (
    <>
      <Button
        onClick={handleCheckout}
        disabled={loading}
        className={`${className} relative`}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            {loading ? t('checkout.redirectingToStripe') : children}
          </>
        ) : (
          <>
            <ShoppingCart className="h-4 w-4 mr-2" />
            {children}
          </>
        )}
      </Button>

      <SmartLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => {
          setIsLoginModalOpen(false);
          setLoading(false);
          clearCheckoutFlags();
        }}
        onLoginSuccess={handleLoginSuccessForCheckout}
        title={t('training.checkoutButton.loginForPremium')}
        description={t('training.checkoutButton.loginDescription')}
      />
    </>
  );
};
