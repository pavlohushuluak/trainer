
import { useState, useEffect, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useOAuthProfileHandler } from './useOAuthProfileHandler';
import { getCheckoutFlags, clearCheckoutFlags, debugCheckoutState } from '@/utils/checkoutStorage';

export const useAuthStateHandler = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const { handleOAuthProfile } = useOAuthProfileHandler();

  // Use ref to track if component is mounted
  const mountedRef = useRef(true);

  const trackSignUp = useCallback(() => {
    // Track sign up with GTM
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({ event: 'sign_up' });
    }
  }, []);

  const checkIfUserIsAdmin = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('role, is_active')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error || !data) return false;
      return data.role === 'admin' || data.role === 'support';
    } catch (error) {
      return false;
    }
  }, []);

  const executeCheckoutRedirect = useCallback(async (priceType: string, userEmail: string) => {

    try {
      // Get current language from localStorage or default to 'de'
      const currentLanguage = localStorage.getItem('i18nextLng') || 'de';
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          priceType: priceType,
          successUrl: `${window.location.origin}/mein-tiertraining?success=true&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/?canceled=true`,
          language: currentLanguage
        }
      });

      if (error) {
        clearCheckoutFlags();

        const { toast } = await import('@/hooks/use-toast');
        toast({
          title: 'Checkout Error',
          description: 'There was an error processing your checkout. Please try again.',
          variant: "destructive",
        });

        window.location.href = '/#pricing';
      } else if (data?.url) {
        clearCheckoutFlags();

        // IMMEDIATE redirect to Stripe
        window.location.href = data.url;
      } else {
        clearCheckoutFlags();
        window.location.href = '/#pricing';
      }
    } catch (error) {
      clearCheckoutFlags();
      window.location.href = '/#pricing';
    }
  }, []);

  const handleSignedIn = useCallback(async (session: Session, skipAutoRedirect = false) => {
    const user = session.user;

    console.log('🔐 handleSignedIn called:', {
      userEmail: user.email,
      skipAutoRedirect,
      currentPath: window.location.pathname,
      timestamp: new Date().toISOString()
    });

    try {
      // Debug checkout state
      debugCheckoutState();

      // PRIORITY 1: Check for pending checkout FIRST - highest priority
      const { hasPendingCheckout, data: checkoutData } = getCheckoutFlags();

      // Track sign up for new users
      const userCreatedAt = new Date(user.created_at);
      const now = new Date();
      const timeDiff = now.getTime() - userCreatedAt.getTime();
      const isNewUser = timeDiff < 60000; // Less than 1 minute ago = new user

      if (isNewUser) {
        trackSignUp();
      }

      // Skip redirects for callback and admin login pages
      const currentPath = window.location.pathname;

      if (currentPath.includes('/auth/callback') ||
        currentPath === '/admin/login') {
        console.log('🔐 Skipping redirect - on callback or admin login page');
        return;
      }

      // If user is already on an admin page, skip admin check to avoid duplicate queries
      if (currentPath.startsWith('/admin')) {
        console.log('🔐 User already on admin page, skipping admin check and redirect logic');
        return;
      }

      // PRIORITY 1: Pending checkout - IMMEDIATE execution, BLOCK all other redirects
      if (hasPendingCheckout && checkoutData) {

        // Add small delay to ensure session is fully established
        setTimeout(() => {
          executeCheckoutRedirect(checkoutData.priceType, user.email);
        }, 100);

        // CRITICAL: STOP HERE - absolutely no other redirects when checkout is pending
        return;
      }

      // Handle OAuth profile updates first (before redirects)
      if (user.app_metadata?.provider) {
        try {
          await handleOAuthProfile(user);
        } catch (error) {
          console.warn('Error handling OAuth profile:', error);
          // Continue with redirect even if profile update fails
        }
      }

      // Skip other redirects if skipAutoRedirect is true or if already on target page
      if (skipAutoRedirect || currentPath !== '/login') {
        console.log('🔐 Skipping redirect - skipAutoRedirect or already on target page');
        return;
      }

      // PRIORITY 2: Admin redirect (only if no pending checkout)
      const isAdmin = await checkIfUserIsAdmin(user.id);

      console.log('🔐 Redirect decision:', {
        isAdmin,
        currentPath,
        targetPath: isAdmin ? '/admin/users' : '/mein-tiertraining'
      });

      if (isAdmin && !currentPath.startsWith('/admin')) {
        console.log('🔐 Redirecting admin to /admin/users');
        window.location.href = '/admin/users';
      } else if (!isAdmin && currentPath.startsWith('/admin')) {
        console.log('🔐 Redirecting non-admin away from admin area to /mein-tiertraining');
        window.location.href = '/mein-tiertraining';
      } else {
        window.location.href = '/mein-tiertraining';
        console.log('🔐 No redirect needed - user is in correct location');
      }

    } catch (error) {
      console.warn('Error in handleSignedIn:', error);
      // Fallback redirect to main training page
      if (!window.location.pathname.includes('/auth/callback')) {
        window.location.href = '/mein-tiertraining';
      }
    }
  }, [trackSignUp, handleOAuthProfile, checkIfUserIsAdmin, executeCheckoutRedirect]);

  useEffect(() => {
    mountedRef.current = true;
    let hasInitialized = false;
    let processedSessionId: string | null = null;

    console.log('🔐 useAuthStateHandler: Initializing auth state handler');

    // Single auth state listener - this will handle both initial session and subsequent changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mountedRef.current) return;

        console.log(`🔐 Auth state change:`, {
          event,
          userEmail: session?.user?.email,
          hasInitialized,
          processedSessionId: processedSessionId === session?.user?.id
        });

        // Prevent duplicate processing of the same session
        const sessionId = session?.user?.id || 'no-user';
        if (event === 'INITIAL_SESSION' && processedSessionId === sessionId) {
          console.log('🔐 Skipping duplicate INITIAL_SESSION for same user');
          return;
        }

        // Batch state updates to prevent multiple re-renders
        const newUser = session?.user ?? null;
        const shouldInitialize = !hasInitialized;

        if (shouldInitialize) {
          hasInitialized = true;
          setSession(session);
          setUser(newUser);
          setLoading(false);
          setInitialized(true);
          console.log('🔐 Auth state handler initialized');
        } else {
          // Only update if values actually changed
          setSession(prevSession => {
            if (prevSession?.access_token !== session?.access_token) {
              return session;
            }
            return prevSession;
          });

          setUser(prevUser => {
            if (prevUser?.id !== newUser?.id) {
              return newUser;
            }
            return prevUser;
          });
        }

        // Handle specific events
        if (event === 'SIGNED_IN' && session?.user) {
          processedSessionId = sessionId;
          console.log('🔐 User signed in, handling redirect logic');
          try {
            await handleSignedIn(session);
          } catch (error) {
            console.warn('Error in auth state change handler:', error);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('🔓 User signed out');
          processedSessionId = null;

          // Only update state if user was actually signed in
          setUser(prevUser => {
            if (prevUser !== null) {
              return null;
            }
            return prevUser;
          });

          setSession(prevSession => {
            if (prevSession !== null) {
              return null;
            }
            return prevSession;
          });

          // Redirect from protected pages after logout
          const currentPath = window.location.pathname;
          if (currentPath.startsWith('/admin') ||
            currentPath.startsWith('/mein-tiertraining') ||
            currentPath.startsWith('/settings') ||
            currentPath.startsWith('/chat')) {
            console.log('🔓 Redirecting from protected page after logout');
            window.location.replace('/');
          }
        } else if (event === 'INITIAL_SESSION' && session?.user) {
          // Handle initial session (existing user)
          processedSessionId = sessionId;
          console.log('🔐 Initial session found, handling redirect logic');
          try {
            await handleSignedIn(session, true);
          } catch (error) {
            console.warn('Error handling initial session:', error);
          }
        }
      }
    );

    // Single timeout fallback for safety
    const timeoutId = setTimeout(() => {
      if (mountedRef.current && !hasInitialized) {
        console.log('⚠️ Auth initialization timeout - forcing loading to false');
        hasInitialized = true;
        setLoading(false);
        setInitialized(true);
      }
    }, 3000); // 3 second timeout

    return () => {
      mountedRef.current = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
      console.log('🔐 useAuthStateHandler: Cleanup completed');
    };
  }, [handleSignedIn]);

  return { user, session, loading };
};
