
import { useContext, useEffect, useRef } from 'react';
import { AuthContext } from './auth/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  const hasLoggedRef = useRef(false);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  // Only log once when auth state is determined (not on every render)
  useEffect(() => {
    if (!hasLoggedRef.current && context.user !== undefined && !context.loading) {
      // Remove the DEV check to prevent console flooding entirely
      hasLoggedRef.current = true;
    }
  }, [context.user, context.loading]);

  return context;
};
