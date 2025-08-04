
import React, { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthContext } from './AuthContext';
import { useAuthOperations } from './useAuthOperations';
import { useAuthStateHandler } from './useAuthStateHandler';
import { useOAuthProfileHandler } from './useOAuthProfileHandler';
import { useQueryClient } from '@tanstack/react-query';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { signIn, signUp, signOut, signInWithOAuth } = useAuthOperations();
  const { user, session, loading } = useAuthStateHandler();
  const { handleOAuthProfile } = useOAuthProfileHandler();
  const [authError, setAuthError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Reset query cache when user changes - only when user actually changes, not on every auth state change
  const [lastUserId, setLastUserId] = useState<string | null>(null);
  
  useEffect(() => {
    if (!loading && user?.id && user.id !== lastUserId) {
      console.log('🔄 User changed, clearing query cache for fresh data');
      setLastUserId(user.id);
      // Only clear specific queries that depend on user data, not the entire cache
      queryClient.removeQueries({ queryKey: ['pets'] });
      queryClient.removeQueries({ queryKey: ['subscription-status'] });
      queryClient.removeQueries({ queryKey: ['admin-check'] });
    }
  }, [user?.id, loading, queryClient, lastUserId]);

  // Handle OAuth profile updates with error handling
  const handleOAuthProfileSafely = useCallback(async (user: User) => {
    try {
      await handleOAuthProfile(user);
    } catch (error) {
      console.warn('Error handling OAuth profile in provider:', error);
      setAuthError('Fehler beim Aktualisieren des Profils');
    }
  }, [handleOAuthProfile]);

  // Handle OAuth profile updates
  useEffect(() => {
    if (session?.user && session.user.app_metadata?.provider) {
      // Add delay for OAuth users to ensure session is fully established
      const timer = setTimeout(() => {
        handleOAuthProfileSafely(session.user);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [session?.user, handleOAuthProfileSafely]);

  // Clear auth errors after a delay
  useEffect(() => {
    if (authError) {
      const timer = setTimeout(() => {
        setAuthError(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [authError]);

  // Check for stored auth errors on mount
  useEffect(() => {
    const storedError = sessionStorage.getItem('auth_error');
    if (storedError) {
      setAuthError(storedError);
      sessionStorage.removeItem('auth_error');
    }
  }, []);

  const dismissAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithOAuth,
    authError,
    dismissAuthError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
