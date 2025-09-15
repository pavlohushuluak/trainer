import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { VerificationCodeInput } from '@/components/auth/VerificationCodeInput';
import { useTranslations } from '@/hooks/useTranslations';
import { X, Mail, RefreshCw } from 'lucide-react';

interface VerificationCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onVerify: (code: string) => Promise<void>;
  onResend: () => Promise<void>;
  loading?: boolean;
  error?: string;
}

export const VerificationCodeModal: React.FC<VerificationCodeModalProps> = ({
  isOpen,
  onClose,
  email,
  onVerify,
  onResend,
  loading = false,
  error = ''
}) => {
  const { t } = useTranslations();
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verificationCode, setVerificationCode] = useState('');

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    
    try {
      await onResend();
      setResendCooldown(60); // 60 second cooldown
    } catch (error) {
      console.error('Error resending verification code:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
            <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <DialogTitle className="text-xl font-semibold">
            {t('auth.verificationCode.title')}
          </DialogTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {t('auth.verificationCode.description')}
          </p>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
            {email}
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Verification Code Input */}
          <VerificationCodeInput
            id="verification-code-modal"
            label=""
            value={verificationCode}
            onChange={setVerificationCode}
            onVerify={onVerify}
            onResend={handleResend}
            loading={loading}
            resendLoading={loading}
            resendCooldown={resendCooldown}
            error={error}
            email={email}
          />

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400 text-center">
                {error}
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              {t('auth.verificationCode.steps.title')}
            </h4>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>• {t('auth.verificationCode.steps.step1')}</li>
              <li>• {t('auth.verificationCode.steps.step2')}</li>
              <li>• {t('auth.verificationCode.steps.step3')}</li>
            </ul>
          </div>

          {/* Close Button */}
          <div className="flex justify-center pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-4 w-4 mr-1" />
              {t('auth.verificationCode.close')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
