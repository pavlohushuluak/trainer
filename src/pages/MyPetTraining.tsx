
import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { getCheckoutInformation } from '@/utils/checkoutSessionStorage';

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
  const { user, session, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslations();
  const { toast } = useToast();

  // State for congratulations modal
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [upgradeDetails, setUpgradeDetails] = useState<any>(null);
  const [isAutoLoggingIn, setIsAutoLoggingIn] = useState(false);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

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
  // CRITICAL FIX: Move handlePaymentSuccess outside useEffect to make it accessible
  const handlePaymentSuccess = useCallback((sessionId: string, paymentType: string | null, isGuest: boolean) => {
    console.log('🎉 Processing payment success:', { sessionId, paymentType, isGuest });
    
    // Show success message
    toast({
      title: "Payment Successful!",
      description: "Your subscription has been activated successfully.",
      duration: 5000,
    });
    
    // Refresh subscription data
    refetchSubscription();
    
    // Clear URL parameters
    window.history.replaceState({}, document.title, '/mein-tiertraining');
  }, [toast, refetchSubscription]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const isCheckoutSuccess = searchParams.get('success') === 'true';
    const sessionId = searchParams.get('session_id');
    const paymentType = searchParams.get('payment');
    const isGuest = searchParams.get('guest') === 'true';
    const userEmail = searchParams.get('user_email');
    
    const autoLoginUser = async (email: string, sessionId: string, retryCount = 0) => {
      try {
        console.log(`🔄 Auto-login attempt ${retryCount + 1}/3 for user:`, email);
        console.log('🔍 Auto-login request details:', {
          email: email,
          sessionId: sessionId,
          retryCount: retryCount,
          timestamp: new Date().toISOString()
        });
        
        console.log('🔍 About to call auto-login-after-payment function...');
        
        // Call the auto-login function to create a session
        console.log('🔍 Calling supabase.functions.invoke with:', {
          functionName: 'auto-login-after-payment',
          body: {
            userEmail: email,
            sessionId: sessionId
          }
        });
        
        const { data, error } = await supabase.functions.invoke('auto-login-after-payment', {
          body: {
            userEmail: email,
            sessionId: sessionId
          }
        });

        console.log('🔍 Auto-login response:', {
          data: data,
          error: error,
          hasData: !!data,
          hasError: !!error,
          dataType: typeof data,
          errorType: typeof error
        });

        if (error) {
          console.error(`❌ Auto-login attempt ${retryCount + 1} failed:`, error);
          console.error('❌ Error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
            status: error.status,
            statusText: error.statusText
          });
          
          // If it's a retryable error and we haven't retried too much, try again
          if ((error.message?.includes('not confirmed') || 
               error.message?.includes('not yet processed') || 
               error.message?.includes('Payment not yet processed') ||
               error.message?.includes('retry') ||
               error.message?.includes('Failed to confirm email')) && retryCount < 2) {
            console.log(`⏳ Retrying auto-login in 3 seconds (attempt ${retryCount + 2}/3)...`);
            setTimeout(() => autoLoginUser(email, sessionId, retryCount + 1), 3000);
            return;
          }
          
          // CRITICAL FIX: If auto-login fails, store payment data and redirect to login with special handling
          console.error('❌ Auto-login failed after retries, storing payment data for manual login');
          console.error('❌ Full error object:', error);
          
          // Store the payment success data for manual login
          sessionStorage.setItem('paymentSuccessData', JSON.stringify({
            sessionId: sessionId,
            paymentType: paymentType,
            isGuest: isGuest,
            userEmail: email,
            timestamp: Date.now(),
            autoLoginFailed: true,
            error: error.message
          }));
          
          // Show success message with login instruction
          toast({
            title: "Payment Successful!",
            description: "Your payment was processed successfully. Please log in to activate your subscription.",
            duration: 8000,
          });
          
          // Redirect to login page with special message
          navigate('/login?message=payment_success_please_login');
          return;
        }

        if (data?.success) {
          console.log('✅ Auto-login successful, processing response:', data);
          setIsAutoLoggingIn(false);
          
          // CRITICAL FIX: Use action_link approach which is more reliable
          if (data.action_link) {
            console.log('🔄 Using action_link for auto-login:', data.action_link);
            
            // Store the session ID and other data for after login
            sessionStorage.setItem('pendingPaymentSuccess', JSON.stringify({
              sessionId: sessionId,
              paymentType: paymentType,
              isGuest: isGuest,
              userEmail: email,
              timestamp: Date.now()
            }));
            
            // Show loading message
            toast({
              title: "Completing Login...",
              description: "Please wait while we complete your login process.",
              duration: 5000,
            });
            
            // Redirect to the action_link which will automatically log the user in
            window.location.href = data.action_link;
            return;
          }
          
          // Fallback: Try to use direct session tokens if available
          if (data.session?.access_token && data.session?.refresh_token) {
            console.log('🔄 Setting session with tokens from auto-login response');
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token
            });
            
            if (sessionError) {
              console.error('❌ Error setting session:', sessionError);
              navigate('/login?message=payment_success_login_required');
              return;
            }
            
            console.log('✅ Session set successfully, proceeding with success handling');
            // Proceed with normal success handling
            if (handlePaymentSuccess) {
              handlePaymentSuccess(sessionId, paymentType, isGuest);
            } else {
              console.error('❌ handlePaymentSuccess function not available');
              // Fallback: show success message and refresh
              toast({
                title: "Payment Successful!",
                description: "Your subscription has been activated successfully.",
                duration: 5000,
              });
              refetchSubscription();
            }
          } else {
            console.log('⚠️ No action_link or session data returned, redirecting to login');
            navigate('/login?message=payment_success_login_required');
          }
        } else {
          console.error('❌ Auto-login failed:', data);
          navigate('/login?message=payment_success_login_required');
        }
      } catch (error) {
        console.error('❌ Auto-login exception:', error);
        navigate('/login?message=payment_success_login_required');
      }
    };

    if (isCheckoutSuccess) {
      console.log('🎉 Checkout success detected:', { 
        sessionId, 
        paymentType, 
        isGuest, 
        userEmail, 
        hasUser: !!user, 
        currentUserEmail: user?.email,
        decodedUserEmail: userEmail ? decodeURIComponent(userEmail) : null
      });
      
      console.log('🔍 User state analysis:', {
        'user object': user,
        'user exists': !!user,
        'user email': user?.email,
        'user id': user?.id,
        'session exists': !!session,
        'session user': session?.user,
        'auth loading': loading
      });
      
      // CRITICAL FIX: Enhanced auto-login logic for SmartLoginModal workflow
      const decodedUserEmail = userEmail ? decodeURIComponent(userEmail) : null;
      const needsUserSwitch = decodedUserEmail && user && user.email !== decodedUserEmail;
      const needsAutoLogin = !user && decodedUserEmail;
      const userMatches = user && decodedUserEmail && user.email === decodedUserEmail;
      
      console.log('🔍 Auto-login conditions:', {
        needsUserSwitch,
        needsAutoLogin,
        userMatches,
        hasUser: !!user,
        hasUserEmail: !!decodedUserEmail,
        currentUserEmail: user?.email,
        paymentUserEmail: decodedUserEmail,
        rawUserEmail: userEmail,
        decodedUserEmail: decodedUserEmail
      });
      
      console.log('🔍 Detailed analysis:', {
        'user exists': !!user,
        'user email': user?.email,
        'payment user email': decodedUserEmail,
        'emails match': user?.email === decodedUserEmail,
        'needs auto-login': needsAutoLogin,
        'needs user switch': needsUserSwitch,
        'user matches': userMatches
      });
      
      // CRITICAL DEBUG: Check if user is already logged in but logic is wrong
      if (user && decodedUserEmail) {
        console.log('🔍 User comparison:', {
          'user.email': user.email,
          'decodedUserEmail': decodedUserEmail,
          'exact match': user.email === decodedUserEmail,
          'lowercase match': user.email?.toLowerCase() === decodedUserEmail?.toLowerCase(),
          'trimmed match': user.email?.trim() === decodedUserEmail?.trim()
        });
      }
      
      if (needsUserSwitch) {
        console.log('🔄 Current user does not match payment user, switching users:', {
          currentUser: user.email,
          paymentUser: decodedUserEmail
        });
        
        // Clear current session and auto-login the correct user
        setIsAutoLoggingIn(true);
        
        // Sign out current user first
        supabase.auth.signOut().then(() => {
          // Wait a moment for signout to complete
          setTimeout(() => {
            autoLoginUser(decodedUserEmail, sessionId);
          }, 1000);
        });
        
      } else if (needsAutoLogin) {
        console.log('🔄 Attempting auto-login for user after payment success:', decodedUserEmail);
        console.log('🔄 Auto-login parameters:', {
          email: decodedUserEmail,
          sessionId: sessionId,
          timestamp: new Date().toISOString()
        });
        
        // CRITICAL FIX: Actually attempt auto-login instead of redirecting to login page
        setIsAutoLoggingIn(true);
        autoLoginUser(decodedUserEmail, sessionId);
      } else if (userMatches) {
        console.log('✅ Current user matches payment user, proceeding with success handling');
        // User is already logged in correctly, proceed with normal success handling
        if (handlePaymentSuccess) {
          handlePaymentSuccess(sessionId, paymentType, isGuest);
        } else {
          console.error('❌ handlePaymentSuccess function not available');
          // Fallback: show success message and refresh
          toast({
            title: "Payment Successful!",
            description: "Your subscription has been activated successfully.",
            duration: 5000,
          });
          refetchSubscription();
        }
      } else {
        console.log('⚠️ No user email provided or unexpected state, proceeding with normal success handling');
        console.log('⚠️ Debug info:', {
          hasUser: !!user,
          hasUserEmail: !!decodedUserEmail,
          userEmail: user?.email,
          paymentUserEmail: decodedUserEmail
        });
        if (handlePaymentSuccess) {
          handlePaymentSuccess(sessionId, paymentType, isGuest);
        } else {
          console.error('❌ handlePaymentSuccess function not available');
          // Fallback: show success message and refresh
          toast({
            title: "Payment Successful!",
            description: "Your subscription has been activated successfully.",
            duration: 5000,
          });
          refetchSubscription();
        }
      }
    }
  }, [location.search, user, refetchSubscription, fetchPets, navigate]);

  // CRITICAL FIX: Check for auto-login failure and provide manual login option
  useEffect(() => {
    const autoLoginFailed = sessionStorage.getItem('autoLoginFailed');
    if (autoLoginFailed && !user) {
      try {
        const failedData = JSON.parse(autoLoginFailed);
        console.log('🔍 Auto-login failed detected, providing manual login option:', failedData);
        
        // Show a more helpful message with manual login option
        toast({
          title: "Payment Successful!",
          description: "Your payment was processed successfully. Please log in to access your account.",
          duration: 15000,
          action: (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                // Clear the failed flag
                sessionStorage.removeItem('autoLoginFailed');
                // Redirect to login with helpful message
                navigate('/login?message=payment_success_manual_login_required');
              }}
            >
              Log In Now
            </Button>
          )
        });
        
        // Clear the failed flag after showing the message
        sessionStorage.removeItem('autoLoginFailed');
      } catch (error) {
        console.error('Error parsing autoLoginFailed data:', error);
        sessionStorage.removeItem('autoLoginFailed');
      }
    }
  }, [user, navigate, toast]);

  // CRITICAL FIX: Handle pending payment success after auto-login via action_link
  useEffect(() => {
    const pendingPaymentSuccess = sessionStorage.getItem('pendingPaymentSuccess');
    if (pendingPaymentSuccess && user && session) {
      try {
        const paymentData = JSON.parse(pendingPaymentSuccess);
        console.log('🔍 Pending payment success detected after auto-login:', paymentData);
        
        // Verify the user matches the payment user
        if (user.email === paymentData.userEmail) {
          console.log('✅ User matches payment user, processing payment success');
          
          // Clear the pending data
          sessionStorage.removeItem('pendingPaymentSuccess');
          
          // Proceed with payment success handling
          if (handlePaymentSuccess) {
            handlePaymentSuccess(paymentData.sessionId, paymentData.paymentType, paymentData.isGuest);
          } else {
            console.error('❌ handlePaymentSuccess function not available');
            // Fallback: show success message and refresh
            toast({
              title: "Payment Successful!",
              description: "Your subscription has been activated successfully.",
              duration: 5000,
            });
            refetchSubscription();
          }
        } else {
          console.log('⚠️ User does not match payment user, clearing pending data');
          sessionStorage.removeItem('pendingPaymentSuccess');
        }
        
      } catch (error) {
        console.error('Error parsing pendingPaymentSuccess data:', error);
        sessionStorage.removeItem('pendingPaymentSuccess');
      }
    }
  }, [user, session, handlePaymentSuccess]);

  // CRITICAL FIX: Handle payment success data when user logs in after payment
  useEffect(() => {
    const paymentSuccessData = sessionStorage.getItem('paymentSuccessData');
    if (paymentSuccessData && user && session) {
      try {
        const paymentData = JSON.parse(paymentSuccessData);
        console.log('🔍 Payment success data found after login:', paymentData);
        
        // Check if this is the same user who made the payment
        if (user.email === paymentData.userEmail) {
          console.log('✅ User matches payment user, processing payment success');
          
          // Clear the stored data
          sessionStorage.removeItem('paymentSuccessData');
          
          // Process payment success
          if (handlePaymentSuccess) {
            handlePaymentSuccess(paymentData.sessionId, paymentData.paymentType, paymentData.isGuest);
          } else {
            // Fallback
            toast({
              title: "Payment Successful!",
              description: "Your subscription has been activated successfully.",
              duration: 5000,
            });
            refetchSubscription();
          }
        } else {
          console.log('⚠️ User does not match payment user, clearing stored data');
          sessionStorage.removeItem('paymentSuccessData');
        }
        
      } catch (error) {
        console.error('Error parsing paymentSuccessData:', error);
        sessionStorage.removeItem('paymentSuccessData');
      }
    }
  }, [user, session, handlePaymentSuccess, refetchSubscription, toast]);

  // CRITICAL FIX: Handle tempUserData after auto-login from SmartLoginModal
  useEffect(() => {
    const tempUserData = sessionStorage.getItem('tempUserData');
    if (tempUserData && user && session) {
      try {
        const userData = JSON.parse(tempUserData);
        console.log('🔍 Temp user data found after auto-login:', userData);
        
        // Check if this is the same user
        if (user.email === userData.email) {
          console.log('✅ User matches temp user data, clearing stored data');
          
          // Clear the stored data
          sessionStorage.removeItem('tempUserData');
          
          // Check if there's pending checkout information
          const checkoutInfo = getCheckoutInformation();
          if (checkoutInfo) {
            console.log('🛒 Pending checkout found, processing checkout for auto-logged-in user');
            
            // Trigger checkout processing
            window.dispatchEvent(new CustomEvent('checkoutRequested', { 
              detail: { checkoutInfo, tempUserData: userData }
            }));
          } else {
            console.log('✅ No pending checkout, user is ready to use the app');
            toast({
              title: "Welcome!",
              description: "Your account has been created and you're now logged in.",
              duration: 3000,
            });
          }
        } else {
          console.log('⚠️ User does not match temp user data, clearing stored data');
          sessionStorage.removeItem('tempUserData');
        }
        
      } catch (error) {
        console.error('Error parsing tempUserData:', error);
        sessionStorage.removeItem('tempUserData');
      }
    }
  }, [user, session, toast]);

  // Check for pricing_click_data and SmartLoginModal data in sessionStorage and call create-checkout directly
  useEffect(() => {
    console.log('🔍 MyPetTraining: useEffect triggered', {
      hasUser: !!user,
      hasSession: !!session,
      userEmail: user?.email,
      timestamp: new Date().toISOString()
    });
    
    const checkPricingClickData = async () => {
      try {
        // Check if this is an OAuth callback
        const urlParams = new URLSearchParams(window.location.search);
        const isOAuthCallback = urlParams.has('code') || window.location.hash.includes('access_token');
        
        console.log('🔍 MyPetTraining: Starting checkout detection check', {
          hasUser: !!user,
          hasSession: !!session,
          userEmail: user?.email,
          currentUrl: window.location.href,
          searchParams: window.location.search,
          isOAuthCallback
        });
        
        // Check for both pricing_click_data (direct) and pendingPriceType (SmartLoginModal)
        const pricingClickData = sessionStorage.getItem('pricing_click_data');
        const pendingPriceType = sessionStorage.getItem('pendingPriceType');
        const pendingLoginContext = sessionStorage.getItem('pendingLoginContext');
        
        console.log('🔍 MyPetTraining: Found sessionStorage data', {
          pricingClickData,
          pendingPriceType,
          pendingLoginContext,
          allSessionStorage: Object.keys(sessionStorage).reduce((acc, key) => {
            acc[key] = sessionStorage.getItem(key);
            return acc;
          }, {} as Record<string, string>)
        });
        
        let priceType = null;
        let dataSource = null;
        
        if (pricingClickData && user && session) {
          // Direct pricing click data
          const parsedData = JSON.parse(pricingClickData);
          priceType = parsedData.priceType;
          dataSource = 'pricing_click_data';
          console.log('Found pricing_click_data with logged in user on mein-tiertraining, calling create-checkout directly:', parsedData);
          
          // Remove the data from sessionStorage immediately
          sessionStorage.removeItem('pricing_click_data');
        } else if (pendingPriceType && pendingLoginContext === 'checkout' && user && session) {
          // SmartLoginModal data
          priceType = pendingPriceType;
          dataSource = 'pendingPriceType';
          console.log('Found pendingPriceType with logged in user on mein-tiertraining, calling create-checkout directly:', { priceType, context: pendingLoginContext });
          
          // Remove the data from sessionStorage immediately
          sessionStorage.removeItem('pendingPriceType');
          sessionStorage.removeItem('pendingLoginContext');
        }
        
        if (priceType && user && session) {
          console.log('🔍 MyPetTraining: Processing checkout with data', {
            priceType,
            dataSource,
            userEmail: user.email,
            hasSession: !!session
          });
          
          setIsProcessingCheckout(false);
          
          // Call create-checkout directly
          const currentLanguage = localStorage.getItem('i18nextLng') || 'de';
          
          const { data, error } = await supabase.functions.invoke('create-checkout', {
            body: {
              priceType: priceType,
              successUrl: `${window.location.origin}/mein-tiertraining?success=true&session_id={CHECKOUT_SESSION_ID}&user_email=${encodeURIComponent(user?.email || '')}`,
              cancelUrl: `${window.location.origin}/mein-tiertraining`,
              language: currentLanguage,
              customerInfo: {
                name: user?.user_metadata?.full_name || user?.email?.split('@')[0]
              }
            }
          });

          if (error) {
            console.error('Error creating checkout:', error);
            // Redirect to pricing section on error (same as homepage)
            window.location.href = '/#pricing';
          } else if (data?.url) {
            console.log('Checkout created successfully, redirecting to:', data.url);
            // Redirect to Stripe checkout
            window.location.href = data.url;
          } else {
            console.error('No checkout URL returned');
            window.location.href = '/#pricing';
          }
        } else if (pricingClickData || pendingPriceType) {
          console.log('🔍 MyPetTraining: Found checkout data but user not logged in - removing data', {
            hasUser: !!user,
            hasSession: !!session,
            pricingClickData: !!pricingClickData,
            pendingPriceType: !!pendingPriceType
          });
          // Remove data when user is not logged in
          if (pricingClickData) sessionStorage.removeItem('pricing_click_data');
          if (pendingPriceType) sessionStorage.removeItem('pendingPriceType');
          if (pendingLoginContext) sessionStorage.removeItem('pendingLoginContext');
          setIsProcessingCheckout(false);
        } else {
          console.log('🔍 MyPetTraining: No checkout data found');
          setIsProcessingCheckout(false);
        }
      } catch (error) {
        console.error('Error checking pricing data:', error);
        setIsProcessingCheckout(false);
        // Remove corrupted data
        sessionStorage.removeItem('pricing_click_data');
        sessionStorage.removeItem('pendingPriceType');
        sessionStorage.removeItem('pendingLoginContext');
      }
    };

    // Add a delay to ensure session is properly established after OAuth
    // If this is an OAuth callback, wait longer for session establishment
    const urlParams = new URLSearchParams(window.location.search);
    const isOAuthCallback = urlParams.has('code') || window.location.hash.includes('access_token');
    const delay = isOAuthCallback ? 2000 : 500; // Longer delay for OAuth callbacks
    
    const timer = setTimeout(() => {
      checkPricingClickData();
    }, delay);
    
    return () => clearTimeout(timer);
  }, [user, session]);

  // Show loading only when absolutely necessary
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show auto-login loading overlay
  if (isAutoLoggingIn) {
    return (
      <MainLayout showFooter={false} showSupportButton={false}>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 max-w-md mx-4 text-center">
            <div className="flex flex-col items-center space-y-4">
              {/* Professional loading spinner */}
              <div className="relative">
                <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-600 rounded-full animate-spin border-t-primary"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-primary rounded-full animate-pulse"></div>
                </div>
              </div>
              
              {/* Loading text */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('checkout.autoLogin.title', 'Setting up your account...')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('checkout.autoLogin.description', 'Please wait while we confirm your payment and log you in automatically.')}
                </p>
              </div>
              
              {/* Progress indicator */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
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
              
              <div>
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
