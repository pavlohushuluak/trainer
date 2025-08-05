
import { ChatModal } from '@/components/ChatModal';
import { Footer } from '@/components/Footer';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useState, useMemo, Suspense, useEffect } from 'react';
import { TopNavigationBar } from '@/components/layout/TopNavigationBar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AuthErrorDisplay } from '@/components/auth/AuthErrorDisplay';
import { SupportButton } from '@/components/support/SupportButton';
import { HeroStorySection } from '@/components/training/HeroStorySection';
import { LazyMainContentGrid } from '@/components/training/optimized/LazyMainContentGrid';
import { LazyPetProfileManager } from '@/components/training/optimized/LazyPetProfileManager';
import { ImageAnalysisCard } from '@/components/training/ImageAnalysisCard';
import { TrainingPlansCard } from '@/components/training/TrainingPlansCard';
import { SubscriptionManagementSection } from '@/components/training/SubscriptionManagementSection';
import { LoadingStateManager } from '@/components/training/LoadingStateManager';
import { DailyTrackingSection } from '@/components/training/DailyTrackingSection';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { DataRefreshButton } from '@/components/DataRefreshButton';
import { devLog, PerformanceTimer } from '@/utils/performance';
import { usePaymentSuccess } from '@/hooks/usePaymentSuccess';
import { useTranslations } from '@/hooks/useTranslations';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePetProfiles } from '@/hooks/usePetProfiles';

