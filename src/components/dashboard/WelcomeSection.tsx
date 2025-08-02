
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, User, Crown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface WelcomeSectionProps {
  petName?: string;
  onChatOpen: () => void;
}

export const WelcomeSection = ({ petName, onChatOpen }: WelcomeSectionProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Optimized subscription check with longer cache
  const { data: subscription } = useQuery({
    queryKey: ['subscription-status', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;
      return data;
    },
    enabled: !!user,
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Optimized pets check
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
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  const hasActiveSubscription = subscription?.subscribed && 
    (subscription?.subscription_status === 'active' || subscription?.subscription_status === 'trialing');
  
  const hasPets = pets && pets.length > 0;

  const handleUpgradeClick = () => {
    navigate('/#pricing');
    
    requestAnimationFrame(() => {
      setTimeout(() => {
        const pricingSection = document.getElementById('pricing');
        if (pricingSection) {
          pricingSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
          });
        }
      }, 100);
    });
  };

  const handleChatClick = () => {
    onChatOpen();
  };

  return (
    <div className="mb-8">
      {/* Hauptwillkommen-Card */}
      <Card className="border-none shadow-sm bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {t('dashboard.welcome.title')}
              </h1>
              <p className="text-gray-600">
                {petName 
                  ? t('dashboard.welcome.withPet', { petName }) 
                  : t('dashboard.welcome.noPet')
                }
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleChatClick}
                className="bg-primary hover:bg-primary/90"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                {t('dashboard.welcome.buttons.chatWithTrainer')}
              </Button>
              <Button 
                variant="outline"
                onClick={() => document.getElementById('pet-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <User className="h-4 w-4 mr-2" />
                {t('dashboard.welcome.buttons.managePetProfile')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade-Hinweis nur anzeigen wenn definitiv kein aktives Abo */}
      {user && subscription !== undefined && !hasActiveSubscription && (
        <Card className="mt-4 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Crown className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">
                    {t('dashboard.upgrade.title')}
                  </p>
                  <p className="text-sm text-blue-700">
                    {t('dashboard.upgrade.description')}
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleUpgradeClick}
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
              >
                {t('dashboard.upgrade.button')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
