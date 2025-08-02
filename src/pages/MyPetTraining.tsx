
import { ChatModal } from '@/components/ChatModal';
import { Footer } from '@/components/Footer';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useState, useMemo, Suspense } from 'react';
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

const MyPetTraining = () => {
  const { user, signOut, loading } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { t } = useTranslations();

  // Handle payment success tracking
  usePaymentSuccess();

  // Performance monitoring
  const { startMetric, endMetric } = usePerformanceMonitor('MyPetTraining');

  // Debug auth state (development only)
  devLog('🔐 AUTH STATE DEBUG:', {
    hasUser: !!user,
    userId: user?.id,
    loading: loading,
    timestamp: new Date().toISOString()
  });

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
    enabled: !!user,
    staleTime: 60 * 60 * 1000, // Increased to 60 minutes for better performance
    gcTime: 120 * 60 * 1000, // 120 minutes cache
    refetchOnWindowFocus: false,
    retry: false,
  });

  // OPTIMIZED pet query with improved error handling and faster loading
  const { data: rawPets, isLoading: petsLoading, error: petsError, refetch: refetchPets } = useQuery({
    queryKey: ['pets', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        devLog('🚫 Pet query: No user ID available');
        console.log('🚫 Pet query: No user ID available', { user, userId: user?.id });
        return [];
      }
      
      console.log('🔄 Starting pets query for user:', user.id);
      const timer = new PerformanceTimer('pets-query');
      const metricKey = startMetric('pets-query', 'query');
      
      try {
        const { data, error } = await supabase
          .from('pet_profiles')
          .select('id, name, species, breed, age, birth_date, behavior_focus, notes, created_at, updated_at, user_id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        console.log('🔍 Pets query result:', { data, error, userID: user.id });

        if (error) {
          devLog('💥 DIRECT: Pets query failed:', error);
          console.error('💥 DIRECT: Pets query failed:', error);
          endMetric(metricKey, 'pets-query');
          throw error;
        }
        
        const pets = data || [];
        console.log('✅ Pets query successful:', { count: pets.length, pets });
        timer.end();
        endMetric(metricKey, 'pets-query');
        return pets;
      } catch (error) {
        timer.end();
        endMetric(metricKey, 'pets-query');
        devLog('❌ DIRECT: Pets query error:', error);
        console.error('❌ DIRECT: Pets query error:', error);
        throw error;
      }
    },
    enabled: !!user?.id && !loading,
    staleTime: 0, // Always fresh data on reload
    gcTime: 1000 * 60 * 5, // 5 minutes
    retry: 1, // Reduced retries for faster error feedback
    retryDelay: 300, // Faster retry
    refetchOnWindowFocus: true,
    refetchOnMount: 'always',
  });

  // ROBUST PET DATA PROCESSING with faster error handling
  const pets = useMemo(() => {
    if (!rawPets || petsLoading) {
      return [];
    }

    const timer = new PerformanceTimer('pet-data-processing');
    
    const processed = rawPets
      .filter((pet) => !!pet?.id)
      .map((pet) => {
        const nameAsString = pet?.name !== undefined && pet?.name !== null ? String(pet.name) : "";
        const hasValidName = nameAsString.trim().length > 0;
        const speciesAsString = pet?.species !== undefined && pet?.species !== null ? String(pet.species) : "";
        const hasValidSpecies = speciesAsString.trim().length > 0;

        return {
          ...pet,
          name: hasValidName ? nameAsString.trim() : t('myPetTraining.pets.unnamedPet'),
          species: hasValidSpecies ? speciesAsString.trim() : t('myPetTraining.pets.defaultSpecies'),
          breed: pet.breed || undefined,
          age: pet.age || undefined,
          birth_date: pet.birth_date || undefined,
          behavior_focus: pet.behavior_focus || undefined,
          notes: pet.notes || undefined
        };
      });
    
    timer.end();
    return processed;
  }, [rawPets, petsLoading, t]);

  const primaryPet = useMemo(() => {
    return pets?.[0];
  }, [pets]);

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

  // IMPROVED: Better loading state logic with debug info
  const shouldShowLoading = petsLoading && !rawPets;

  // Debug logging to understand the issue
  console.log('🔍 MyPetTraining DEBUG:', {
    loading: loading,
    user: !!user,
    userId: user?.id,
    petsLoading: petsLoading,
    rawPets: rawPets ? rawPets.length : 'undefined',
    pets: pets ? pets.length : 'undefined',
    shouldShowLoading: shouldShowLoading,
    queryEnabled: !!user?.id && !loading,
    petsError: petsError
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

  // ENHANCED error handling for pets loading
  if (petsError && !pets?.length) {
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
              onClick={() => refetchPets()}
              className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition-colors"
            >
              {t('myPetTraining.page.error.retry')}
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

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
              isLoading={false} // Optimistic - never show loading overlay
              hasError={!!petsError}
              errorMessage={t('myPetTraining.page.error.petProfiles')}
            >
              {/* First Steps Guide and Progress Overview */}
              <Suspense fallback={<div className="h-64 animate-pulse bg-muted rounded-lg mb-8" />}>
                <LazyMainContentGrid pets={pets || []} />
              </Suspense>
              
              <div id="pet-section" className="mb-8">
                <Suspense fallback={<div className="h-64 animate-pulse bg-muted rounded-lg" />}>
                  <LazyPetProfileManager pets={pets || []} />
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
                pets={pets || []}
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
