
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from '@/hooks/useTranslations';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PasswordReset() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslations();
  const navigate = useNavigate();

  const handlePasswordReset = async () => {
    if (!email) {
      toast({
        title: t('passwordReset.toasts.emailRequired'),
        description: t('passwordReset.toasts.emailRequiredDescription'),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      
      // Use the current domain for the redirect URL
      const redirectTo = `${window.location.origin}/auth/callback?type=recovery`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo,
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: t('passwordReset.toasts.emailSent'),
        description: t('passwordReset.toasts.emailSentDescription')
      });
    } catch (error: any) {
      
      let errorMessage = error.message;
      if (error.message?.includes('rate limit')) {
        errorMessage = t('passwordReset.toasts.rateLimit');
      } else if (error.message?.includes('user not found')) {
        errorMessage = t('passwordReset.toasts.userNotFound');
      } else if (error.message?.includes('email not confirmed')) {
        errorMessage = t('passwordReset.toasts.emailNotConfirmed');
      }
      
      toast({
        title: t('passwordReset.toasts.resetError'),
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle>{t('passwordReset.title')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('passwordReset.description')}
          </p>
          <div>
            <label className="block text-sm font-medium mb-2">{t('passwordReset.placeholder')}</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('passwordReset.placeholder')}
            />
          </div>
          <Button 
            onClick={handlePasswordReset}
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {t('passwordReset.buttons.sending')}
              </>
            ) : (
              t('passwordReset.buttons.sendResetLink')
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
