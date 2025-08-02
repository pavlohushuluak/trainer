
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { detectBrowserLanguage } from '@/utils/languageSupport';

interface EmailAuthFormProps {
  onSuccess?: () => void;
  onPasswordResetClick: () => void;
}

export const EmailAuthForm = ({ onSuccess, onPasswordResetClick }: EmailAuthFormProps) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(true);
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleAuth = async () => {
    if (!email || !password || (isSignUp && !name)) {
      toast({
        title: t('auth.emailAuth.toasts.missingFields'),
        description: isSignUp ? t('auth.emailAuth.toasts.missingFieldsSignup') : t('auth.emailAuth.toasts.missingFieldsLogin'),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        // Use unified language detection
        const detectedLanguage = detectBrowserLanguage() || 'de';
        console.log('🔐 EmailAuthForm - detected language:', detectedLanguage);
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              full_name: name,
              preferred_language: detectedLanguage
            }
          }
        });
        
        if (error) throw error;

        if (data.session) {
          toast({
            title: t('auth.emailAuth.toasts.accountCreated'),
            description: t('auth.emailAuth.toasts.checkoutOpening')
          });
          
          setTimeout(() => {
            if (onSuccess) onSuccess();
          }, 1000);
        } else {
          toast({
            title: t('auth.emailAuth.toasts.signupSuccess'),
            description: t('auth.emailAuth.toasts.signupSuccessDescription')
          });
          setIsSignUp(false);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) throw error;
        
        if (data.session) {
          toast({
            title: t('auth.emailAuth.toasts.welcomeBack'),
            description: t('auth.emailAuth.toasts.checkoutOpening')
          });
          
          setTimeout(() => {
            if (onSuccess) onSuccess();
          }, 1000);
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        title: isSignUp ? t('auth.emailAuth.toasts.signupFailed') : t('auth.emailAuth.toasts.loginFailed'),
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-2">
          <Mail className="h-6 w-6" />
        </div>
        <CardTitle className="text-lg">
          {isSignUp ? t('auth.emailAuth.title.signup') : t('auth.emailAuth.title.login')}
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          {isSignUp 
            ? t('auth.emailAuth.description.signup')
            : t('auth.emailAuth.description.login')
          }
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {isSignUp && (
          <Input
            type="text"
            placeholder={t('auth.emailAuth.placeholders.name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}
        <Input
          type="email"
          placeholder={t('auth.emailAuth.placeholders.email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder={isSignUp ? t('auth.emailAuth.placeholders.password') : t('auth.emailAuth.placeholders.passwordLogin')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
        />
        
        {!isSignUp && (
          <div className="text-right">
            <Button
              variant="link"
              onClick={onPasswordResetClick}
              className="text-sm p-0 h-auto"
            >
              {t('auth.emailAuth.buttons.forgotPassword')}
            </Button>
          </div>
        )}
        
        <Button 
          onClick={handleAuth}
          className="w-full"
          disabled={loading}
        >
          {loading ? t('auth.emailAuth.buttons.processing') : isSignUp ? t('auth.emailAuth.buttons.createAccount') : t('auth.emailAuth.buttons.login')}
        </Button>
        
        <div className="text-center">
          <Button
            variant="link"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm"
          >
            {isSignUp 
              ? t('auth.emailAuth.buttons.switchToLogin')
              : t('auth.emailAuth.buttons.switchToSignup')
            }
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
