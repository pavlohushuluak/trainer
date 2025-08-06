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

  // Check if user is admin using React Query (same as AdminProtectedRoute)
  const { data: isAdmin, isLoading: checkingAdmin, error: adminError } = useQuery({
    queryKey: ['admin-check', user?.id],
    queryFn: async () => {
      if (!user) {
        console.log('🔐 Admin check: No user, returning false');
        return false;
      }
      
      console.log('🔐 Admin check: Checking admin status for user:', user.id);
      
      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('role, is_active')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();

        if (error) {
          console.log('🔐 Admin check: Error or no admin record found:', error.message);
          return false;
        }

        if (!data) {
          console.log('🔐 Admin check: No admin data found');
          return false;
        }

        const isUserAdmin = data.role === 'admin' || data.role === 'support';
        console.log('🔐 Admin check: Result:', { 
          userId: user.id, 
          role: data.role, 
          isActive: data.is_active, 
          isAdmin: isUserAdmin 
        });
        
        return isUserAdmin;
      } catch (error) {
        console.error('🔐 Admin check: Unexpected error:', error);
        return false;
      }
    },
    enabled: !!user && !loading, // Only run when user is available and auth is not loading
    staleTime: 300000, // Cache for 5 minutes (increased from 1 minute)
    gcTime: 600000, // Keep in cache for 10 minutes (increased from 5 minutes)
    retry: 3, // Increased retries
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on mount if we have cached data
  });

  // Fallback admin check - if the query fails or is loading for too long, try a direct check
  const [fallbackAdminStatus, setFallbackAdminStatus] = useState<boolean | null>(null);
  
  useEffect(() => {
    if (user && !loading && !checkingAdmin && isAdmin === false && fallbackAdminStatus === null) {
      // If the main query returned false but we're not sure, do a fallback check
      const checkAdminFallback = async () => {
        try {
          console.log('🔐 Fallback admin check for user:', user.id);
          const { data, error } = await supabase
            .from('admin_users')
            .select('role, is_active')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .single();

          const fallbackResult = !error && data && (data.role === 'admin' || data.role === 'support');
          console.log('🔐 Fallback admin check result:', fallbackResult);
          setFallbackAdminStatus(fallbackResult);
        } catch (error) {
          console.error('🔐 Fallback admin check error:', error);
          setFallbackAdminStatus(false);
        }
      };

      // Only run fallback check if main query has been running for more than 2 seconds
      const timer = setTimeout(checkAdminFallback, 2000);
      return () => clearTimeout(timer);
    }
  }, [user, loading, checkingAdmin, isAdmin, fallbackAdminStatus]);

  // Use fallback status if main query failed or is taking too long
  const finalAdminStatus = isAdmin !== undefined ? isAdmin : fallbackAdminStatus;

  // Persist admin status to localStorage as additional fallback
  useEffect(() => {
    if (user && finalAdminStatus !== null) {
      const adminKey = `admin_status_${user.id}`;
      localStorage.setItem(adminKey, JSON.stringify({
        isAdmin: finalAdminStatus,
        timestamp: Date.now(),
        userId: user.id
      }));
    }
  }, [user, finalAdminStatus]);

  // Load admin status from localStorage on mount as initial fallback
  useEffect(() => {
    if (user && isAdmin === undefined && fallbackAdminStatus === null) {
      const adminKey = `admin_status_${user.id}`;
      const stored = localStorage.getItem(adminKey);
      
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const isExpired = Date.now() - parsed.timestamp > 300000; // 5 minutes
          
          if (!isExpired && parsed.userId === user.id) {
            console.log('🔐 Loading admin status from localStorage:', parsed.isAdmin);
            setFallbackAdminStatus(parsed.isAdmin);
          } else {
            localStorage.removeItem(adminKey);
          }
        } catch (error) {
          console.error('🔐 Error parsing stored admin status:', error);
          localStorage.removeItem(adminKey);
        }
      }
    }
  }, [user, isAdmin, fallbackAdminStatus]);

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
      setFallbackAdminStatus(null);
      
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
          <div>Fallback: {fallbackAdminStatus !== null ? (fallbackAdminStatus ? 'Yes' : 'No') : 'Not Run'}</div>
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
      <div className="flex-1 mt-16">
        {children || <Outlet />}
      </div>
      
      {/* Footer */}
      {showFooter && <Footer />}
      
      {/* Support Button - Hide on Index page */}
      {showSupportButton && !isIndexPage && <SupportButton />}
    </div>
  );
}; 