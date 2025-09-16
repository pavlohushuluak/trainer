
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "@/hooks/useTranslations";

interface OAuthButtonProps {
  provider: "google" | "github";
  onSuccess?: (user?: any, isNewUser?: boolean) => void;
  source?: string;
}

export const OAuthButton = ({ provider, onSuccess, source }: OAuthButtonProps) => {
  const { signInWithOAuth } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslations();

  const handleOAuthSignIn = async () => {
    setLoading(true);
    try {
      console.log('🔐 OAuth button: Starting OAuth sign-in for provider:', provider, 'with source:', source);
      
      // Set sign_in_google flag if this is Google OAuth from login page
      if (provider === 'google' && source === 'loginpage') {
        sessionStorage.setItem('sign_in_google', 'true');
        console.log('🔐 OAuth button: Set sign_in_google flag for login page Google OAuth');
        
        // Also store in localStorage as backup
        localStorage.setItem('sign_in_google_backup', 'true');
        console.log('🔐 OAuth button: Also stored sign_in_google_backup in localStorage');
        
        // Debug: Check what's in sessionStorage before OAuth
        console.log('🔐 OAuth button: SessionStorage before OAuth:', {
          sign_in_google: sessionStorage.getItem('sign_in_google'),
          allSessionStorage: Object.keys(sessionStorage).reduce((acc, key) => {
            acc[key] = sessionStorage.getItem(key);
            return acc;
          }, {} as Record<string, string>)
        });
      }
      
      // Set google_signin_checkout flag if this is Google OAuth from SmartLoginModal
      if (provider === 'google' && source === 'smartlogin') {
        sessionStorage.setItem('google_signin_checkout', 'true');
        console.log('🔐 OAuth button: Set google_signin_checkout flag for SmartLoginModal Google OAuth');
        
        // Also store in localStorage as backup
        localStorage.setItem('google_signin_checkout_backup', 'true');
        console.log('🔐 OAuth button: Also stored google_signin_checkout_backup in localStorage');
        
        // Debug: Check what's in sessionStorage before OAuth
        console.log('🔐 OAuth button: SessionStorage before OAuth:', {
          google_signin_checkout: sessionStorage.getItem('google_signin_checkout'),
          allSessionStorage: Object.keys(sessionStorage).reduce((acc, key) => {
            acc[key] = sessionStorage.getItem(key);
            return acc;
          }, {} as Record<string, string>)
        });
      }
      
      const { data, error } = await signInWithOAuth(provider, source);
      
      if (error) throw error;
      
      console.log('🔐 OAuth button: OAuth sign-in initiated successfully');
      
      // Debug: Check if flag is still there after OAuth call
      if (provider === 'google' && source === 'loginpage') {
        console.log('🔐 OAuth button: SessionStorage after OAuth call:', {
          sign_in_google: sessionStorage.getItem('sign_in_google'),
          sign_in_google_backup: localStorage.getItem('sign_in_google_backup'),
          allSessionStorage: Object.keys(sessionStorage).reduce((acc, key) => {
            acc[key] = sessionStorage.getItem(key);
            return acc;
          }, {} as Record<string, string>)
        });
      }
      
      toast({
        title: t('auth.oauth.preparing'),
        description: t('auth.oauth.redirecting')
      });
      
      // OAuth success will be handled automatically after redirect
      // The redirect is managed by the auth operations and callback
      
    } catch (error: any) {
      console.error('🔐 OAuth button: OAuth error:', error);
      toast({
        title: t('auth.oauth.failed'),
        description: error.message || t('auth.oauth.error'),
        variant: "destructive"
      });
    } finally {
      localStorage.setItem('alreadySignedUp', 'true');
      setLoading(false);
    }
  };

  const getProviderLabel = () => {
    switch (provider) {
      case "google":
        return t('auth.oauth.providers.google');
      case "github":
        return t('auth.oauth.providers.github');
      default:
        return t('auth.oauth.providers.default');
    }
  };

  const getProviderIcon = () => {
    switch (provider) {
      case "google":
        return "🚀";
      case "github":
        return "🐙";
      default:
        return "🔐";
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleOAuthSignIn}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <span className="mr-2">{getProviderIcon()}</span>
      )}
      {loading ? t('auth.oauth.loading') : getProviderLabel()}
    </Button>
  );
};
