
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
      
      // Set checkout_flag if this is Google OAuth from SmartLoginModal
      if (provider === 'google' && source === 'smartlogin') {
        sessionStorage.setItem('checkout_flag', 'true');
        console.log('🔐 OAuth button: Set checkout_flag for SmartLoginModal Google OAuth');
        
        // Also store in localStorage as backup
        localStorage.setItem('checkout_flag_backup', 'true');
        console.log('🔐 OAuth button: Also stored checkout_flag_backup in localStorage');
        
        // Debug: Check what's in sessionStorage before OAuth
        console.log('🔐 OAuth button: SessionStorage before OAuth:', {
          checkout_flag: sessionStorage.getItem('checkout_flag'),
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
      
      // Debug: Check if checkout_flag is still there after OAuth call
      if (provider === 'google' && source === 'smartlogin') {
        console.log('🔐 OAuth button: SessionStorage after OAuth call:', {
          checkout_flag: sessionStorage.getItem('checkout_flag'),
          checkout_flag_backup: localStorage.getItem('checkout_flag_backup'),
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

  // Special styling for Google provider
  const isGoogle = provider === "google";
  
  return (
    <Button
      type="button"
      variant={isGoogle ? "default" : "outline"}
      className={`w-full ${
        isGoogle 
          ? "bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 hover:from-purple-600 hover:via-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 border-0 py-4 text-base font-medium rounded-xl backdrop-blur-sm relative overflow-hidden group" 
          : "py-2"
      }`}
      onClick={handleOAuthSignIn}
      disabled={loading}
    >
      {/* Soft glow effect for Google button */}
      {isGoogle && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
      )}
      
      {loading ? (
        <Loader2 className={`mr-3 ${isGoogle ? "h-5 w-5" : "h-4 w-4"} animate-spin relative z-10`} />
      ) : (
        <span className={`mr-3 ${isGoogle ? "text-xl relative z-10" : ""}`}>{getProviderIcon()}</span>
      )}
      <span className={`${isGoogle ? "relative z-10" : ""}`}>
        {loading ? t('auth.oauth.loading') : getProviderLabel()}
      </span>
    </Button>
  );
};
