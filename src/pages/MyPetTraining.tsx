
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePetProfiles } from '@/hooks/usePetProfiles';
import { useTranslations } from '@/hooks/useTranslations';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AuthErrorDisplay } from '@/components/auth/AuthErrorDisplay';
import { LoadingStateManager } from '@/components/training/LoadingStateManager';
import { useNavigate } from 'react-router-dom';
import { SupportButton } from '@/components/support/SupportButton';
import { AlertCircle, Trophy, Star, Sparkles, CheckCircle, Zap, Crown } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Confetti from 'react-confetti';

// Add custom CSS for floating animation
const floatingAnimation = `
  @keyframes float {
    0%, 100% {
      transform: translateY(0px) rotate(0deg);
      opacity: 1;
    }
    25% {
      transform: translateY(-20px) rotate(90deg);
      opacity: 0.8;
    }
    50% {
      transform: translateY(-40px) rotate(180deg);
      opacity: 0.6;
    }
    75% {
      transform: translateY(-20px) rotate(270deg);
      opacity: 0.8;
    }
  }
  
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
  
  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
  
  .animate-shimmer {
    animation: shimmer 2s ease-in-out infinite;
  }
`;

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
  const navigate = useNavigate();
  const { t } = useTranslations();
  const { toast } = useToast();

  // State for congratulations modal
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [upgradeDetails, setUpgradeDetails] = useState<any>(null);

  // Use Redux for pet profiles data
  const {
    pets,
    loading: petsLoading,
    error: petsError,
    primaryPet,
    isInitialized: petsInitialized,
    fetchPets
  } = usePetProfiles();

  // Use subscription status for checkout success handling
  const { refetch: refetchSubscription, subscription, subscriptionTierName, tierLimit } = useSubscriptionStatus();

  // Check if we should open the pet modal from URL parameter
  const shouldOpenPetModal = new URLSearchParams(location.search).get('openPetModal') === 'true';

  // Check if user is admin (this will be handled by MainLayout now)
  const isAdmin = false; // This will be overridden by MainLayout

  // Get plan features based on subscription tier
  const getPlanFeatures = (tierName: string) => {
    switch (tierName) {
      case '1 Tier':
        return [
          t('subscription.features.unlimitedChat'),
          t('subscription.features.individualPlans'),
          t('subscription.features.imageAnalysis'),
          t('subscription.features.progressTracking'),
          t('subscription.features.onePetProfile')
        ];
      case '2 Tiere':
        return [
          t('subscription.features.unlimitedChat'),
          t('subscription.features.individualPlans'),
          t('subscription.features.imageAnalysis'),
          t('subscription.features.progressTracking'),
          t('subscription.features.twoPetProfiles'),
          t('subscription.features.individualPlansPerPet')
        ];
      case '3-4 Tiere':
        return [
          t('subscription.features.unlimitedChat'),
          t('subscription.features.individualPlans'),
          t('subscription.features.imageAnalysis'),
          t('subscription.features.progressTracking'),
          t('subscription.features.fourPetProfiles'),
          t('subscription.features.groupTraining'),
          t('subscription.features.advancedAnalytics')
        ];
      case '5-8 Tiere':
        return [
          t('subscription.features.unlimitedChat'),
          t('subscription.features.individualPlans'),
          t('subscription.features.imageAnalysis'),
          t('subscription.features.progressTracking'),
          t('subscription.features.eightPetProfiles'),
          t('subscription.features.professionalTools'),
          t('subscription.features.detailedReports')
        ];
      case 'Unbegrenzt':
        return [
          t('subscription.features.unlimitedChat'),
          t('subscription.features.individualPlans'),
          t('subscription.features.imageAnalysis'),
          t('subscription.features.progressTracking'),
          t('subscription.features.unlimitedPetProfiles'),
          t('subscription.features.enterpriseFeatures'),
          t('subscription.features.prioritySupport')
        ];
      default:
        return [
          t('subscription.features.unlimitedChat'),
          t('subscription.features.individualPlans'),
          t('subscription.features.imageAnalysis'),
          t('subscription.features.progressTracking')
        ];
    }
  };

  // Inject custom CSS for animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = floatingAnimation;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

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

  // Handle checkout success and refresh subscription data
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const isCheckoutSuccess = searchParams.get('success') === 'true';
    const sessionId = searchParams.get('session_id');
    const paymentType = searchParams.get('payment');
    const isGuest = searchParams.get('guest') === 'true';

    if (isCheckoutSuccess && user) {
      console.log('🎉 Checkout success detected:', { sessionId, paymentType, isGuest });
      
      // Show congratulations modal for successful upgrade
      setUpgradeDetails({
        sessionId,
        paymentType,
        isGuest,
        timestamp: new Date().toISOString()
      });
      setShowCongratulations(true);
      
      // Refresh subscription data after a short delay to ensure backend has processed the payment
      const refreshTimer = setTimeout(async () => {
        try {
          console.log('🔄 Refreshing subscription data after checkout success...');
          await refetchSubscription();
          console.log('✅ Subscription data refreshed successfully');
          
          // Also refresh pet profiles in case there were any changes
          if (fetchPets) {
            await fetchPets();
            console.log('✅ Pet profiles refreshed successfully');
          }
        } catch (error) {
          console.error('❌ Error refreshing data after checkout:', error);
        }
      }, 2000); // Wait 2 seconds for backend processing

      return () => clearTimeout(refreshTimer);
    }
  }, [location.search, user, refetchSubscription, fetchPets]);

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
                     {/* Enhanced Confetti for congratulations */}
           {showCongratulations && (
             <>
               {/* Main confetti layer */}
               <Confetti
                 width={window.innerWidth}
                 height={window.innerHeight}
                 recycle={true}
                 numberOfPieces={500}
                 gravity={0.3}
                 wind={0.05}
                 colors={[
                   '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#A8E6CF', '#FF8B94',
                   '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43', '#10AC84', '#FF3838', '#3742FA'
                 ]}
                 style={{
                   position: 'fixed',
                   top: 0,
                   left: 0,
                   zIndex: 9999,
                   pointerEvents: 'none'
                 }}
               />
               {/* Secondary sparkle layer */}
               <Confetti
                 width={window.innerWidth}
                 height={window.innerHeight}
                 recycle={true}
                 numberOfPieces={200}
                 gravity={0.1}
                 wind={0.02}
                 colors={['#FFFFFF', '#FFD700', '#FF6B6B', '#4ECDC4']}
                 style={{
                   position: 'fixed',
                   top: 0,
                   left: 0,
                   zIndex: 9998,
                   pointerEvents: 'none',
                   opacity: 0.8
                 }}
               />
               {/* Floating particles effect */}
               <div className="fixed inset-0 pointer-events-none z-[9997]">
                 {[...Array(50)].map((_, i) => (
                   <div
                     key={i}
                     className="absolute animate-float"
                     style={{
                       left: `${Math.random() * 100}%`,
                       top: `${Math.random() * 100}%`,
                       animationDelay: `${Math.random() * 3}s`,
                       animationDuration: `${3 + Math.random() * 4}s`
                     }}
                   >
                     <div className={`w-2 h-2 rounded-full ${
                       i % 4 === 0 ? 'bg-yellow-300 shadow-lg shadow-yellow-300/50' :
                       i % 4 === 1 ? 'bg-pink-300 shadow-lg shadow-pink-300/50' :
                       i % 4 === 2 ? 'bg-blue-300 shadow-lg shadow-blue-300/50' :
                       'bg-green-300 shadow-lg shadow-green-300/50'
                     } animate-pulse`} />
                   </div>
                 ))}
               </div>
             </>
           )}

          <div className="p-4 pb-8">
            <div className="max-w-7xl mx-auto">
              {/* Auth Error Display */}
              <AuthErrorDisplay />
              
              <div className="mb-8">
                <LazyComponentErrorBoundary>
                  <Suspense fallback={<div className="h-64 animate-pulse bg-muted rounded-lg" />}>
                    <HeroStorySection onChatOpen={() => navigate('/chat')} />
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


            </div>
          </div>
          
          <SupportButton />
        </div>

                 {/* Congratulations Modal */}
         <Dialog open={showCongratulations} onOpenChange={setShowCongratulations}>
           <DialogContent className="max-w-2xl w-[95vw] sm:w-full p-0 overflow-hidden mx-auto" style={{padding: '0px'}}>
             <div className="relative w-full">
               {/* Enhanced animated background gradient */}
               <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 animate-pulse"></div>
               {/* Additional shimmer effect */}
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
               {/* Sparkle overlay */}
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px] animate-pulse"></div>
              
                             {/* Content */}
               <div className="relative p-8 text-center w-full max-w-full">
                {/* Animated crown icon */}
                <div className="mb-8 animate-bounce">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full border-4 border-white/30 shadow-2xl">
                    <Crown className="h-12 w-12 text-white drop-shadow-lg" />
                  </div>
                </div>

                {/* Title with sparkles */}
                <div className="mb-6">
                  <h2 className="text-4xl font-bold text-white mb-3 flex items-center justify-center gap-3">
                    <Sparkles className="h-8 w-8 animate-ping text-yellow-300" />
                    {t('upgrade.subscription.congratulations.welcomeTo')} {subscriptionTierName}!
                    <Sparkles className="h-8 w-8 animate-ping text-yellow-300" style={{ animationDelay: '0.5s' }} />
                  </h2>
                  <p className="text-white/90 text-xl font-medium">
                    {t('upgrade.subscription.congratulations.planUpgraded')}
                  </p>
                  <p className="text-white/70 text-sm mt-2">
                    {t('upgrade.subscription.congratulations.accessToFeatures', { planName: subscriptionTierName })}
                  </p>
                </div>

                {/* Upgrade details */}
                {upgradeDetails && (
                  <div className="mb-8 p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <div className="p-2 bg-green-500/20 rounded-full">
                        <CheckCircle className="h-6 w-6 text-green-300" />
                      </div>
                      <span className="text-white/90 text-lg font-semibold">
                        {t('upgrade.subscription.congratulations.paymentSuccessful')}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {upgradeDetails.paymentType && (
                        <div className="text-center p-3 bg-white/5 rounded-lg">
                          <div className="text-white/80 mb-1">{t('upgrade.subscription.congratulations.paymentMethod')}</div>
                          <div className="text-white font-medium">
                            {upgradeDetails.paymentType === 'amazon' ? t('upgrade.subscription.congratulations.amazonPay') : t('upgrade.subscription.congratulations.stripe')}
                          </div>
                        </div>
                      )}
                      {upgradeDetails.isGuest && (
                        <div className="text-center p-3 bg-white/5 rounded-lg">
                          <div className="text-white/80 mb-1">{t('upgrade.subscription.congratulations.checkoutType')}</div>
                          <div className="text-white font-medium">{t('upgrade.subscription.congratulations.guestCheckout')}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Plan Status */}
                <div className="mb-8 p-6 bg-gradient-to-r from-white/15 to-white/5 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg">
                  <h3 className="text-white font-semibold text-lg mb-4 flex items-center justify-center gap-2">
                    <Star className="h-5 w-5 text-yellow-300" />
                    {t('upgrade.subscription.congratulations.yourPlan', { planName: subscriptionTierName })}
                  </h3>
                                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                    <div className="text-center p-3 bg-white/10 rounded-lg border border-white/20">
                      <div className="text-2xl mb-2">🎯</div>
                      <div className="text-white/90 text-xs font-medium">{t('upgrade.subscription.congratulations.upTo')} {tierLimit}</div>
                      <div className="text-white/70 text-xs">{t('upgrade.subscription.congratulations.petProfiles')}</div>
                    </div>
                    <div className="text-center p-3 bg-white/10 rounded-lg border border-white/20">
                      <div className="text-2xl mb-2">📚</div>
                      <div className="text-white/90 text-xs font-medium">{t('upgrade.subscription.congratulations.expertTraining')}</div>
                      <div className="text-white/70 text-xs">{t('upgrade.subscription.congratulations.guidance')}</div>
                    </div>
                    <div className="text-center p-3 bg-white/10 rounded-lg border border-white/20">
                      <div className="text-2xl mb-2">📸</div>
                      <div className="text-white/90 text-xs font-medium">{t('upgrade.subscription.congratulations.image')}</div>
                      <div className="text-white/70 text-xs">{t('upgrade.subscription.congratulations.analysis')}</div>
                    </div>
                    <div className="text-center p-3 bg-white/10 rounded-lg border border-white/20">
                      <div className="text-2xl mb-2">🏆</div>
                      <div className="text-white/90 text-xs font-medium">{t('upgrade.subscription.congratulations.priority')}</div>
                      <div className="text-white/70 text-xs">{t('upgrade.subscription.congratulations.support')}</div>
                    </div>
                  </div>
                </div>

                                 {/* Action buttons */}
                 <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <Button
                    onClick={() => setShowCongratulations(false)}
                    className="flex-1 bg-gradient-to-r from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 text-white border-white/30 backdrop-blur-sm font-medium py-3"
                  >
                    <Zap className="h-5 w-5 mr-2" />
                    {t('upgrade.subscription.congratulations.startTraining')}
                  </Button>
                </div>

                {/* Footer note */}
                <div className="mt-6 pt-4 border-t border-white/20">
                  <p className="text-white/60 text-xs">
                    {t('upgrade.subscription.congratulations.welcomeMessage', { planName: subscriptionTierName })} 🎉
                  </p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default MyPetTraining;
