
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from '@/hooks/useTranslations';
import { getCheckoutFlags, debugCheckoutState } from '@/utils/checkoutStorage';

export const useAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { t } = useTranslations();
  const [isRecovery, setIsRecovery] = useState(false);
  const [processed, setProcessed] = useState(false);

  // Optimized admin check function
  const checkAdminStatus = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('admin_users')
        .select('role, is_active')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle();
      
      return !!data;
    } catch {
      return false;
    }
  };

  // SIMPLIFIED: Only redirect to home if checkout pending, otherwise do role-based redirect
  const redirectUserBasedOnRole = async (userId: string, successMessage?: string) => {
    
    console.log('🔐 OAuth callback: redirectUserBasedOnRole called for user:', userId);
    
    if (successMessage) {
      toast({
        title: t('auth.authCallback.emailConfirmed.title'),
        description: successMessage,
        duration: 3000
      });
    }

    // Debug checkout state
    debugCheckoutState();
    
    // Check for pending checkout - if found, redirect to home for auth handler processing
    const { hasPendingCheckout, data } = getCheckoutFlags();
    
    if (hasPendingCheckout && data) {
      console.log('🔐 OAuth callback: Pending checkout detected, redirecting to home');
      
      // Show success message but redirect to home
      if (successMessage) {
        toast({
          title: t('auth.authCallback.emailConfirmedCheckout.title'),
          description: t('auth.authCallback.emailConfirmedCheckout.description', { priceType: data.priceType }),
          duration: 3000
        });
      }
      
      // CRITICAL: Redirect to home with a delay to ensure flags are preserved
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 100);
      return;
    }

    // Normal role-based redirect (only if no pending checkout)
    const isAdmin = await checkAdminStatus(userId);
    const targetUrl = isAdmin ? '/admin/users' : '/mein-tiertraining';
    
    console.log('🔐 OAuth callback: Redirecting to:', targetUrl, 'isAdmin:', isAdmin);
    
    // Use window.location.href for more reliable redirect after OAuth
    window.location.href = targetUrl;
  };

  const handleAuthCallback = async () => {
    try {
      setProcessed(true);
      
      console.log('🔐 OAuth callback: Starting auth callback processing');
      
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      const errorCode = searchParams.get('error_code');
      const type = searchParams.get('type');
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const code = searchParams.get('code');
      
      // Debug checkout state at start
      debugCheckoutState();
      
      // Error handling
      if (error) {
        console.log('🔐 OAuth callback: Error detected:', error);
        let userMessage = t('auth.authCallback.loginFailed.description');
        
        if (error === 'access_denied') {
          userMessage = t('auth.authCallback.loginCancelled.description');
        } else if (errorCode === 'otp_expired' || error === 'expired') {
          userMessage = t('auth.authCallback.linkExpired.description');
        } else if (errorDescription) {
          userMessage = errorDescription;
        }
        
        toast({
          title: t('auth.authCallback.loginFailed.title'),
          description: userMessage,
          variant: "destructive"
        });
        
        // For OAuth errors, redirect to home instead of password reset
        if (error === 'access_denied') {
          navigate('/', { replace: true });
        } else {
          navigate('/password-reset', { replace: true });
        }
        return;
      }

      // Password Recovery
      if (type === 'recovery' || (accessToken && refreshToken)) {
        try {
          if (accessToken && refreshToken) {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            
            if (sessionError) throw sessionError;
          }
          
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError || !session) {
            throw new Error('Invalid recovery session');
          }
          
          setIsRecovery(true);
          return;
        } catch {
          toast({
            title: t('auth.authCallback.invalidLink.title'),
            description: t('auth.authCallback.invalidLink.description'),
            variant: "destructive"
          });
          navigate('/password-reset', { replace: true });
          return;
        }
      }

      // Email confirmation with code
      if (code) {
        console.log('🔐 OAuth callback: Processing code exchange');
        try {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError || !data.session?.user) {
            throw new Error('Code exchange failed');
          }
          
          console.log('🔐 OAuth callback: Code exchange successful for user:', data.user.email);
          
          // SIMPLIFIED: Always use role-based redirect (which checks for pending checkout)
          await redirectUserBasedOnRole(
            data.user.id, 
            t('auth.authCallback.emailConfirmed.description')
          );
          return;
        } catch (error) {
          console.log('🔐 OAuth callback: Code exchange failed:', error);
          toast({
            title: t('auth.authCallback.confirmationFailed.title'),
            description: t('auth.authCallback.confirmationFailed.description'),
            variant: "destructive"
          });
          navigate('/', { replace: true });
          return;
        }
      }

      // Fallback session check - wait a bit for OAuth session to be established
      console.log('🔐 OAuth callback: Waiting for session to be established...');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Increased delay for OAuth
      
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      console.log('🔐 OAuth callback: Session check result:', {
        hasSession: !!sessionData.session,
        hasUser: !!sessionData.session?.user,
        userEmail: sessionData.session?.user?.email,
        provider: sessionData.session?.user?.app_metadata?.provider
      });
      
      if (sessionError || !sessionData.session?.user) { 
        console.log('🔐 OAuth callback: No valid session found');
        // For OAuth, this might be normal - redirect to home and let auth state handler deal with it
        if (window.location.search.includes('provider=')) {
          navigate('/', { replace: true });
        } else {
          toast({
            title: t('auth.authCallback.loginRequired.title'),
            description: t('auth.authCallback.loginRequired.description'),
            variant: "destructive"
          });
          navigate('/', { replace: true });
        }
        return;
      }

      // Success message for OAuth users
      if (sessionData.session.user.app_metadata?.provider) {
        console.log('🔐 OAuth callback: OAuth user detected, showing success message');
        toast({
          title: t('auth.authCallback.loginSuccessful.title'),
          description: t('auth.authCallback.loginSuccessful.description'),
          duration: 3000
        });
      } else {
        toast({
          title: t('auth.authCallback.alreadyLoggedIn.title'),
          description: t('auth.authCallback.alreadyLoggedIn.description'),
          duration: 3000
        });
      }
      
      console.log('🔐 OAuth callback: Proceeding with role-based redirect');
      await redirectUserBasedOnRole(sessionData.session.user.id);
      
    } catch (error) {
      console.log('🔐 OAuth callback: Unexpected error:', error);
      toast({
        title: t('auth.authCallback.unexpectedError.title'),
        description: t('auth.authCallback.unexpectedError.description'),
        variant: "destructive"
      });
      navigate('/', { replace: true });
    }
  };

  useEffect(() => {
    if (processed) return;
    handleAuthCallback();
  }, [searchParams, navigate, toast, processed, t]);

  return { isRecovery, processed };
};
