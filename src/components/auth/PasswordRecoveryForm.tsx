
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface PasswordRecoveryFormProps {
  onSuccess?: () => void;
}

export const PasswordRecoveryForm = ({ onSuccess }: PasswordRecoveryFormProps) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handlePasswordUpdate = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: t('auth.passwordRecovery.toasts.passwordRequired'),
        description: t('auth.passwordRecovery.toasts.passwordRequiredDescription'),
        variant: "destructive"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: t('auth.passwordRecovery.toasts.passwordsMismatch'),
        description: t('auth.passwordRecovery.toasts.passwordsMismatchDescription'),
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: t('auth.passwordRecovery.toasts.passwordTooShort'),
        description: t('auth.passwordRecovery.toasts.passwordTooShortDescription'),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      toast({
        title: t('auth.passwordRecovery.toasts.passwordUpdated'),
        description: t('auth.passwordRecovery.toasts.passwordUpdatedDescription')
      });

      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/mein-tiertraining', { replace: true });
      }
    } catch (error: any) {
      toast({
        title: t('auth.passwordRecovery.toasts.updateError'),
        description: error.message || t('auth.passwordRecovery.toasts.updateErrorDescription'),
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
          <CardTitle>{t('auth.passwordRecovery.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t('auth.passwordRecovery.labels.newPassword')}</label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t('auth.passwordRecovery.placeholders.newPassword')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">{t('auth.passwordRecovery.labels.confirmPassword')}</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('auth.passwordRecovery.placeholders.confirmPassword')}
            />
          </div>
          <Button 
            onClick={handlePasswordUpdate}
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {t('auth.passwordRecovery.buttons.updating')}
              </>
            ) : (
              t('auth.passwordRecovery.buttons.updatePassword')
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
