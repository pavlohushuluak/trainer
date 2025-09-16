
import { useState } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { useTranslations } from '@/hooks/useTranslations';

interface UseSmartLoginProps {
  onLoginSuccess?: () => void;
  redirectToCheckout?: boolean;
  loginContext?: 'checkout' | 'general' | 'dashboard' | 'admin';
  skipRedirect?: boolean;
  skipWelcomeToast?: boolean;
}

export const useSmartLogin = ({ 
  onLoginSuccess, 
  redirectToCheckout = false,
  loginContext = 'general',
  skipRedirect = false,
  skipWelcomeToast = false
}: UseSmartLoginProps = {}) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedPriceType, setSelectedPriceType] = useState<string | null>(null);
  const { user, session } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslations();

  const requireAuth = (action: () => void, priceType?: string) => {
    if (user && session) {
      // User ist eingeloggt - Aktion ausführen
      action();
    } else {
      // User ist nicht eingeloggt - Paket merken und Login Modal öffnen
      if (priceType) {
        setSelectedPriceType(priceType);
        // Store checkout data in simple format for homepage
        const checkoutData = {
          priceType: priceType,
          timestamp: Date.now(),
          source: 'homepage'
        };
        sessionStorage.setItem('homepage_checkout_data', JSON.stringify(checkoutData));
        console.log('🏠 Homepage: Saved checkout data for Google signin:', checkoutData);
      }
      setIsLoginModalOpen(true);
    }
  };

  const checkIfUserIsAdmin = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('role, is_active')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error || !data) return false;
      return data.role === 'admin' || data.role === 'support';
    } catch (error) {
      return false;
    }
  };

  const handleLoginSuccess = async () => {
    setIsLoginModalOpen(false);
    
    // Clear stored checkout data immediately to prevent duplicate processing
    const storedCheckoutData = sessionStorage.getItem('homepage_checkout_data');
    
    // Show success toast immediately (unless skipped)
    if (!skipWelcomeToast) {
      toast({
        title: t('auth.smartLogin.welcomeToast.title'),
        description: t('auth.smartLogin.welcomeToast.description'),
        duration: 3000
      });
    }
    
    // If skipRedirect is true (e.g., for checkout), don't redirect and let the caller handle the next action
    if (skipRedirect) {
      // Clear state but don't redirect
      setSelectedPriceType(null);
      sessionStorage.removeItem('homepage_checkout_data');
      
      // Custom onLoginSuccess ausführen falls vorhanden
      if (onLoginSuccess) {
        onLoginSuccess();
      }
      return;
    }
    
    // Clear sessionStorage only after we've used the values
    sessionStorage.removeItem('homepage_checkout_data');
    
    // Normal redirect logic for non-checkout contexts
    try {
      // Use stored values if available, otherwise use props
      let effectivePriceType = selectedPriceType;
      if (storedCheckoutData) {
        try {
          const parsed = JSON.parse(storedCheckoutData);
          effectivePriceType = parsed.priceType;
        } catch (error) {
          console.error('Error parsing stored checkout data:', error);
        }
      }
      const effectiveContext = loginContext;

      // Only redirect to admin if explicitly requested (loginContext === 'admin')
      if (effectiveContext === 'admin' && user) {
        const isAdmin = await checkIfUserIsAdmin(user.id);
        
        if (isAdmin) {
          window.location.href = '/admin/users';
          return;
        }
      }

      // For all other cases, redirect to /mein-tiertraining immediately
      window.location.href = '/';
      
      // Gespeichertes Paket zurücksetzen
      setSelectedPriceType(null);
      
      // Custom onLoginSuccess ausführen falls vorhanden
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (error) {
      console.error('🔄 Error during login redirect:', error);
      // Fallback: Immer zum Dashboard
      window.location.href = '/';
      
      // Clear state
      setSelectedPriceType(null);
      
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    }
  };

  return {
    isLoginModalOpen,
    setIsLoginModalOpen,
    requireAuth,
    handleLoginSuccess,
    selectedPriceType,
    isAuthenticated: !!(user && session),
    loginContext
  };
};
