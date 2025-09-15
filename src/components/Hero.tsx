
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { DevelopmentBadge } from "./hero/DevelopmentBadge";
import { FloatingElements } from "./hero/FloatingElements";
import { HeroContent } from "./hero/HeroContent";
import { HeroCarousel } from "./hero/HeroCarousel";
import { HeroFeatures } from "./hero/HeroFeatures";
import { HeroButtons } from "./hero/HeroButtons";
import { SocialProof } from "./hero/SocialProof";
import { BottomWave } from "./hero/BottomWave";
import { ThemeLogo } from "@/components/ui/theme-logo-home";
import { useTranslations } from "@/hooks/useTranslations";


export const Hero = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslations();

  // In development mode, skip subscription checks
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  // Check subscription status for authenticated users (skip in development)
  const { data: subscription } = useQuery({
    queryKey: ['subscription-status', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;
      return data;
    },
    enabled: !!user && !isDevelopment,
  });

  // Check if user has pets
  const { data: pets } = useQuery({
    queryKey: ['pets-count', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('pet_profiles')
        .select('id')
        .eq('user_id', user.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // In development mode, always consider user as having active subscription
  const hasActiveSubscription = isDevelopment ? true : (subscription?.subscribed && 
    (subscription?.subscription_status === 'active' || subscription?.subscription_status === 'trialing'));
  
  const hasPets = pets && pets.length > 0;

  const handleGoToTraining = () => {
    navigate('#pricing');
  };

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
        <DevelopmentBadge isDevelopment={isDevelopment} />

        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <FloatingElements />

        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full md:mt-10">
          {/* Logo prominently placed at the top */}
          <div className="mb-8 flex justify-center">
            <ThemeLogo 
              className="hidden md:block md:h-16 w-auto"
              onClick={() => navigate('/')}
            />
          </div>
          
          <HeroContent isDevelopment={isDevelopment} />
          
          {/* Hero Carousel */}
          <div className="mb-4 md:mb-8">
            <HeroCarousel />
          </div>
          
          <HeroFeatures />
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 sm:mb-12 animate-fade-in-up delay-400 px-4">
            <HeroButtons handleGoToTraining={handleGoToTraining} />
          </div>
          <SocialProof />
        </div>

        <BottomWave />
      </section>
    </>
  );
};
