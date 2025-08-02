import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from '@/hooks/useTranslations';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Mail } from 'lucide-react';
import { detectBrowserLanguage } from '@/utils/languageSupport';

export default function TestEmailAuth() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslations();

  const testRegistrationEmail = async () => {
    if (!email || !email.trim()) {
      toast({
        title: t('testEmailAuth.errors.emailRequired'),
        description: t('testEmailAuth.errors.validEmailRequired'),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      
      // Use unified language detection
      const detectedLanguage = detectBrowserLanguage() || 'de';
      console.log('🔐 TestEmailAuth - detected language:', detectedLanguage);
      
      // Always provide metadata to prevent "undefined values" error
      const metadata = {
        first_name: 'Test',
        last_name: 'User',
        preferred_language: detectedLanguage
      };
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: 'TestPassword123!',
        options: {
          emailRedirectTo: `${window.location.origin}/mein-tiertraining`,
          data: metadata
        }
      });

      if (error) {
        throw error;
      }

      if (data?.user && !data.user.email_confirmed_at) {
        toast({
          title: t('testEmailAuth.success.confirmationEmailSent'),
          description: t('testEmailAuth.success.confirmationEmailDescription', { email: email.trim() }),
          duration: 8000
        });
      } else if (data?.user?.email_confirmed_at) {
        toast({
          title: t('testEmailAuth.warnings.userAlreadyRegistered'),
          description: t('testEmailAuth.warnings.userAlreadyConfirmed'),
          duration: 5000
        });
      }
    } catch (error: any) {
      
      let errorMessage = t('testEmailAuth.errors.unknownError');
      
      if (error.message?.includes("User already registered")) {
        errorMessage = t('testEmailAuth.errors.userAlreadyExists');
      } else if (error.message?.includes("Invalid email")) {
        errorMessage = t('testEmailAuth.errors.invalidEmail');
      } else if (error.message?.includes("SMTP") || error.message?.includes("email")) {
        errorMessage = t('testEmailAuth.errors.smtpConfigurationError');
      } else if (error.message?.includes("Undefined values")) {
        errorMessage = t('testEmailAuth.errors.templateConfigurationError');
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: t('testEmailAuth.errors.emailTestFailed'),
        description: errorMessage,
        variant: "destructive",
        duration: 8000
      });
    } finally {
      setLoading(false);
    }
  };

  const testPasswordReset = async () => {
    if (!email || !email.trim()) {
      toast({
        title: t('testEmailAuth.errors.emailRequired'),
        description: t('testEmailAuth.errors.validEmailRequired'),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/mein-tiertraining`
        }
      );

      if (error) {
        throw error;
      }

      toast({
        title: t('testEmailAuth.success.passwordResetEmailSent'),
        description: t('testEmailAuth.success.passwordResetEmailDescription', { email: email.trim() }),
        duration: 8000
      });
    } catch (error: any) {
      
      let errorMessage = t('testEmailAuth.errors.unknownError');
      
      if (error.message?.includes("Undefined values")) {
        errorMessage = t('testEmailAuth.errors.templateConfigurationError');
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: t('testEmailAuth.errors.passwordResetFailed'),
        description: errorMessage,
        variant: "destructive",
        duration: 8000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            {t('testEmailAuth.title')}
          </CardTitle>
          <CardDescription>
            {t('testEmailAuth.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="test-email">{t('testEmailAuth.emailLabel')}</Label>
            <Input
              id="test-email"
              type="email"
              placeholder={t('testEmailAuth.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-3">
            <Button 
              onClick={testRegistrationEmail}
              disabled={loading || !email.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('testEmailAuth.sendingConfirmationEmail')}
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  {t('testEmailAuth.testRegistrationEmail')}
                </>
              )}
            </Button>

            <Button 
              onClick={testPasswordReset}
              disabled={loading || !email.trim()}
              variant="outline"
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('testEmailAuth.sendingResetEmail')}
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  {t('testEmailAuth.testPasswordResetEmail')}
                </>
              )}
            </Button>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">{t('testEmailAuth.testNotes.title')}</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• {t('testEmailAuth.testNotes.useRealEmail')}</li>
              <li>• {t('testEmailAuth.testNotes.checkSpam')}</li>
              <li>• {t('testEmailAuth.testNotes.emailsFromTierTrainer')}</li>
              <li>• {t('testEmailAuth.testNotes.checkSmtpConfig')}</li>
            </ul>
          </div>

          <div className="p-4 bg-red-50 rounded-lg">
            <h4 className="font-medium text-red-800 mb-2">{t('testEmailAuth.undefinedValuesFix.title')}</h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• {t('testEmailAuth.undefinedValuesFix.goToSupabase')}</li>
              <li>• {t('testEmailAuth.undefinedValuesFix.checkTemplateVariables')}</li>
              <li>• {t('testEmailAuth.undefinedValuesFix.ensureSiteUrl')}</li>
              <li>• {t('testEmailAuth.undefinedValuesFix.checkAuthConfig')}</li>
            </ul>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">{t('testEmailAuth.furtherTroubleshooting.title')}</h4>
            <p className="text-sm text-gray-600">
              {t('testEmailAuth.furtherTroubleshooting.description')}
            </p>
            <ul className="text-sm text-gray-600 mt-1 space-y-1">
              <li>• {t('testEmailAuth.furtherTroubleshooting.smtpSettings')}</li>
              <li>• {t('testEmailAuth.furtherTroubleshooting.resendDomainVerification')}</li>
              <li>• {t('testEmailAuth.furtherTroubleshooting.apiKeyPermissions')}</li>
              <li>• {t('testEmailAuth.furtherTroubleshooting.emailTemplatesConfigured')}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
