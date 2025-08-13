import { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Hero } from "@/components/Hero";

import { StickyPremiumButton } from "@/components/StickyPremiumButton";
import { SmartLoginModal } from "@/components/auth/SmartLoginModal";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useAuth } from "@/hooks/useAuth";
import { useAuthOperations } from "@/hooks/auth/useAuthOperations";
import { useSmartLogin } from "@/hooks/useSmartLogin";
import { usePetDataPrefetch } from "@/hooks/usePetDataPrefetch";
import { usePetProfiles } from "@/hooks/usePetProfiles";

// Lazy load heavy components with proper default export handling
const Benefits = lazy(() => import("@/components/Benefits").then(module => ({ default: module.Benefits })));
const Pricing = lazy(() => import("@/components/Pricing").then(module => ({ default: module.Pricing })));
const Testimonials = lazy(() => import("@/components/Testimonials").then(module => ({ default: module.Testimonials })));
const FAQ = lazy(() => import("@/components/FAQ").then(module => ({ default: module.FAQ })));
const ChatModal = lazy(() => import("@/components/ChatModal").then(module => ({ default: module.ChatModal })));

// Loading fallback component
const SectionLoader = ({ height = "h-32" }: { height?: string }) => (
  <div className={`${height} flex items-center justify-center`}>
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const Index = () => {
  const [showChatModal, setShowChatModal] = useState(false);
  const { trackEvent } = useAnalytics();
  const { user, session } = useAuth();
  const { signOut } = useAuthOperations();
  const navigate = useNavigate();
  
  // Prefetch pet data for logged-in users for faster navigation
  const { pets, isAdmin, hasPrefetchedData } = usePetDataPrefetch();
  
  // Simplified login logic without subscription checks on homepage
  const { 
    isLoginModalOpen, 
    setIsLoginModalOpen, 
    requireAuth, 
    handleLoginSuccess 
  } = useSmartLogin({
    redirectToCheckout: true,
    loginContext: 'checkout'
  });

  useEffect(() => {
    trackEvent('page_view');
    
    // Handle OAuth callback and auto-login logic
    const handleOAuthCallback = async () => {
      // Check if this is an OAuth callback with session
      const urlParams = new URLSearchParams(window.location.search);
      const isOAuthCallback = urlParams.has('code') || window.location.hash.includes('access_token');
      
      if (isOAuthCallback && user && session) {
        // Check for stored package selection
        const storedPriceType = sessionStorage.getItem('pendingPriceType');
        const storedLoginContext = sessionStorage.getItem('pendingLoginContext');
        
        if (storedPriceType || storedLoginContext === 'checkout') {
          // Trigger smart login logic for checkout
          await handleLoginSuccess();
        } else {
          // Clear URL parameters but stay on homepage
          window.history.replaceState({}, document.title, '/');
        }
        return;
      }
    };

    // Handle OAuth callback
    handleOAuthCallback();
    
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

  const handleStartChat = () => {
    requireAuth(() => {
      setShowChatModal(true);
      trackEvent('chat_started');
    });
  };

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
        <Hero onStartChat={handleStartChat} />
      </div>
      aaa
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
      
      {/* Optimized Chat Modal with prefetched pets */}
      {user && (
        <Suspense fallback={null}>
          <ChatModal 
            isOpen={showChatModal} 
            onClose={() => setShowChatModal(false)}
          />
        </Suspense>
      )}

      {/* Smart Login Modal - erscheint automatisch bei geschützten Aktionen */}
      <SmartLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        title="Starte dein Tiertraining – bitte melde dich zuerst an"
        description="Fast geschafft – melde dich kurz an, um dein kostenloses Tiertraining zu starten."
      />

      <StickyPremiumButton />
    </>
  );
};

export default Index;
