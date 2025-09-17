
import { useState, useEffect, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useOAuthProfileHandler } from './useOAuthProfileHandler';
import { getCheckoutFlags } from '@/utils/checkoutStorage';
import { useGTM } from '@/hooks/useGTM';

export const useAuthStateHandler = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const { handleOAuthProfile } = useOAuthProfileHandler();
  const { trackSignUp, trackLogin } = useGTM();

  // Use ref to track if component is mounted
  const mountedRef = useRef(true);
  
  // Track processed sessions to prevent duplicate tracking
  const processedSessionsRef = useRef(new Set<string>());

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


  const handleSignedIn = useCallback(async (session: Session, skipAutoRedirect = false) => {
    const user = session.user;

    console.log('🔐 handleSignedIn called:', {
      userEmail: user.email,
      skipAutoRedirect,
      currentPath: window.location.pathname,
      timestamp: new Date().toISOString()
    });

    try {
      const sessionId = session.access_token;

      // Track authentication only once per session
      if (!processedSessionsRef.current.has(sessionId)) {
        processedSessionsRef.current.add(sessionId);
        
        // Track sign up for new users, login for returning users
        const userCreatedAt = new Date(user.created_at);
        const now = new Date();
        const timeDiff = now.getTime() - userCreatedAt.getTime();
        const isNewUser = timeDiff < 60000; // Less than 1 minute ago = new user

        if (isNewUser) {
          trackSignUp('email');
        } else {
          trackLogin('email');
        }
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

      // Check if this is an OAuth callback FIRST - if so, let useAuthCallback handle the redirect
      const urlParams = new URLSearchParams(window.location.search);
      const hasCode = urlParams.has('code');
      const hasAccessToken = window.location.hash.includes('access_token');
      const hasSource = urlParams.has('source');
      const hasSessionSource = sessionStorage.getItem('oauth_source');
      const hasLocalSource = localStorage.getItem('oauth_source_backup');
      
      const isOAuthCallback = hasCode || hasAccessToken || hasSource || hasSessionSource || hasLocalSource;
      
      console.log('🔐 useAuthStateHandler: OAuth callback detection:', {
        hasCode,
        hasAccessToken,
        hasSource,
        hasSessionSource,
        hasLocalSource,
        isOAuthCallback,
        currentPath: window.location.pathname,
        searchParams: window.location.search
      });
      
      if (isOAuthCallback) {
        console.log('🔐 OAuth callback detected - letting useAuthCallback handle redirect');
        // Add a small delay to ensure useAuthCallback has processed the OAuth source
        setTimeout(() => {
          console.log('🔐 useAuthStateHandler: OAuth callback delay completed, checking if redirect is still needed');
        }, 2000);
        return;
      }

      // Check for pending checkout - this takes priority over normal redirects
      const { hasPendingCheckout, data: checkoutData } = getCheckoutFlags();
      
      if (hasPendingCheckout && checkoutData) {
        console.log('🔐 Pending checkout detected after signup/login, redirecting to home for checkout processing:', checkoutData);
        // Redirect to home page where the checkout flow will be handled
        window.location.href = '/';
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

      // Admin redirect
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
        // CRITICAL FIX: Redirect to homepage instead of mein-tiertraining after signup
        window.location.href = '/';
        console.log('🔐 Redirecting to homepage after signup');
      }

    } catch (error) {
      console.warn('Error in handleSignedIn:', error);
      // CRITICAL FIX: Fallback redirect to homepage instead of mein-tiertraining
      if (!window.location.pathname.includes('/auth/callback')) {
        window.location.href = '/';
      }
    }
  }, [trackSignUp, trackLogin, handleOAuthProfile, checkIfUserIsAdmin]);

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
