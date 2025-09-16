
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

    // If OAuth came from SmartLoginModal, check for pending checkout data
    if (oauthSource === 'smartlogin') {
      console.log('🔐 OAuth callback: OAuth from SmartLoginModal, checking for pending checkout data');
      console.log('🔐 OAuth callback: Current URL:', window.location.href);
      console.log('🔐 OAuth callback: User ID:', userId);
      
      // Check for pending checkout data from SmartLoginModal
      const pendingPriceType = sessionStorage.getItem('pendingPriceType');
      const pendingLoginContext = sessionStorage.getItem('pendingLoginContext');
      
      console.log('🔐 OAuth callback: SmartLoginModal checkout data:', {
        pendingPriceType,
        pendingLoginContext,
        userId,
        allSessionStorage: Object.keys(sessionStorage).reduce((acc, key) => {
          acc[key] = sessionStorage.getItem(key);
          return acc;
        }, {} as Record<string, string>)
      });
      
      // If there's pending checkout data, redirect directly to checkout
      if (pendingPriceType && pendingLoginContext === 'checkout') {
        console.log('🔐 OAuth callback: Found pending checkout data, redirecting directly to checkout');
        
        // For SmartLoginModal checkout, we can proceed even without a valid user ID
        // The create-checkout function will handle the user creation/authentication
        console.log('🔐 OAuth callback: Proceeding with SmartLoginModal checkout, userId:', userId);
        
        // Call create-checkout directly from here
        try {
          const currentLanguage = localStorage.getItem('i18nextLng') || 'de';
          
          console.log('🔐 OAuth callback: Creating checkout with data:', {
            priceType: pendingPriceType,
            userId,
            currentLanguage
          });
          
          // Get the current user email from the session
          const { data: { session } } = await supabase.auth.getSession();
          const userEmail = session?.user?.email;
          
          if (!userEmail) {
            console.error('🔐 OAuth callback: No user email available for checkout creation');
            window.location.href = '/';
            return;
          }
          
          console.log('🔐 OAuth callback: Creating checkout with user email:', userEmail);
          
          const { data, error } = await supabase.functions.invoke('create-checkout', {
            body: {
              priceType: pendingPriceType,
              successUrl: `${window.location.origin}/mein-tiertraining?success=true&session_id={CHECKOUT_SESSION_ID}&user_email=${encodeURIComponent(userEmail)}`,
              cancelUrl: `${window.location.origin}/`,
              language: currentLanguage,
              customerInfo: {
                name: userEmail.split('@')[0] || 'User'
              },
              userEmail: userEmail // Pass user email explicitly
            }
          });

          if (error) {
            console.error('🔐 OAuth callback: Error creating checkout:', error);
            // Fallback to homepage on error
            window.location.href = '/';
          } else if (data?.url) {
            console.log('🔐 OAuth callback: Checkout created successfully, redirecting to:', data.url);
            // Clear the pending data before redirecting
            sessionStorage.removeItem('pendingPriceType');
            sessionStorage.removeItem('pendingLoginContext');
            sessionStorage.removeItem('checkout_flag');
            localStorage.removeItem('checkout_flag_backup');
            window.location.href = data.url;
          } else {
            console.error('🔐 OAuth callback: No checkout URL returned');
            window.location.href = '/';
          }
        } catch (error) {
          console.error('🔐 OAuth callback: Exception creating checkout:', error);
          window.location.href = '/';
        }
        return;
      } else {
        console.log('🔐 OAuth callback: No pending checkout data, redirecting to homepage');
        // Use window.location.href for more reliable redirect after OAuth
        window.location.href = '/';
        return;
      }
    }

    // For OAuth from LoginPage or other sources, use role-based redirect
    console.log('🔐 OAuth callback: OAuth from LoginPage, checking admin status for user:', userId);
    
    // Check if this was a Google signin from login page
    const signInGoogleSession = sessionStorage.getItem('sign_in_google');
    const signInGoogleLocal = localStorage.getItem('sign_in_google_backup');
    
    // Also check OAuth context for the flag
    let signInGoogleContext = null;
    let checkoutFlagContext = null;
    try {
      const contextData = localStorage.getItem('oauth_context');
      if (contextData) {
        const context = JSON.parse(contextData);
        signInGoogleContext = context.sign_in_google;
        checkoutFlagContext = context.checkout_flag;
      }
    } catch (error) {
      console.log('🔐 OAuth callback: Error parsing OAuth context:', error);
    }
    
    const signInGoogle = signInGoogleSession || signInGoogleLocal || signInGoogleContext;
    const checkoutFlag = sessionStorage.getItem('checkout_flag') || localStorage.getItem('checkout_flag_backup') || checkoutFlagContext;
    
    console.log('🔐 OAuth callback: flag check:', {
      signInGoogle: {
        sessionStorage: signInGoogleSession,
        localStorage: signInGoogleLocal,
        oauthContext: signInGoogleContext,
        finalValue: signInGoogle
      },
      checkoutFlag: {
        sessionStorage: sessionStorage.getItem('checkout_flag'),
        localStorage: localStorage.getItem('checkout_flag_backup'),
        oauthContext: checkoutFlagContext,
        finalValue: checkoutFlag
      },
      allSessionStorage: Object.keys(sessionStorage).reduce((acc, key) => {
        acc[key] = sessionStorage.getItem(key);
        return acc;
      }, {} as Record<string, string>),
      allLocalStorage: Object.keys(localStorage).reduce((acc, key) => {
        if (key.includes('sign_in_google') || key.includes('oauth')) {
          acc[key] = localStorage.getItem(key);
        }
        return acc;
      }, {} as Record<string, string>)
    });
    
    // If userId is 'oauth-no-session', skip admin check and use default redirect
    if (userId === 'oauth-no-session') {
      console.log('🔐 OAuth callback: No session available, using default redirect to mein-tiertraining');
      window.location.href = '/mein-tiertraining';
      return;
    }
    
    try {
    const isAdmin = await checkAdminStatus(userId);
      console.log('🔐 OAuth callback: Admin check result:', isAdmin);
    
      if (isAdmin) {
        console.log('🔐 OAuth callback: User is admin, redirecting to admin page');
    // Use window.location.href for more reliable redirect after OAuth
        window.location.href = '/admin/users';
      } else {
        // For normal users, check if they signed in with Google from login page
        if (signInGoogle === 'true') {
          console.log('🔐 OAuth callback: Normal user with Google signin from login page, redirecting to mein-tiertraining');
          // Remove both flags after using them
          sessionStorage.removeItem('sign_in_google');
          localStorage.removeItem('sign_in_google_backup');
          window.location.href = '/mein-tiertraining';
        } else {
          console.log('🔐 OAuth callback: Normal user without Google signin flag, redirecting to homepage');
          window.location.href = '/';
        }
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
      await new Promise(resolve => setTimeout(resolve, 2000)); // Increased delay for OAuth
      
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      console.log('🔐 OAuth callback: Session check result:', {
        hasSession: !!sessionData.session,
        hasUser: !!sessionData.session?.user,
        userEmail: sessionData.session?.user?.email,
        provider: sessionData.session?.user?.app_metadata?.provider
      });
      
      if (sessionError || !sessionData.session?.user) { 
        console.log('🔐 OAuth callback: No valid session found');
        // For OAuth, this might be normal - check source and redirect accordingly
        if (window.location.search.includes('provider=')) {
          console.log('🔐 OAuth callback: OAuth detected but no session, waiting for session establishment');
          
          // Wait for session to be established before proceeding
          let attempts = 0;
          const maxAttempts = 10;
          const checkInterval = 500; // 500ms intervals
          
          const waitForSession = async () => {
            attempts++;
            console.log(`🔐 OAuth callback: Waiting for session establishment (attempt ${attempts}/${maxAttempts})`);
            
            const { data: { session } } = await supabase.auth.getSession();
            
            if (session?.user) {
              console.log('🔐 OAuth callback: Session established, proceeding with redirect:', session.user.email);
              await redirectUserBasedOnRole(session.user.id);
              return;
            }
            
            if (attempts < maxAttempts) {
              setTimeout(waitForSession, checkInterval);
            } else {
              console.log('🔐 OAuth callback: Session establishment timeout, redirecting to homepage');
              window.location.href = '/';
            }
          };
          
          // Start waiting for session
          setTimeout(waitForSession, checkInterval);
          return;
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
