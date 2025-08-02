
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { X, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PasswordResetFormProps {
  email: string;
  onEmailChange: (email: string) => void;
  onBack: () => void;
  onClose: () => void;
}

export const PasswordResetForm = ({ email, onEmailChange, onBack, onClose }: PasswordResetFormProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const handlePasswordReset = async () => {
    if (!email) {
      toast({
        title: t('auth.passwordReset.toasts.emailRequired'),
        description: t('auth.passwordReset.toasts.emailRequiredDescription'),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      
      // Use a simpler redirect URL that points to our auth callback
      const redirectTo = `${window.location.origin}/auth/callback`;
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo,
      });
      
      
      if (error) {
        throw error;
      }
      
      
      toast({
        title: t('auth.passwordReset.toasts.emailSent'),
        description: t('auth.passwordReset.toasts.emailSentDescription')
      });
      onBack();
    } catch (error: any) {
      
      let errorMessage = error.message;
      if (error.message?.includes('rate limit')) {
        errorMessage = t('auth.passwordReset.toasts.rateLimit');
      } else if (error.message?.includes('user not found')) {
        errorMessage = t('auth.passwordReset.toasts.userNotFound');
      } else if (error.message?.includes('email not confirmed')) {
        errorMessage = t('auth.passwordReset.toasts.emailNotConfirmed');
      }
      
      toast({
        title: t('auth.passwordReset.toasts.resetError'),
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-bold">{t('auth.passwordReset.title')}</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-muted-foreground">
            {t('auth.passwordReset.description')}
          </p>
          <Input
            type="email"
            placeholder={t('auth.passwordReset.placeholder')}
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
          />
          <Button 
            onClick={handlePasswordReset}
            className="w-full"
            disabled={loading}
          >
            {loading ? t('auth.passwordReset.buttons.sending') : t('auth.passwordReset.buttons.sendResetLink')}
          </Button>
        </div>
      </div>
    </div>
  );
};
