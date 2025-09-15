import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslations } from '@/hooks/useTranslations';

interface UseVerificationCodeProps {
  email: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const useVerificationCode = ({ email, onSuccess, onError }: UseVerificationCodeProps) => {
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslations();

  const verifyCode = useCallback(async (code: string) => {
    if (!code || code.length !== 6) {
      const errorMsg = t('validation.verificationCode.required');
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // For now, we'll use Supabase's built-in verification
      // In a real implementation, you'd call your backend to verify the code
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'signup'
      });

      if (verifyError) {
        let errorMessage = t('validation.verificationCode.invalid');
        
        if (verifyError.message.includes('expired')) {
          errorMessage = t('validation.verificationCode.expired');
        } else if (verifyError.message.includes('invalid')) {
          errorMessage = t('validation.verificationCode.invalid');
        }
        
        setError(errorMessage);
        onError?.(errorMessage);
        return;
      }

      if (data?.user) {
        onSuccess?.();
      }
    } catch (err) {
      const errorMessage = t('validation.verificationCode.invalid');
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [email, onSuccess, onError, t]);

  const resendCode = useCallback(async () => {
    setResendLoading(true);
    setError('');

    try {
      // Resend the signup email with verification code
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email
      });

      if (resendError) {
        setError(resendError.message);
        onError?.(resendError.message);
        return;
      }

      // Success - code resent
    } catch (err) {
      const errorMessage = 'Failed to resend verification code';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setResendLoading(false);
    }
  }, [email, onError]);

  const clearError = useCallback(() => {
    setError('');
  }, []);

  return {
    verifyCode,
    resendCode,
    loading,
    resendLoading,
    error,
    clearError
  };
};
