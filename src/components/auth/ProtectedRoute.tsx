/**
 * @fileoverview Protected Route Component - Handles authentication and device binding auto-login
 * Checks if user is logged in, if not attempts auto-login via device binding, otherwise redirects to login
 * Supports multi-language display for loading states
 */

import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTranslations } from '@/hooks/useTranslations';
import { getDeviceFingerprint } from '@/utils/deviceFingerprint';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslations();
  const location = useLocation();
  const [autoLoginStatus, setAutoLoginStatus] = useState<
    'checking' | 'success' | 'no_binding' | 'error'
  >('checking');
  const [isAutoLoggingIn, setIsAutoLoggingIn] = useState(false);

  useEffect(() => {
    console.log('🔐 [ProtectedRoute] Effect triggered:', {
      user: !!user,
      authLoading,
      path: location.pathname,
      autoLoginStatus
    });

    // If user is already authenticated, no need to check device binding
    if (user) {
      console.log('✅ [ProtectedRoute] User already authenticated');
      setAutoLoginStatus('success');
      return;
    }

    // If still loading auth, wait
    if (authLoading) {
      console.log('⏳ [ProtectedRoute] Auth still loading, waiting...');
      return;
    }

    // User not authenticated and auth is done loading - try auto-login
    const attemptAutoLogin = async () => {
      console.log('🔐 [ProtectedRoute] User not authenticated, checking device binding...');
      setIsAutoLoggingIn(true);

      try {
        // Get device fingerprint
        const deviceFingerprint = await getDeviceFingerprint();
        console.log('🔐 [ProtectedRoute] Device fingerprint:', deviceFingerprint.substring(0, 20) + '...');

        // Call auto-login edge function with target URL
        const targetUrl = location.pathname + location.search;
        console.log('🔐 [ProtectedRoute] Calling auto-login-device function with target:', targetUrl);
        const { data, error } = await supabase.functions.invoke('auto-login-device', {
          body: { 
            deviceFingerprint,
            redirectTo: targetUrl
          }
        });

        console.log('🔐 [ProtectedRoute] Auto-login response:', { data, error });

        if (error) {
          console.error('❌ [ProtectedRoute] Error calling auto-login:', error);
          setAutoLoginStatus('error');
          setIsAutoLoggingIn(false);
          return;
        }

        // Check if device binding exists
        if (!data?.hasBinding) {
          console.log('ℹ️ [ProtectedRoute] No device binding found - redirect to login');
          setAutoLoginStatus('no_binding');
          setIsAutoLoggingIn(false);
          return;
        }

        // Check if we have an action link for auto-login
        if (data?.actionLink) {
          console.log('✅ [ProtectedRoute] Device binding found! Auto-logging in...');
          console.log('🔑 [ProtectedRoute] Action link received, navigating to:', data.actionLink.substring(0, 80) + '...');
          
          // Navigate to the action link to complete auto-login
          // The edge function has already configured the redirect to the target URL
          window.location.href = data.actionLink;
          
          // Set status to success (component will unmount during navigation)
          setAutoLoginStatus('success');
          return;
        }

        // Device binding exists but no action link - something went wrong
        console.error('❌ [ProtectedRoute] Device binding exists but no action link received');
        setAutoLoginStatus('error');
        setIsAutoLoggingIn(false);

      } catch (error) {
        console.error('❌ [ProtectedRoute] Exception during auto-login attempt:', error);
        setAutoLoginStatus('error');
        setIsAutoLoggingIn(false);
      }
    };

    attemptAutoLogin();
  }, [user, authLoading, location.pathname, autoLoginStatus]);

  // Show loading spinner while checking auth or auto-logging in
  if (authLoading || autoLoginStatus === 'checking' || isAutoLoggingIn) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">
            {isAutoLoggingIn 
              ? t('auth.autoLogin.loggingIn', 'Logging in...') 
              : t('auth.protectedRoute.checkingAuth', 'Checking authentication...')
            }
          </p>
        </div>
      </div>
    );
  }

  // If user is authenticated, render the protected content
  if (user) {
    return <>{children}</>;
  }

  // No device binding or auto-login failed - redirect to login
  if (autoLoginStatus === 'no_binding' || autoLoginStatus === 'error') {
    console.log('🔐 [ProtectedRoute] Redirecting to /login');
    
    // Store the intended destination so we can redirect back after login
    const targetUrl = location.pathname + location.search;
    
    return <Navigate to="/login" state={{ from: targetUrl }} replace />;
  }

  // Default: show loading
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
};
