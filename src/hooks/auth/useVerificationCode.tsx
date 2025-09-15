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
      const errorMsg = t('auth.verificationCode.required');
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Call our custom verification endpoint
      const { data, error: verifyError } = await supabase.functions.invoke('verify-signup-code', {
        body: {
          email,
          code
        }
      });

      if (verifyError) {
        console.error('Verification error:', verifyError);
        const errorMessage = t('auth.verificationCode.invalid');
        setError(errorMessage);
        onError?.(errorMessage);
        return;
      }

      if (data?.success) {
        onSuccess?.();
      } else {
        let errorMessage = t('auth.verificationCode.invalid');
        
        if (data?.message?.includes('expired')) {
          errorMessage = t('auth.verificationCode.expired');
        } else if (data?.message?.includes('Invalid')) {
          errorMessage = t('auth.verificationCode.invalid');
        }
        
        setError(errorMessage);
        onError?.(errorMessage);
      }
    } catch (err) {
      console.error('Verification error:', err);
      const errorMessage = t('auth.verificationCode.invalid');
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
      // Call our custom verification email endpoint
      const { data, error: resendError } = await supabase.functions.invoke('send-verification-email', {
        body: {
          email
        }
      });

      if (resendError) {
        console.error('Resend error:', resendError);
        setError('Failed to resend verification code');
        onError?.('Failed to resend verification code');
        return;
      }

      if (!data?.success) {
        setError('Failed to resend verification code');
        onError?.('Failed to resend verification code');
        return;
      }

      // Success - code resent
    } catch (err) {
      console.error('Resend error:', err);
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
