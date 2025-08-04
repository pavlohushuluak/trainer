
import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useOAuthProfileHandler } from './useOAuthProfileHandler';
import { getCheckoutFlags, clearCheckoutFlags, debugCheckoutState } from '@/utils/checkoutStorage';

export const useAuthStateHandler = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { handleOAuthProfile } = useOAuthProfileHandler();

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
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          priceType: priceType,
          successUrl: `${window.location.origin}/mein-tiertraining?success=true&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/?canceled=true`
        }
      });

      if (error) {
        clearCheckoutFlags();
        
        const { toast } = await import('@/hooks/use-toast');
        toast({
          title: "Checkout-Fehler",
          description: "Bitte versuchen Sie es erneut.",
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
      if (skipAutoRedirect || currentPath === '/mein-tiertraining') {
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
      } else if (!isAdmin && currentPath !== '/mein-tiertraining') {
        console.log('🔐 Redirecting user to /mein-tiertraining');
        window.location.href = '/mein-tiertraining';
      } else {
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
    let mounted = true;
    let sessionInitialized = false;
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle SIGNED_IN events immediately
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            await handleSignedIn(session);
          } catch (error) {
            console.warn('Error in auth state change handler:', error);
          }
        }
        
        // Handle SIGNED_OUT events
        if (event === 'SIGNED_OUT') {
          console.log('🔓 SIGNED_OUT event received, user logged out');
          // Clear any remaining local data
          setUser(null);
          setSession(null);
          // The redirect is handled by the signOut function itself
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      
      console.log('Initial session check:', session?.user?.email);
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      sessionInitialized = true;
      
      // Handle redirect for existing sessions
      if (session?.user) {
        try {
          await handleSignedIn(session, true);
        } catch (error) {
          console.warn('Error handling existing session:', error);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [handleSignedIn]);

  return { user, session, loading };
};
