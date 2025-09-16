import { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";

import { Hero } from "@/components/Hero";
import { StickyPremiumButton } from "@/components/StickyPremiumButton";
import { SmartLoginModal } from "@/components/auth/SmartLoginModal";
import { VerificationCodeModal } from "@/components/auth/VerificationCodeModal";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useAuth } from "@/hooks/useAuth";
import { useSmartLogin } from "@/hooks/useSmartLogin";
import { usePetDataPrefetch } from "@/hooks/usePetDataPrefetch";
import { useVerificationCode } from "@/hooks/auth/useVerificationCode";
import { supabase } from "@/integrations/supabase/client";
import { getCheckoutInformation, removeCheckoutInformation } from "@/utils/checkoutSessionStorage";

// Lazy load heavy components with proper default export handling
const Benefits = lazy(() => import("@/components/Benefits").then(module => ({ default: module.Benefits })));
const Pricing = lazy(() => import("@/components/Pricing").then(module => ({ default: module.Pricing })));
const Testimonials = lazy(() => import("@/components/Testimonials").then(module => ({ default: module.Testimonials })));
const FAQ = lazy(() => import("@/components/FAQ").then(module => ({ default: module.FAQ })));


// Loading fallback component
const SectionLoader = ({ height = "h-32" }: { height?: string }) => (
  <div className={`${height} flex items-center justify-center`}>
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const Index = () => {
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [showVerificationCode, setShowVerificationCode] = useState(false);
  const [cancelledUserEmail, setCancelledUserEmail] = useState('');
  const [cancelledUserPassword, setCancelledUserPassword] = useState('');

  const { trackEvent } = useAnalytics();
  const { user, session } = useAuth();
  const navigate = useNavigate();

  // Verification code hook for cancelled checkout users
  const { verifyCode, resendCode, loading: verificationLoading, error: verificationError } = useVerificationCode({
    email: cancelledUserEmail,
    password: cancelledUserPassword,
    onSuccess: () => {
      setShowVerificationCode(false);
      setCancelledUserEmail('');
      setCancelledUserPassword('');
      // User will be automatically logged in by the verification code hook
      setTimeout(() => {
        navigate('/mein-tiertraining');
      }, 1000);
    },
    onError: (error) => {
      console.error('Verification failed:', error);
    }
  });
  
  // Prefetch pet data for logged-in users for faster navigation
  const { pets, isAdmin, hasPrefetchedData } = usePetDataPrefetch();
  
  // Simplified login logic without subscription checks on homepage
  const { 
    isLoginModalOpen, 
    setIsLoginModalOpen, 
    handleLoginSuccess 
  } = useSmartLogin({
    redirectToCheckout: true,
    loginContext: 'checkout',
    skipWelcomeToast: true,
    skipRedirect: true
  });

  // Simplified checkout workflow: Check for checkout data after Google signin
  useEffect(() => {
    const processCheckoutAfterSignin = async () => {
      // Only process if user is authenticated
      if (!user || !session) {
        return;
      }

      // Check for checkout data in sessionStorage
      const checkoutData = sessionStorage.getItem('homepage_checkout_data');
      
      if (checkoutData) {
        try {
          const parsedData = JSON.parse(checkoutData);
          console.log('🏠 Homepage: Found checkout data after Google signin, processing checkout:', parsedData);
          
          // Remove checkout data immediately
          sessionStorage.removeItem('homepage_checkout_data');
          setIsProcessingCheckout(true);
          
          const currentLanguage = localStorage.getItem('i18nextLng') || 'de';
          
          const { data, error } = await supabase.functions.invoke('create-checkout', {
            body: {
              priceType: parsedData.priceType,
              successUrl: `${window.location.origin}/mein-tiertraining?success=true&session_id={CHECKOUT_SESSION_ID}&user_email=${encodeURIComponent(user.email || '')}`,
              cancelUrl: `${window.location.origin}/`,
              language: currentLanguage,
              customerInfo: {
                name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
              }
            }
          });

          if (error) {
            console.error('🏠 Homepage: Error creating checkout:', error);
            window.location.href = '/#pricing';
          } else if (data?.url) {
            console.log('🏠 Homepage: Checkout created successfully, redirecting to:', data.url);
            window.location.href = data.url;
          } else {
            console.error('🏠 Homepage: No checkout URL returned');
            window.location.href = '/#pricing';
          }
        } catch (error) {
          console.error('🏠 Homepage: Error parsing checkout data:', error);
          sessionStorage.removeItem('homepage_checkout_data');
          window.location.href = '/#pricing';
        } finally {
          setIsProcessingCheckout(false);
        }
      }
    };

    processCheckoutAfterSignin();
  }, [user, session]);


  // Check for cancelled checkout and handle verification code flow
  useEffect(() => {
    const handleCancelledCheckout = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const checkoutCancelled = urlParams.get('checkout_cancelled') === 'true';
      
      if (checkoutCancelled) {
        console.log('Checkout was cancelled, checking for unconfirmed user...');
        
        // Check if we have temporary user data from signup
        const tempUserData = sessionStorage.getItem('tempUserData');
        
        if (tempUserData) {
          try {
            const tempUser = JSON.parse(tempUserData);
            console.log('Found temp user data from cancelled checkout:', tempUser.email);
            
            // Send verification email to the user who cancelled checkout
            const { error } = await supabase.functions.invoke('send-verification-after-cancellation', {
              body: { email: tempUser.email }
            });

            if (error) {
              console.error('Error sending verification email after cancellation:', error);
            } else {
              console.log('Verification email sent successfully after checkout cancellation');
              
              // Show verification code modal
              setCancelledUserEmail(tempUser.email);
              setCancelledUserPassword(''); // We don't have the password stored
              setShowVerificationCode(true);
              
              // Clean up temp user data
              sessionStorage.removeItem('tempUserData');
            }
          } catch (error) {
            console.error('Error processing cancelled checkout:', error);
          }
        } else if (user && !user.email_confirmed_at) {
          // Handle case where user is logged in but unconfirmed
          console.log('Checkout was cancelled for unconfirmed logged-in user:', user.email);
          
          try {
            const { error } = await supabase.functions.invoke('send-verification-after-cancellation', {
              body: { email: user.email }
            });

            if (error) {
              console.error('Error sending verification email after cancellation:', error);
            } else {
              console.log('Verification email sent successfully after checkout cancellation');
              
              // Show verification code modal
              setCancelledUserEmail(user.email);
              setCancelledUserPassword(''); // We don't have the password stored
              setShowVerificationCode(true);
            }
          } catch (error) {
            console.error('Error calling send-verification-after-cancellation:', error);
          }
        }

        // Clean up URL parameters
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    };

    handleCancelledCheckout();
  }, [user, session]);



  useEffect(() => {
    // Page view tracking is now handled by PageViewTracker component
    
    // Clear URL parameters if this is an OAuth callback (handled by useAuthCallback)
    const urlParams = new URLSearchParams(window.location.search);
    const isOAuthCallback = urlParams.has('code') || window.location.hash.includes('access_token');
    
    if (isOAuthCallback) {
      // Clear URL parameters but stay on homepage - useAuthCallback will handle the redirect
      window.history.replaceState({}, document.title, '/');
    }
    
    // Handle pricing hash scroll with improved logic
    if (window.location.hash === '#pricing') {
      // Use requestAnimationFrame and timeout for better scroll behavior
      requestAnimationFrame(() => {
        setTimeout(() => {
          const pricingSection = document.getElementById('pricing');
          if (pricingSection) {
            // Ensure the page isn't locked by resetting any potential scroll issues
            document.body.style.overflow = 'auto';
            document.documentElement.style.overflow = 'auto';
            
            pricingSection.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start',
              inline: 'nearest'
            });
            
            // Clean up the hash after successful scroll
            setTimeout(() => {
              window.history.replaceState({}, document.title, '/');
            }, 1000);
          }
        }, 200);
      });
    }
  }, [user, session, handleLoginSuccess, trackEvent]);

  // Log prefetch status for performance monitoring
  useEffect(() => {
    if (user && hasPrefetchedData) {
    }
  }, [user, hasPrefetchedData]);

  const handleGoToTraining = () => {
    // Optimized navigation with prefetched data
    if (user && session) {
      
      navigate('/mein-tiertraining');
    } else {
      // Improved scroll to pricing with better targeting
      requestAnimationFrame(() => {
        setTimeout(() => {
          // Ensure page can scroll
          document.body.style.overflow = 'auto';
          document.documentElement.style.overflow = 'auto';
          
          // First try to find the pricing section
          const pricingSection = document.getElementById('pricing');
          if (pricingSection) {
            pricingSection.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start',
              inline: 'nearest'
            });
            return;
          }

          // Fallback: Look for pricing toggle or cards
          const pricingToggle = document.querySelector('[class*="pricing-toggle"]') || 
                               document.querySelector('.grid.w-full.grid-cols-2') ||
                               document.querySelector('button[class*="px-6"][class*="py-3"]');
          
          if (pricingToggle) {
            pricingToggle.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center',
              inline: 'nearest'
            });
            return;
          }

          // Final fallback
          const pricingCards = document.querySelector('.pricing-cards-section') ||
                              document.querySelector('#pricing .max-w-7xl');
          
          if (pricingCards) {
            pricingCards.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start',
              inline: 'nearest'
            });
          }
        }, 200);
      });
    }
  };

  return (
    <>
      <div id="hero">
        <Hero />
      </div>
      <div id="benefits">
        <Suspense fallback={<SectionLoader height="h-96" />}>
          <Benefits />
        </Suspense>
      </div>
      <div id="pricing">
        <Suspense fallback={<SectionLoader height="h-screen" />}>
          <Pricing />
        </Suspense>
      </div>
      <Suspense fallback={<SectionLoader />}>
        <div id="testimonials">
          <Testimonials />
        </div>
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <div id="faq">
          <FAQ />
        </div>
      </Suspense>
      


      {/* Smart Login Modal - erscheint automatisch bei geschützten Aktionen */}
      <SmartLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        title="Starte dein Tiertraining – bitte melde dich zuerst an"
        description="Fast geschafft – melde dich kurz an, um dein kostenloses Tiertraining zu starten."
      />

      <StickyPremiumButton />

      {/* Professional Checkout Processing Overlay */}
      {isProcessingCheckout && (
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
              
              {/* Professional message */}
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Processing Your Request
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Generating checkout for payment...
                </p>
              </div>
              
              {/* Professional progress indicator */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
              </div>
              
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Please wait while we prepare your secure checkout
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Verification Code Modal for cancelled checkout */}
      <VerificationCodeModal
        isOpen={showVerificationCode}
        onClose={() => {
          setShowVerificationCode(false);
          setCancelledUserEmail('');
          setCancelledUserPassword('');
        }}
        email={cancelledUserEmail}
        onVerify={verifyCode}
        onResend={resendCode}
        loading={verificationLoading}
        error={verificationError}
      />
    </>
  );
};

export default Index;
