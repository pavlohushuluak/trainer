import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslations } from '@/hooks/useTranslations';
import { useAuth } from '@/hooks/useAuth';

interface UseVerificationCodeProps {
  email: string;
  password?: string; // Password needed for auto-login after verification
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const useVerificationCode = ({ email, password, onSuccess, onError }: UseVerificationCodeProps) => {
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslations();
  const { signIn } = useAuth();

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
        // Auto-login the user after successful verification
        if (password) {
          try {
            console.log('Auto-logging in user after verification...');
            const { error: signInError } = await signIn(email, password);
            
            if (signInError) {
              console.error('Auto-login failed:', signInError);
              setError('Verification successful, but login failed. Please try logging in manually.');
              onError?.('Verification successful, but login failed. Please try logging in manually.');
              return;
            }
            
            console.log('Auto-login successful after verification');
          } catch (loginError) {
            console.error('Auto-login error:', loginError);
            setError('Verification successful, but login failed. Please try logging in manually.');
            onError?.('Verification successful, but login failed. Please try logging in manually.');
            return;
          }
        }
        
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
      // Use Supabase's built-in resend functionality
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email
      });

      if (resendError) {
        console.error('Resend error:', resendError);
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
