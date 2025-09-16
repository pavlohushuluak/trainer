
import { supabase } from '@/integrations/supabase/client';
import { initializeUserLanguageSupport, detectBrowserLanguage } from '@/utils/languageSupport';
import { getCheckoutFlags } from '@/utils/checkoutStorage';

export const useAuthOperations = () => {
  const signOut = async () => {
    console.log('🔓 Starting logout process...');
    
    try {
      // Step 1: Clear all auth-related storage immediately
      console.log('🔓 Clearing storage...');
      sessionStorage.removeItem('pendingPriceType');
      sessionStorage.removeItem('pendingLoginContext');
      sessionStorage.removeItem('pendingCheckoutPriceType');
      sessionStorage.removeItem('auth_error');
      
      // Clear all possible localStorage items
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('supabase') || key?.includes('sb-vuzhlwyhcrsxqfysczsu')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      console.log('🔓 Storage cleared, attempting Supabase logout...');
      
      // Step 2: Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('🔓 Supabase logout error:', error);
        // Handle specific "session not found" errors as success
        if (error.message?.toLowerCase().includes('session') && 
            (error.message.includes('not found') || error.message.includes('invalid'))) {
          console.log('🔓 Session already invalid - treating as successful logout');
        } else {
          console.warn('🔓 Logout error but continuing:', error.message);
        }
      } else {
        console.log('🔓 Supabase logout successful');
      }
      
      // Step 3: Force immediate redirect to home page
      console.log('🔓 Forcing redirect to home page...');
      window.location.replace('/');
      
    } catch (error) {
      console.error('🔓 Logout exception:', error);
      // Always force redirect on any error
      window.location.replace('/');
    }
  };

  const signIn = async (email: string, password: string) => {
    const result = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    // Initialize language support for existing user on successful login
    if (result.data?.user && !result.error) {
      setTimeout(() => {
        initializeUserLanguageSupport(result.data.user.email!, false);
      }, 500);
    }
    
    // Redirect handled automatically by auth state change listener
    return result;
  };

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string, language?: string, skipEmailVerification: boolean = false) => {
    // Detect preferred language using the unified detection function
    // Always default to German ('de') if no language is provided
    const detectedLanguage = language || detectBrowserLanguage() || 'de';
    console.log('🔐 Signup - detected language:', detectedLanguage);
    console.log('🔐 Signup - skip email verification:', skipEmailVerification);
    
    // Always provide metadata, even if empty - this prevents "undefined values" error
    const metadata = {
      first_name: firstName?.trim() || '',
      last_name: lastName?.trim() || '',
      preferred_language: detectedLanguage
    };
    
    console.log('🔐 Signup - user metadata:', metadata);
    
    const result = await supabase.auth.signUp({
      email: email.trim(),
      password: password, // Make sure password is passed as-is
      options: {
        // Conditional email verification based on context
        emailRedirectTo: skipEmailVerification ? undefined : `${window.location.origin}/auth/callback`,
        data: metadata
      }
    });
    
    // Initialize language support for new user on successful signup
    if (result.data?.user && !result.error) {
      setTimeout(() => {
        initializeUserLanguageSupport(result.data.user.email!, true);
      }, 500);
    }
    
    // Redirect handled automatically by auth state change listener
    return result;
  };

  const signInWithOAuth = async (provider: 'google' | 'github', source?: string) => {
    // Include source information in redirect URL to determine redirect behavior
    const sourceParam = source ? `?source=${encodeURIComponent(source)}` : '';
    const redirectUrl = `${window.location.origin}/auth/callback${sourceParam}`;
    
    console.log('🔐 OAuth operations: Starting OAuth with source tracking:', {
      provider,
      source,
      sourceParam,
      redirectUrl,
      currentUrl: window.location.href
    });
    
    try {
      // Clear any existing auth errors first
      sessionStorage.removeItem('auth_error');
      
      // Store source information in sessionStorage for backup
      if (source) {
        sessionStorage.setItem('oauth_source', source);
        // Also store in localStorage as a more persistent backup
        localStorage.setItem('oauth_source_backup', source);
        
        // Check if this is Google OAuth from login page and include that info
        const signInGoogle = sessionStorage.getItem('sign_in_google');
        const signInGoogleBackup = localStorage.getItem('sign_in_google_backup');
        
        // Check if this is Google OAuth from SmartLoginModal and include that info
        const checkoutFlag = sessionStorage.getItem('checkout_flag');
        const checkoutFlagBackup = localStorage.getItem('checkout_flag_backup');
        
        // Store additional context information
        localStorage.setItem('oauth_context', JSON.stringify({
          source: source,
          timestamp: Date.now(),
          currentUrl: window.location.href,
          referrer: document.referrer,
          sign_in_google: signInGoogle || signInGoogleBackup || null,
          checkout_flag: checkoutFlag || checkoutFlagBackup || null
        }));
        console.log('🔐 OAuth operations: Stored source in sessionStorage and localStorage:', {
          source,
          signInGoogle,
          signInGoogleBackup,
          checkoutFlag,
          checkoutFlagBackup
        });
      }
      
      const result = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            // Add additional parameters for better OAuth handling
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });
      
      if (result.error) {
        console.warn('OAuth sign in error:', result.error);
        // Store error for display after redirect
        sessionStorage.setItem('auth_error', result.error.message || 'OAuth Anmeldung fehlgeschlagen');
      }
      
      return result;
    } catch (error) {
      console.warn('OAuth sign in exception:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter OAuth Fehler';
      sessionStorage.setItem('auth_error', errorMessage);
      return { error };
    }
  };

  return {
    signOut,
    signIn,
    signUp,
    signInWithOAuth
  };
};
