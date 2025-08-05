import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { TopNavigationBar } from './TopNavigationBar';
import { Footer } from '../Footer';
import { SupportButton } from '../support/SupportButton';
import { useAuth } from '@/hooks/useAuth';
import { useStickyHeader } from '@/hooks/useStickyHeader';
import { AuthErrorDisplay } from '../auth/AuthErrorDisplay';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { requestCache } from '@/utils/requestCache';

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
  const { isScrolled } = useStickyHeader();
  const [pets, setPets] = useState<Tables<'pet_profiles'>[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Check if we're on the Index page (root path)
  const isIndexPage = location.pathname === '/';

  // Check if user is admin
  const checkAdminStatus = useCallback(async () => {
    if (!user || isLoadingData) return;
    
    try {
      setIsLoadingData(true);
      const result = await requestCache.get(
        `admin_status_${user.id}`,
        async () => {
          // Use the same method as AdminProtectedRoute for consistency
          const { data, error } = await supabase
            .from('admin_users')
            .select('role, is_active')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .single();

          if (error || !data) return false;
          
          // Check if user has admin or support role
          return data.role === 'admin' || data.role === 'support';
        },
        60000 // Cache for 1 minute
      );
      
      console.log('🔐 Admin status check result:', { userId: user.id, isAdmin: result });
      setIsAdmin(result);
    } catch (error) {
      console.warn('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setIsLoadingData(false);
    }
  }, [user, isLoadingData]);

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
        requestCache.clear(`admin_status_${user.id}`);
        requestCache.clear(`pets_${user.id}`);
      }
      
      // Clear local state immediately
      setPets([]);
      setIsAdmin(false);
      
      // Call signOut - let it handle the redirect
      await signOut();
      
    } catch (error) {
      console.error('🔓 MainLayout logout error:', error);
      // On any error, force redirect
      window.location.replace('/');
    }
    // Remove the finally block to prevent conflicts with auth state handler
  };

  // Load data when user changes
  useEffect(() => {
    if (user) {
      // Add a small delay to prevent too many concurrent requests
      const timer = setTimeout(() => {
        checkAdminStatus();
        fetchPets();
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      // Clear data when user logs out
      setPets([]);
      setIsAdmin(false);
    }
  }, [user, checkAdminStatus, fetchPets]);

  return (
    <div className={cn("min-h-screen bg-background flex flex-col", className)}>
      {/* Sticky Navigation Header */}
      <TopNavigationBar 
        primaryPet={pets[0]}
        isAdmin={isAdmin}
        onLogout={handleLogout}
        showAdminAccess={isAdmin}
        showSettings={!!user}
        isAuthenticated={!!user}
      />
      {/* Debug admin status */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black text-white p-2 rounded text-xs z-50">
          Admin: {isAdmin ? 'Yes' : 'No'} | User: {user?.email || 'None'}
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