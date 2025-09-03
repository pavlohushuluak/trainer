import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useTranslations } from '@/hooks/useTranslations';
import { Loader2, Shield, Eye, EyeOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordValidation {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
  match: boolean;
}

export const PasswordChangeModal = ({ isOpen, onClose }: PasswordChangeModalProps) => {
  const { user } = useAuth();
  const { t } = useTranslations();
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [step, setStep] = useState<'newPassword' | 'currentPassword'>('newPassword');

  // Password validation rules
  const validatePassword = (password: string): PasswordValidation => ({
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    match: passwordData.newPassword === passwordData.confirmPassword && passwordData.confirmPassword.length > 0
  });

  const validation = validatePassword(passwordData.newPassword);
  
  // Form validation based on current step
  const isNewPasswordValid = passwordData.newPassword.length > 0 &&
                            passwordData.confirmPassword.length > 0 &&
                            passwordData.newPassword === passwordData.confirmPassword;
  
  const isCurrentPasswordValid = passwordData.currentPassword.length > 0;
  
  const isFormValid = step === 'newPassword' ? isNewPasswordValid : isCurrentPasswordValid;

  const handleInputChange = (field: keyof PasswordData, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleNextStep = () => {
    if (isNewPasswordValid) {
      setStep('currentPassword');
    }
  };

  const handleBackStep = () => {
    setStep('newPassword');
    setPasswordData(prev => ({ ...prev, currentPassword: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isFormValid) return;

    if (step === 'newPassword') {
      // Move to current password step
      handleNextStep();
      return;
    }

    // Step 2: Verify current password and update
    setIsLoading(true);

    try {
      // First, verify the current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: passwordData.currentPassword
      });

      if (signInError) {
        toast({
          title: t('settings.security.error.currentPasswordTitle'),
          description: t('settings.security.error.currentPasswordDescription'),
          variant: 'destructive'
        });
        return;
      }

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (updateError) {
        toast({
          title: t('settings.security.error.updatingTitle'),
          description: t('settings.security.error.updatingDescription'),
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: t('settings.security.success.title'),
        description: t('settings.security.success.description')
      });

      // Reset form and close modal
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setStep('newPassword');
      onClose();
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: t('settings.security.error.updatingTitle'),
        description: t('settings.security.error.updatingDescription'),
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setStep('newPassword');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t('settings.security.changePassword')}
          </DialogTitle>
          <DialogDescription>
            {step === 'newPassword' 
              ? t('settings.security.changePasswordDescription')
              : t('settings.security.enterCurrentPassword')
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 'newPassword' ? (
            <>
              {/* Step 1: New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword">{t('settings.security.newPassword')}</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    placeholder={t('settings.security.newPasswordPlaceholder')}
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('new')}
                    disabled={isLoading}
                  >
                    {showPasswords.new ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('settings.security.confirmPassword')}</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder={t('settings.security.confirmPasswordPlaceholder')}
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('confirm')}
                    disabled={isLoading}
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Step 2: Current Password */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword">{t('settings.security.currentPassword')}</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                    placeholder={t('settings.security.currentPasswordPlaceholder')}
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('current')}
                    disabled={isLoading}
                  >
                    {showPasswords.current ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Password Hints */}
          <div className="space-y-3 p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200/50 dark:border-blue-800/30">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              {t('settings.security.passwordHints')}
            </h4>
            <p className="text-xs text-blue-600 dark:text-blue-400 mb-3">
              {t('settings.security.passwordHintsDescription')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                <div className={`h-2 w-2 rounded-full ${validation.length ? 'bg-green-500' : 'bg-blue-400'}`} />
                {t('settings.security.requirement.length')}
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                <div className={`h-2 w-2 rounded-full ${validation.uppercase ? 'bg-green-500' : 'bg-blue-400'}`} />
                {t('settings.security.requirement.uppercase')}
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                <div className={`h-2 w-2 rounded-full ${validation.lowercase ? 'bg-green-500' : 'bg-blue-400'}`} />
                {t('settings.security.requirement.lowercase')}
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                <div className={`h-2 w-2 rounded-full ${validation.number ? 'bg-green-500' : 'bg-blue-400'}`} />
                {t('settings.security.requirement.number')}
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                <div className={`h-2 w-2 rounded-full ${validation.special ? 'bg-green-500' : 'bg-blue-400'}`} />
                {t('settings.security.requirement.special')}
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                <div className={`h-2 w-2 rounded-full ${validation.match ? 'bg-green-500' : 'bg-blue-400'}`} />
                {t('settings.security.requirement.match')}
              </div>
            </div>
          </div>

          <DialogFooter>
            {step === 'newPassword' ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !isFormValid}
                  className="min-w-[100px]"
                >
                  {t('common.next')}
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBackStep}
                  disabled={isLoading}
                >
                  {t('common.back')}
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !isFormValid}
                  className="min-w-[100px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('settings.security.updating')}
                    </>
                  ) : (
                    t('settings.security.updatePassword')
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
