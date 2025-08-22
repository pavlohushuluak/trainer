import { useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { TopNavigationBar } from './TopNavigationBar';
import { Footer } from '../Footer';
import { SupportButton } from '../support/SupportButton';
import { AuthErrorDisplay } from '../auth/AuthErrorDisplay';
import { LanguageInitializer } from '../LanguageInitializer';
import { requestCache } from '@/utils/requestCache';
import type { Tables } from '@/integrations/supabase/types';

interface MainLayoutProps {
  showFooter?: boolean;
  showSupportButton?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  showFooter = true,
  showSupportButton = true,
  className,
  children
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, signOut } = useAuth();
  const [pets, setPets] = useState<Tables<'pet_profiles'>[]>([]);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Check if we're on the Index page (root path)
  const isIndexPage = location.pathname === '/';
  // Check if we're on the Chat page
  const isChatPage = location.pathname === '/chat';

  // Direct admin check without React Query to avoid hanging issues
  const [isAdmin, setIsAdmin] = useState<boolean | undefined>(undefined);
  const [checkingAdmin, setCheckingAdmin] = useState(false);
  const [adminError, setAdminError] = useState<Error | null>(null);

  // Direct admin check function
  const checkAdminStatus = useCallback(async (userId: string) => {
    console.log('🔐 Admin check: Direct check started for user:', userId);
    setCheckingAdmin(true);
    setAdminError(null);
    
    try {
      // Check network connectivity first
      if (!navigator.onLine) {
        console.log('🔐 Admin check: No network connectivity, defaulting to non-admin');
        setIsAdmin(false);
        setAdminError(new Error('No network connectivity'));
        return false;
      }

      console.log("🔐 Admin check: Starting Supabase query for user:", userId);
      
      // Add timeout to the Supabase query
      const queryPromise = supabase
        .from('admin_users')
        .select('role, is_active')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          console.log('🔐 Admin check: Supabase query timeout triggered after 5 seconds');
          reject(new Error('Supabase query timeout after 5 seconds'));
        }, 5000);
      });

      console.log('🔐 Admin check: Starting Promise.race between query and timeout');
      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;
      console.log('🔐 Admin check: Promise.race completed');

      console.log('🔐 Admin check: Supabase response received', {
        data: data ? { role: data.role, is_active: data.is_active } : null,
        error: error?.message || null,
        hasData: !!data,
        hasError: !!error
      });

      if (error) {
        console.log('🔐 Admin check: Supabase error:', error.message);
        setIsAdmin(false);
        setAdminError(new Error(error.message));
        return false;
      }

      if (!data) {
        console.log('🔐 Admin check: No admin data found in database');
        setIsAdmin(false);
        return false;
      }

      const isUserAdmin = data.role === 'admin' || data.role === 'support';
      console.log('🔐 Admin check: Final result:', { 
        userId: userId, 
        role: data.role, 
        isActive: data.is_active, 
        isAdmin: isUserAdmin,
        timestamp: new Date().toISOString()
      });
      
      setIsAdmin(isUserAdmin);
      return isUserAdmin;
    } catch (error) {
      console.error('🔐 Admin check: Unexpected error in direct check:', error);
      setIsAdmin(false);
      setAdminError(error as Error);
      return false;
    } finally {
      setCheckingAdmin(false);
    }
  }, []);

  // Trigger admin check when user changes
  useEffect(() => {
    if (user && !loading) {
      console.log('🔐 Admin check: User available, starting check');
      
      // Check if we have cached admin status first
      const adminKey = `admin_status_${user.id}`;
      const stored = localStorage.getItem(adminKey);
      
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const isExpired = Date.now() - parsed.timestamp > 300000; // 5 minutes
          
          if (!isExpired && parsed.userId === user.id) {
            console.log('🔐 Admin check: Using cached admin status:', parsed.isAdmin);
            setIsAdmin(parsed.isAdmin);
            setCheckingAdmin(false);
            return; // Skip the database query
          } else {
            console.log('🔐 Admin check: Cached admin status expired, removing');
            localStorage.removeItem(adminKey);
          }
        } catch (error) {
          console.error('🔐 Admin check: Error parsing cached admin status:', error);
          localStorage.removeItem(adminKey);
        }
      }
      
      checkAdminStatus(user.id);
    } else if (!user) {
      console.log('🔐 Admin check: No user, resetting state');
      setIsAdmin(undefined);
      setCheckingAdmin(false);
      setAdminError(null);
    }
  }, [user, loading, checkAdminStatus]);

  // Debug admin check state
  console.log('🔐 MainLayout: Admin check state', {
    userId: user?.id,
    authLoading: loading,
    checkingAdmin,
    isAdmin,
    adminError: adminError?.message,
    queryEnabled: !!user && !loading,
    timestamp: new Date().toISOString()
  });

  // Simple timeout for admin check to prevent hanging
  useEffect(() => {
    if (checkingAdmin && user && !loading) {
      const timeoutId = setTimeout(() => {
        console.log('🔐 Admin check: Emergency timeout reached (6s), forcing completion');
        if (isAdmin === undefined) {
          console.log('🔐 Admin check: Setting admin status to false due to timeout');
          setIsAdmin(false);
          setCheckingAdmin(false);
        }
      }, 6000); // Increased to 6 seconds to allow for Supabase timeout
      
      return () => clearTimeout(timeoutId);
    }
  }, [checkingAdmin, user, loading, isAdmin]);

  // Use direct admin status
  const finalAdminStatus = isAdmin;
  
  // Handle admin check errors
  useEffect(() => {
    if (adminError) {
      console.log('🔐 Admin check: Error detected:', adminError.message);
    }
  }, [adminError]);
  
  // Force timeout for admin check to prevent endless loading
  useEffect(() => {
    if (checkingAdmin && user && !loading) {
      const timeoutId = setTimeout(() => {
        console.log('🔐 Admin check: Emergency timeout reached (3s), forcing completion');
        if (isAdmin === undefined) {
          console.log('🔐 Admin check: Setting admin status to false due to timeout');
          setIsAdmin(false);
          setCheckingAdmin(false);
        }
      }, 3000); // 3 second timeout
      
      return () => clearTimeout(timeoutId);
    }
  }, [checkingAdmin, user, loading, isAdmin]);

  // Persist admin status to localStorage for caching
  useEffect(() => {
    if (user && finalAdminStatus !== undefined) {
      const adminKey = `admin_status_${user.id}`;
      localStorage.setItem(adminKey, JSON.stringify({
        isAdmin: finalAdminStatus,
        timestamp: Date.now(),
        userId: user.id
      }));
    }
  }, [user, finalAdminStatus]);

  // Fetch user's pets
  const fetchPets = useCallback(async () => {
    if (!user || isLoadingData) return;
    
    try {
      setIsLoadingData(true);
      const result = await requestCache.get(
        `pets_${user.id}`,
        async () => {
          const { data: userPets, error } = await supabase
            .from('pet_profiles')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          
          if (error) {
            console.warn('Error fetching pets:', error);
            return [];
          }
          
          return userPets || [];
        },
        30000 // Cache for 30 seconds
      );
      
      setPets(result);
    } catch (error) {
      console.warn('Error fetching pets:', error);
      setPets([]);
    } finally {
      setIsLoadingData(false);
    }
  }, [user, isLoadingData]);

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple logout calls
    
    console.log('🔓 MainLayout: Starting logout...');
    setIsLoggingOut(true);
    
    try {
      // Clear cache for this user immediately
      if (user) {
        requestCache.clear(`pets_${user.id}`);
        // Clear admin status from localStorage
        localStorage.removeItem(`admin_status_${user.id}`);
      }
      
      // Clear local state immediately
      setPets([]);
      setIsAdmin(undefined);
      setCheckingAdmin(false);
      setAdminError(null);
      
      // Call signOut - let it handle the redirect
      await signOut();
      
    } catch (error) {
      console.error('🔓 MainLayout logout error:', error);
      // On any error, force redirect
      window.location.replace('/');
    }
    // Remove the finally block to prevent conflicts with auth state handler
  };

  // Load pets when user changes
  useEffect(() => {
    if (user) {
      // Add a small delay to prevent too many concurrent requests
      const timer = setTimeout(() => {
        fetchPets();
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      // Clear data when user logs out
      setPets([]);
    }
  }, [user, fetchPets]);

  return (
    <div className={cn("min-h-screen bg-background flex flex-col", className)}>
      {/* Language Initializer */}
      <LanguageInitializer />
      
      {/* Sticky Navigation Header */}
      <TopNavigationBar 
        primaryPet={pets[0]}
        isAdmin={finalAdminStatus || false}
        onLogout={handleLogout}
        showAdminAccess={finalAdminStatus || false}
        showSettings={!!user}
        isAuthenticated={!!user}
      />
      {/* Debug admin status */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black text-white p-2 rounded text-xs z-50 max-w-xs">
          <div>Admin: {finalAdminStatus ? 'Yes' : 'No'}</div>
          <div>Main Query: {isAdmin !== undefined ? (isAdmin ? 'Yes' : 'No') : 'Loading'}</div>
          <div>Direct Check: {isAdmin !== undefined ? (isAdmin ? 'Yes' : 'No') : 'Loading'}</div>
          <div>User: {user?.email || 'None'}</div>
          <div>Loading: {checkingAdmin ? 'Yes' : 'No'}</div>
          <div>Auth Loading: {loading ? 'Yes' : 'No'}</div>
          {user && (
            <div>Storage: {localStorage.getItem(`admin_status_${user.id}`) ? 'Cached' : 'None'}</div>
          )}
          {adminError && (
            <div className="text-red-400">Error: {adminError.message}</div>
          )}
        </div>
      )}
      
      {/* Auth Error Display */}
      <AuthErrorDisplay />
      
      {/* Main Content */}
      <div className={`flex-1 mt-16 ${isChatPage ? 'h-[calc(100vh-4rem)]' : ''}`}>
        {children || <Outlet />}
      </div>
      
      {/* Footer */}
      {showFooter && !isChatPage && <Footer />}
      
      {/* Support Button - Show on all pages for premium users */}
      <SupportButton />
    </div>
  );
}; 