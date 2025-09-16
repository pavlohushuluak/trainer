
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from '@/hooks/useTranslations';
import { getCheckoutFlags, debugCheckoutState, setCheckoutFlags } from '@/utils/checkoutStorage';

// Import checkout storage constants
const CHECKOUT_KEY = 'pendingCheckout';
const PRICE_TYPE_KEY = 'pendingCheckoutPriceType';
const TIMESTAMP_KEY = 'pendingCheckoutTimestamp';
const SESSION_ID_KEY = 'pendingCheckoutSessionId';
const ORIGIN_KEY = 'pendingCheckoutOrigin';

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

  // Enhanced: Redirect based on user role and OAuth source
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

    // Check OAuth source to determine redirect behavior
    // Add a small delay to ensure URL parameters are properly set
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const urlParams = new URLSearchParams(window.location.search);
    const urlSource = urlParams.get('source');
    const sessionSource = sessionStorage.getItem('oauth_source');
    const localStorageSource = localStorage.getItem('oauth_source_backup');
    
    // Try to get context information
    let contextSource = null;
    try {
      const contextData = localStorage.getItem('oauth_context');
      if (contextData) {
        const context = JSON.parse(contextData);
        contextSource = context.source;
        console.log('🔐 OAuth callback: Found context data:', context);
      }
    } catch (error) {
      console.log('🔐 OAuth callback: Error parsing context data:', error);
    }
    
    const oauthSource = urlSource || sessionSource || localStorageSource || contextSource;
    
    console.log('🔐 OAuth callback: Debug source detection:', {
      currentUrl: window.location.href,
      searchParams: window.location.search,
      urlSource: urlSource,
      sessionSource: sessionSource,
      localStorageSource: localStorageSource,
      contextSource: contextSource,
      finalSource: oauthSource,
      allSessionStorage: Object.keys(sessionStorage).reduce((acc, key) => {
        acc[key] = sessionStorage.getItem(key);
        return acc;
      }, {} as Record<string, string>),
      allLocalStorage: Object.keys(localStorage).reduce((acc, key) => {
        acc[key] = localStorage.getItem(key);
        return acc;
      }, {} as Record<string, string>)
    });
    
    // Clean up storage
    if (oauthSource) {
      sessionStorage.removeItem('oauth_source');
      localStorage.removeItem('oauth_source_backup');
      localStorage.removeItem('oauth_context');
    }

    // If OAuth came from SmartLoginModal, always redirect to homepage
    if (oauthSource === 'smartlogin') {
      console.log('🔐 OAuth callback: OAuth from SmartLoginModal, redirecting to homepage');
      // Use window.location.href for more reliable redirect after OAuth
      window.location.href = '/';
      return;
    }

    // For OAuth from LoginPage or other sources, use role-based redirect
    console.log('🔐 OAuth callback: OAuth from LoginPage, checking admin status for user:', userId);
    
    try {
      const isAdmin = await checkAdminStatus(userId);
      console.log('🔐 OAuth callback: Admin check result:', isAdmin);
      
      if (isAdmin) {
        console.log('🔐 OAuth callback: User is admin, redirecting to admin page');
        // Use window.location.href for more reliable redirect after OAuth
        window.location.href = '/admin/users';
      } else {
        console.log('🔐 OAuth callback: User is regular user, redirecting to mein-tiertraining');
        // Use window.location.href for more reliable redirect after OAuth
        window.location.href = '/mein-tiertraining';
      }
    } catch (error) {
      console.error('🔐 OAuth callback: Error checking admin status:', error);
      // Fallback to mein-tiertraining if admin check fails
      console.log('🔐 OAuth callback: Admin check failed, redirecting to mein-tiertraining as fallback');
      window.location.href = '/mein-tiertraining';
    }
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
      
      // Check for checkout data in URL parameters (from email confirmation)
      const checkout = searchParams.get('checkout');
      const priceType = searchParams.get('priceType');
      const sessionId = searchParams.get('sessionId');
      const origin = searchParams.get('origin');
      
      console.log('🔐 OAuth callback: Checking for checkout data in URL parameters:', {
        checkout,
        priceType,
        sessionId,
        origin,
        allParams: Object.fromEntries(searchParams.entries())
      });
      
      if (checkout === 'true' && priceType && sessionId) {
        console.log('🔐 OAuth callback: Found checkout data in URL parameters, restoring checkout flags');
        // Restore checkout flags from URL parameters with the original sessionId
        const timestamp = Date.now().toString();
        const originUrl = origin ? decodeURIComponent(origin) : window.location.origin;
        
        // Store checkout data with the original sessionId from the URL
        const checkoutData = {
          [CHECKOUT_KEY]: 'true',
          [PRICE_TYPE_KEY]: priceType,
          [TIMESTAMP_KEY]: timestamp,
          [SESSION_ID_KEY]: sessionId,
          [ORIGIN_KEY]: originUrl
        };
        
        // Store in localStorage and sessionStorage
        Object.entries(checkoutData).forEach(([key, value]) => {
          localStorage.setItem(key, value);
          sessionStorage.setItem(key, value);
        });
        
        console.log('🔐 OAuth callback: Checkout flags restored for email confirmation flow:', checkoutData);
      } else {
        console.log('🔐 OAuth callback: No checkout data found in URL parameters');
      }
      
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
