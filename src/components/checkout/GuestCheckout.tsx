
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CreditCard, Shield } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import { detectBrowserLanguage } from '@/utils/languageSupport';

interface GuestCheckoutProps {
  onClose: () => void;
}

export const GuestCheckout = ({ onClose }: GuestCheckoutProps) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const { toast } = useToast();
  const { t } = useTranslations();

  const handleGuestCheckout = async (priceType: 'monthly' | 'yearly') => {
    if (!name.trim() || !email.trim()) {
      toast({
        title: t('checkout.guest.toasts.missingFields'),
        description: t('checkout.guest.toasts.missingFieldsDescription'),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Temporären User für Guest Checkout erstellen
      const tempPassword = Math.random().toString(36).slice(-8);
      
      // Use unified language detection
      const detectedLanguage = detectBrowserLanguage() || 'de';
      console.log('🔐 GuestCheckout - detected language:', detectedLanguage);
      
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: tempPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/mein-tiertraining`,
          data: {
            full_name: name,
            guest_checkout: true,
            preferred_language: detectedLanguage
          }
        }
      });

      if (signUpError) throw signUpError;

      // Checkout-Session erstellen
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          priceType,
          successUrl: `${window.location.origin}/mein-tiertraining?success=true&guest=true&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/?canceled=true`,
          customerInfo: {
            name,
            email
          }
        }
      });

      if (error) throw error;
      
      window.location.href = data.url;
      
      toast({
        title: t('checkout.guest.toasts.redirectingToStripe'),
        description: t('checkout.guest.toasts.redirectingDescription'),
        duration: 2000
      });

      onClose();
    } catch (error: any) {
      console.error('Guest checkout error:', error);
      toast({
        title: t('checkout.guest.toasts.checkoutError'),
        description: error.message || t('checkout.guest.toasts.checkoutErrorDescription'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          {t('checkout.guest.title')}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {t('checkout.guest.description')}
        </p>
        
        {/* Geld-zurück-Garantie Hinweis */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
          <div className="flex items-center gap-2 text-green-800 mb-1">
            <Shield className="h-4 w-4" />
            <span className="font-medium text-sm">{t('checkout.guest.moneyBackGuarantee.title')}</span>
          </div>
          <p className="text-xs text-green-700">
            {t('checkout.guest.moneyBackGuarantee.description')}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          type="text"
          placeholder={t('checkout.guest.placeholders.name')}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          type="email"
          placeholder={t('checkout.guest.placeholders.email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        
        <div className="space-y-3">
          <Button 
            onClick={() => handleGuestCheckout('monthly')}
            className="w-full"
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {t('checkout.guest.buttons.monthly')}
          </Button>
          
          <Button 
            onClick={() => handleGuestCheckout('yearly')}
            className="w-full bg-cta hover:bg-cta/90"
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {t('checkout.guest.buttons.yearly')}
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground text-center">
          {t('checkout.guest.features.moneyBack')}<br/>
          {t('checkout.guest.features.emailAccess')}<br/>
          {t('checkout.guest.features.cancelAnytime')} • {t('checkout.guest.features.refundInfo')}
        </div>
      </CardContent>
    </Card>
  );
};

