
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "@/hooks/useTranslations";

interface OAuthButtonProps {
  provider: "google" | "github";
  onSuccess?: (user?: any, isNewUser?: boolean) => void;
}

export const OAuthButton = ({ provider, onSuccess }: OAuthButtonProps) => {
  const { signInWithOAuth } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslations();

  const handleOAuthSignIn = async () => {
    setLoading(true);
    try {
      console.log('🔐 OAuth button: Starting OAuth sign-in for provider:', provider);
      
      const { data, error } = await signInWithOAuth(provider);
      
      if (error) throw error;
      
      console.log('🔐 OAuth button: OAuth sign-in initiated successfully');
      
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
