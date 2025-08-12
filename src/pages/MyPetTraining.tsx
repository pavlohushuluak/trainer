
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePetProfiles } from '@/hooks/usePetProfiles';
import { useTranslations } from '@/hooks/useTranslations';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AuthErrorDisplay } from '@/components/auth/AuthErrorDisplay';
import { LoadingStateManager } from '@/components/training/LoadingStateManager';
import { ChatModal } from '@/components/ChatModal';
import { SupportButton } from '@/components/support/SupportButton';
import { AlertCircle } from 'lucide-react';

// Simple Error Boundary for Lazy Components
class LazyComponentErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    console.error('Lazy component error:', error);
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Lazy component error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center h-32 bg-muted rounded-lg">
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>Component failed to load</span>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Lazy load components
const HeroStorySection = lazy(() => import('@/components/training/HeroStorySection').then(module => ({ default: module.HeroStorySection })));
const LazyMainContentGrid = lazy(() => import('@/components/training/optimized/LazyMainContentGrid').then(module => ({ default: module.LazyMainContentGrid })));
const LazyPetProfileManager = lazy(() => import('@/components/training/optimized/LazyPetProfileManager').then(module => ({ default: module.LazyPetProfileManager })));
const DailyTrackingSection = lazy(() => import('@/components/training/DailyTrackingSection').then(module => ({ default: module.DailyTrackingSection })));
const ImageAnalysisCard = lazy(() => import('@/components/training/ImageAnalysisCard').then(module => ({ default: module.ImageAnalysisCard })));
const TrainingPlansCard = lazy(() => import('@/components/training/TrainingPlansCard').then(module => ({ default: module.TrainingPlansCard })));
const SubscriptionManagementSection = lazy(() => import('@/components/training/SubscriptionManagementSection').then(module => ({ default: module.SubscriptionManagementSection })));

const MyPetTraining = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { t } = useTranslations();
  const [isChatOpen, setIsChatOpen] = useState(false);

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
  const shouldOpenPetModal = new URLSearchParams(location.search).get('openPetModal') === 'true';

  // Check if user is admin (this will be handled by MainLayout now)
  const isAdmin = false; // This will be overridden by MainLayout

  // Page refresh effect - refresh the page only once when user navigates to it
  useEffect(() => {
    // Check if we've already refreshed this session
    const hasRefreshed = sessionStorage.getItem('mein-tiertraining-refreshed');
    
    if (!hasRefreshed) {
      // Mark that we've refreshed to prevent infinite refresh loops
      sessionStorage.setItem('mein-tiertraining-refreshed', 'true');
      
      // Refresh the page after a short delay to ensure proper loading
      const refreshTimer = setTimeout(() => {
        window.location.reload();
      }, 100);
      
      return () => clearTimeout(refreshTimer);
    }
  }, []);

  // Show loading only when absolutely necessary
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

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
    shouldShowLoading: false,
    petsError,
    timestamp: new Date().toISOString()
  });

  return (
    <ProtectedRoute>
      <MainLayout showFooter={false} showSupportButton={false}>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
          <div className="p-4 pb-8">
            <div className="max-w-7xl mx-auto">
              {/* Auth Error Display */}
              <AuthErrorDisplay />
              
              <div className="mb-8">
                <LazyComponentErrorBoundary>
                  <Suspense fallback={<div className="h-64 animate-pulse bg-muted rounded-lg" />}>
                    <HeroStorySection onChatOpen={() => setIsChatOpen(true)} />
                  </Suspense>
                </LazyComponentErrorBoundary>
              </div>

              <LoadingStateManager
                isLoading={false} // Never show loading overlay - handle loading at component level
                hasError={!!petsError && (!pets || pets.length === 0)}
                errorMessage={t('myPetTraining.page.error.petProfiles')}
              >
                {/* First Steps Guide and Progress Overview */}
                <LazyComponentErrorBoundary>
                  <Suspense fallback={<div className="h-64 animate-pulse bg-muted rounded-lg mb-8" />}>
                    <LazyMainContentGrid pets={pets || []} />
                  </Suspense>
                </LazyComponentErrorBoundary>
                
                <div id="pet-section" className="mb-8">
                  <LazyComponentErrorBoundary>
                    <Suspense fallback={<div className="h-64 animate-pulse bg-muted rounded-lg" />}>
                      <LazyPetProfileManager shouldOpenPetModal={shouldOpenPetModal} />
                    </Suspense>
                  </LazyComponentErrorBoundary>
                </div>
                
                <LazyComponentErrorBoundary>
                  <Suspense fallback={<div className="h-48 animate-pulse bg-muted rounded-lg mb-8" />}>
                    <DailyTrackingSection />
                  </Suspense>
                </LazyComponentErrorBoundary>

                <LazyComponentErrorBoundary>
                  <Suspense fallback={<div className="h-48 animate-pulse bg-muted rounded-lg mb-8" />}>
                    <ImageAnalysisCard primaryPet={primaryPet} />
                  </Suspense>
                </LazyComponentErrorBoundary>
                
                <div className="relative z-10">
                  <LazyComponentErrorBoundary>
                    <Suspense fallback={<div className="h-56 animate-pulse bg-muted rounded-lg mb-8" />}>
                      <TrainingPlansCard pets={pets || []} />
                    </Suspense>
                  </LazyComponentErrorBoundary>
                </div>
                
                <LazyComponentErrorBoundary>
                  <Suspense fallback={<div className="h-40 animate-pulse bg-muted rounded-lg" />}>
                    <SubscriptionManagementSection />
                  </Suspense>
                </LazyComponentErrorBoundary>
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
      </MainLayout>
    </ProtectedRoute>
  );
};

export default MyPetTraining;
