import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { SmartLoginModal } from '@/components/auth/SmartLoginModal';
import { useSmartLogin } from '@/hooks/useSmartLogin';
import { useTranslation } from 'react-i18next';

interface AmazonPayButtonProps {
  priceType: string;
  className?: string;
}

export const AmazonPayButton = ({ priceType, className = "" }: AmazonPayButtonProps) => {
  const { t } = useTranslation();
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const { 
    isLoginModalOpen, 
    setIsLoginModalOpen, 
    handleLoginSuccess 
  } = useSmartLogin({
    loginContext: 'checkout',
    redirectToCheckout: true,
    skipRedirect: true
  });

  const handleAmazonPayCheckout = async () => {
    setLoading(true);

    try {
      if (!user || !session) {
        setLoading(false);
        setIsLoginModalOpen(true);
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-amazon-pay-checkout', {
        body: { 
          priceType,
          successUrl: `${window.location.origin}/mein-tiertraining?success=true&payment=amazon`,
          cancelUrl: `${window.location.origin}/?canceled=true`
        }
      });

      if (error) throw error;

      if (data?.buttonConfig) {
        // Initialize Amazon Pay button
        initializeAmazonPayButton(data);
      } else {
        throw new Error(t('pricing.amazonPay.configError'));
      }
    } catch (error: any) {
      toast({
        title: t('pricing.amazonPay.error'),
        description: error.message || t('pricing.amazonPay.unknownError'),
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const initializeAmazonPayButton = (amazonPayData: any) => {
    // This would integrate with Amazon Pay's JavaScript SDK
    // For demonstration, we'll show a placeholder
    toast({
      title: t('pricing.amazonPay.title'),
      description: t('pricing.amazonPay.integrationPlaceholder'),
    });
    setLoading(false);
  };

  const handleLoginSuccessForCheckout = async () => {
    try {
      await handleLoginSuccess();
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleAmazonPayCheckout}
        disabled={loading}
        variant="outline"
        className={`${className} bg-[#FF9900] hover:bg-[#FF9900]/90 text-black border-[#FF9900] relative`}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16.8 8.5c0-.4-.1-.7-.4-1-.3-.3-.6-.4-1-.4h-2.9v3.6h2.9c.4 0 .7-.1 1-.4.3-.3.4-.6.4-1v-.8zm-6.2-4.5h2.8c1.2 0 2.1.3 2.7.9.6.6.9 1.4.9 2.4v.2c0 1-.3 1.8-.9 2.4-.6.6-1.5.9-2.7.9h-2.8V4zm8.9 8.2c.8-.8 1.2-1.9 1.2-3.2V8.3c0-1.3-.4-2.4-1.2-3.2C18.7 4.4 17.6 4 16.3 4h-5.8v16h3.3v-5.5h2.5c1.3 0 2.4-.4 3.2-1.2zm-11.1 3.3c-.4 0-.7-.3-.7-.7s.3-.7.7-.7.7.3.7.7-.3.7-.7.7zm-.7-3.5c0-.9.7-1.6 1.6-1.6s1.6.7 1.6 1.6-.7 1.6-1.6 1.6-1.6-.7-1.6-1.6z"/>
          </svg>
        )}
        {loading ? t('pricing.amazonPay.loading') : t('pricing.amazonPay.payWith')}
      </Button>

      <SmartLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => {
          setIsLoginModalOpen(false);
          setLoading(false);
        }}
        onLoginSuccess={handleLoginSuccessForCheckout}
        title={t('pricing.amazonPay.loginForPayment')}
        description={t('pricing.amazonPay.loginDescription')}
      />
    </>
  );
};