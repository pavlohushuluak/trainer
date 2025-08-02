
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Mail, Loader2 } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import { detectBrowserLanguage } from '@/utils/languageSupport';

interface EmailSignUpTabProps {
  onClose: () => void;
}

export const EmailSignUpTab = ({ onClose }: EmailSignUpTabProps) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loginMode, setLoginMode] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslations();

  const handleQuickSignUp = async () => {
    if (!email || !password || (!loginMode && !name)) {
      toast({
        title: t('auth.emailSignUpTab.toasts.missingFields'),
        description: t('auth.emailSignUpTab.toasts.missingFieldsDescription'),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      if (loginMode) {
        // Login - warten auf Session
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        
        // Warten bis Session verfügbar ist
        if (data.session) {
          toast({
            title: t('auth.emailSignUpTab.toasts.loginSuccess.title'),
            description: t('auth.emailSignUpTab.toasts.loginSuccess.description')
          });
          
          // Direkt zum Tierbereich weiterleiten
          setTimeout(() => {
            window.location.href = '/mein-tiertraining';
            onClose();
          }, 1000);
        }
      } else {
        // Sign up - warten auf Session
        // Use unified language detection
        const detectedLanguage = detectBrowserLanguage();
        console.log('🔐 QuickSignUp EmailSignUpTab - detected language:', detectedLanguage);
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/mein-tiertraining`,
            data: {
              full_name: name,
              preferred_language: detectedLanguage
            }
          }
        });
        if (error) throw error;

        // Warten bis Session verfügbar ist
        if (data.session) {
          toast({
            title: t('auth.emailSignUpTab.toasts.signupSuccess.title'),
            description: t('auth.emailSignUpTab.toasts.signupSuccess.description')
          });
          
          // Direkt zum Tierbereich weiterleiten
          setTimeout(() => {
            window.location.href = '/mein-tiertraining';
            onClose();
          }, 1000);
        } else {
          toast({
            title: t('auth.emailSignUpTab.toasts.signupSuccess.title'),
            description: t('auth.emailSignUpTab.toasts.signupSuccess.emailConfirmation')
          });
          onClose();
        }
      }
    } catch (error: any) {
      toast({
        title: loginMode ? t('auth.emailSignUpTab.toasts.loginFailed') : t('auth.emailSignUpTab.toasts.signupFailed'),
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="text-center pb-4">
        <div className="mx-auto w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-2">
          <Mail className="h-6 w-6" />
        </div>
        <CardTitle className="text-xl">
          {loginMode ? t('auth.emailSignUpTab.title.login') : t('auth.emailSignUpTab.title.signup')}
        </CardTitle>
        <p className="text-muted-foreground">
          {loginMode 
            ? t('auth.emailSignUpTab.description.login')
            : t('auth.emailSignUpTab.description.signup')
          }
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!loginMode && (
          <Input
            type="text"
            placeholder={t('auth.emailSignUpTab.placeholders.name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}
        <Input
          type="email"
          placeholder={t('auth.emailSignUpTab.placeholders.email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder={loginMode ? t('auth.emailSignUpTab.placeholders.password') : t('auth.emailSignUpTab.placeholders.passwordSignup')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
        />
        
        <Button 
          onClick={handleQuickSignUp}
          className="w-full"
          disabled={loading}
        >
          {loading ? t('auth.emailSignUpTab.buttons.processing') : loginMode ? t('auth.emailSignUpTab.buttons.login') : t('auth.emailSignUpTab.buttons.signup')}
        </Button>
        
        <div className="text-center">
          <Button
            variant="link"
            onClick={() => setLoginMode(!loginMode)}
            className="text-sm"
          >
            {loginMode 
              ? t('auth.emailSignUpTab.buttons.switchToSignup')
              : t('auth.emailSignUpTab.buttons.switchToLogin')
            }
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
