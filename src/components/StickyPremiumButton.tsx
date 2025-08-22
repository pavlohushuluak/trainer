
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { useAuth } from "@/hooks/useAuth";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";

export const StickyPremiumButton = () => {
  const { t } = useTranslations();
  const { user } = useAuth();
  const { hasActiveSubscription } = useSubscriptionStatus();

  const scrollToPricingCards = () => {
    // Use requestAnimationFrame to ensure smooth scrolling
    requestAnimationFrame(() => {
      // First try to find the pricing section
      const pricingSection = document.getElementById('pricing');
      
      if (pricingSection) {
        // Look specifically for the PricingToggle component within the pricing section
        const pricingToggle = pricingSection.querySelector('.flex.justify-center.mb-12') ||
                             pricingSection.querySelector('button[class*="px-6"][class*="py-3"]') ||
                             pricingSection.querySelector('.bg-secondary.border.border-border');
        
        if (pricingToggle) {
          pricingToggle.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
          return;
        }
        
        // If no toggle found, scroll to the pricing section
        pricingSection.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
        return;
      }

      // Fallback: Look for pricing toggle anywhere on the page
      const pricingToggle = document.querySelector('.flex.justify-center.mb-12') || 
                           document.querySelector('button[class*="px-6"][class*="py-3"]') ||
                           document.querySelector('.bg-secondary.border.border-border');
      
      if (pricingToggle) {
        pricingToggle.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
        return;
      }

      // Final fallback: Look for pricing cards
      const pricingCards = document.querySelector('.pricing-cards-section') ||
                          document.querySelector('#pricing .max-w-7xl');
      
      if (pricingCards) {
        pricingCards.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }
    });
  };

  // Only show for free users or non-logged in users
  if (user && hasActiveSubscription) {
    return null; // Don't show anything for premium users
  }

  // For free users or non-logged in users, show Start Premium Now button
  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in-up">
      <Button 
        className="bg-brand-gradient hover:opacity-90 text-white px-6 py-3 shadow-lg rounded-full font-semibold animate-pulse-soft"
        onClick={scrollToPricingCards}
      >
        <Sparkles className="w-5 h-5 mr-2" />
        {t('pricing.startPremium')}
      </Button>
    </div>
  );
};