const MyPetTraining = () => {
  const { user, signOut, loading } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { t } = useTranslations();
  const location = useLocation();
  const navigate = useNavigate();

  // Use Redux for pet profiles data
  const { 
    pets, 
    loading: petsLoading, 
    error: petsError, 
    primaryPet,
    isInitialized: petsInitialized,
    fetchPets
  } = usePetProfiles();

  // Check if we should open the pet modal from URL parameter
  const shouldOpenPetModal = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('openPetModal') === 'true';
  }, [location.search]);

  // Handle payment success tracking
  usePaymentSuccess();

  // Performance monitoring
  const { startMetric, endMetric } = usePerformanceMonitor('MyPetTraining');

  // Wait for proper initialization
  const [hasInitialized, setHasInitialized] = useState(false);
  
  // Add more detailed debugging
  useEffect(() => {
    console.log('🔍 MyPetTraining Auth State Changed:', {
      loading,
      hasUser: !!user,
      userId: user?.id,
      timestamp: new Date().toISOString()
    });
  }, [loading, user]);

  useEffect(() => {
    // Simplified initialization logic
    if (!loading) {
      console.log('✅ Auth loading finished, setting hasInitialized to true');
      setHasInitialized(true);
    }
  }, [loading]);

  // Optimized admin check with much longer cache for performance
  const { data: isAdmin } = useQuery({
    queryKey: ['admin-check', user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const metricKey = startMetric('admin-check', 'query');
      
      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('role, is_active')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();

        const result = !error && data && (data.role === 'admin' || data.role === 'support');
        endMetric(metricKey, 'admin-check');
        return result;
      } catch (error) {
        endMetric(metricKey, 'admin-check');
        return false;
      }
    },
    enabled: !!user && !loading, // Only run when auth is complete
    staleTime: 60 * 60 * 1000, // 60 minutes - very long cache
    gcTime: 120 * 60 * 1000, // 120 minutes cache
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch on mount if we have cached data
    retry: false,
  });

  // TEMPORARY: Simple test to bypass complex loading logic
  const isTestMode = false; // Set to false to enable normal page functionality
  
  if (isTestMode) {
    console.log('🧪 TEST MODE: Bypassing loading logic');
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
          <div className="p-4">
            <h1 className="text-2xl font-bold">Test Mode - Page Loaded Successfully</h1>
            <p>Auth Loading: {loading ? 'Yes' : 'No'}</p>
            <p>User: {user ? user.email : 'None'}</p>
            <p>Pets Loading: {petsLoading ? 'Yes' : 'No'}</p>
            <p>Pets Count: {pets ? pets.length : 'Unknown'}</p>
            <p>Pets Error: {petsError ? 'Yes' : 'No'}</p>
            <p>User ID: {user?.id || 'None'}</p>

            <button 
              onClick={() => {
                console.log('🧪 Manual direct query test');
                // Test direct query
                supabase
                  .from('pet_profiles')
                  .select('*')
                  .eq('user_id', user?.id)
                  .then(({ data, error }) => {
                    console.log('🧪 Manual direct query result:', { data, error });
                  });
              }}
              className="bg-green-500 text-white px-4 py-2 rounded mt-4"
            >
              Direct Supabase Test
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // IMPROVED loading state - faster feedback, better error handling
  if (loading) {
    console.log('🔄 AUTH LOADING - showing auth loading state');
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-foreground text-lg">{t('myPetTraining.page.loading.authentication')}</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Show loading until properly initialized
  if (!hasInitialized) {
    console.log('⏳ Waiting for proper initialization...');
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-foreground text-lg">Initializing...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // IMPROVED: Better loading state logic with debug info
  // Only show loading if we have a user but pets are still loading and we have no data yet
  const shouldShowLoading = !!user && petsLoading && !pets && !petsError;

  // Debug logging to understand the issue
  console.log('🔍 MyPetTraining DEBUG:', {
    loading: loading,
    user: !!user,
    userId: user?.id,
    petsLoading: petsLoading,
    pets: pets ? pets.length : 'undefined',
    shouldShowLoading: shouldShowLoading,
    queryEnabled: !!user?.id && !loading,
    petsError: petsError,
    timestamp: new Date().toISOString()
  });

  if (shouldShowLoading) {
    console.log('🔄 SHOWING LOADING STATE - pets query is running but no data yet');
    
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-foreground text-lg">{t('myPetTraining.page.loading.petProfiles')}</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // ENHANCED error handling for pets loading - only show if no pets available
  if (petsError && (!pets || pets.length === 0)) {
    console.log('❌ SHOWING ERROR STATE - pets query failed and no pets available');
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-destructive text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-foreground mb-2">{t('myPetTraining.page.error.title')}</h2>
            <p className="text-muted-foreground mb-4">
              {t('myPetTraining.page.error.description')}
            </p>
            <button
              onClick={() => {
                console.log('🔄 Retry button clicked - fetching pets from Redux');
                fetchPets();
              }}
              className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition-colors"
            >
              {t('myPetTraining.page.error.retry')}
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // If we have no user and not loading, show a fallback
  if (!user && !loading) {
    console.log('❌ NO USER - showing fallback state');
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
          <div className="text-center">
            <div className="text-destructive text-6xl mb-4">🔒</div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Authentication Required</h2>
            <p className="text-muted-foreground mb-4">
              Please log in to access your pet training dashboard.
            </p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  console.log('🎯 FINAL RENDER STATE:', {
    loading,
    user: !!user,
    userId: user?.id,
    petsLoading,
    pets: pets ? pets.length : 'undefined',
    shouldShowLoading,
    petsError,
    timestamp: new Date().toISOString()
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <TopNavigationBar 
          primaryPet={primaryPet}
          isAdmin={isAdmin}
          onLogout={signOut}
          showAdminAccess={false}
          isAuthenticated={!!user}
        />

        <div className="p-4 pb-8">
          <div className="max-w-7xl mx-auto">
            {/* Auth Error Display */}
            <AuthErrorDisplay />
            
            <div className="mb-8">
              <HeroStorySection onChatOpen={() => setIsChatOpen(true)} />
            </div>

            <LoadingStateManager
              isLoading={false} // Never show loading overlay - handle loading at component level
              hasError={!!petsError && (!pets || pets.length === 0)}
              errorMessage={t('myPetTraining.page.error.petProfiles')}
            >
              {/* First Steps Guide and Progress Overview */}
              <Suspense fallback={<div className="h-64 animate-pulse bg-muted rounded-lg mb-8" />}>
                <LazyMainContentGrid pets={pets || []} />
              </Suspense>
              
              <div id="pet-section" className="mb-8">
                <Suspense fallback={<div className="h-64 animate-pulse bg-muted rounded-lg" />}>
                  <LazyPetProfileManager shouldOpenPetModal={shouldOpenPetModal} />
                </Suspense>
              </div>
              
              <Suspense fallback={<div className="h-48 animate-pulse bg-muted rounded-lg mb-8" />}>
                <DailyTrackingSection />
              </Suspense>

              <Suspense fallback={<div className="h-48 animate-pulse bg-muted rounded-lg mb-8" />}>
                <ImageAnalysisCard primaryPet={primaryPet} />
              </Suspense>
              
              <div className="relative z-10">
                <Suspense fallback={<div className="h-56 animate-pulse bg-muted rounded-lg mb-8" />}>
                  <TrainingPlansCard pets={pets || []} />
                </Suspense>
              </div>
              
              <Suspense fallback={<div className="h-40 animate-pulse bg-muted rounded-lg" />}>
                <SubscriptionManagementSection />
              </Suspense>
            </LoadingStateManager>

            {isChatOpen && (
              <ChatModal 
                isOpen={isChatOpen} 
                onClose={() => setIsChatOpen(false)}
              />
            )}
          </div>
        </div>
        
        <SupportButton />
      </div>
    </ProtectedRoute>
  );
};

export default MyPetTraining;
