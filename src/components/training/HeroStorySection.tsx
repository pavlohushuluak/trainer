
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, User, Crown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { useTranslations } from "@/hooks/useTranslations";

interface HeroStorySectionProps {
  onChatOpen: () => void;
}

const scrollToSubscriptionManagement = () => {
  // Use requestAnimationFrame for better performance
  requestAnimationFrame(() => {
    const subscriptionSection = document.querySelector('.subscription-management-section');
    if (subscriptionSection) {
      subscriptionSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
      
      // Nach dem Scrollen den "Pakete" Tab aktivieren
      setTimeout(() => {
        const paketeTab = document.querySelector('[data-value="plans"]') as HTMLElement;
        if (paketeTab) {
          paketeTab.click();
        }
      }, 500);
    }
  });
};

export const HeroStorySection = ({ onChatOpen }: HeroStorySectionProps) => {
  const { user } = useAuth();
  const { hasActiveSubscription } = useSubscriptionStatus();
  const { t } = useTranslations();

  // Check if user has pets
  const { data: pets } = useQuery({
    queryKey: ['pets-count', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('pet_profiles')
        .select('id, name')
        .eq('user_id', user.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const hasPets = pets && pets.length > 0;
  const primaryPetName = pets?.[0]?.name;

  const handleChatClick = () => {
    // Always open chat for authenticated users - the ChatModal handles access control internally
    onChatOpen();
  };

  return (
    <Card className="border-none shadow-sm bg-gradient-to-r from-primary/5 via-secondary to-accent/5 mb-8">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2">
              {t('training.heroStory.title')}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mb-4">
              {primaryPetName 
                ? `${t('training.heroStory.description.withPet')} ${primaryPetName}`
                : t('training.heroStory.description.withoutPet')
              }
            </p>
            <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
              <span>{t('training.heroStory.features.instantAnswers')}</span>
              <span>{t('training.heroStory.features.individualTraining')}</span>
              <span>{t('training.heroStory.features.behaviorAnalysis')}</span>
              {!hasActiveSubscription && <span>{t('training.heroStory.features.detailedPlans')}</span>}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 min-w-fit">
            <Button 
              onClick={handleChatClick}
              className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto"
              size="lg"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{t('training.heroStory.buttons.chatWithTrainer')}</span>
              <span className="sm:hidden">{t('training.heroStory.buttons.chatWithTrainer')}</span>
              {!hasActiveSubscription && hasPets && (
                <span className="ml-2 text-xs bg-green-500 px-2 py-1 rounded-full">
                  {t('training.heroStory.buttons.freeQuestions')}
                </span>
              )}
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => document.getElementById('pet-section')?.scrollIntoView({ behavior: 'smooth' })}
              size="lg"
              className="w-full sm:w-auto"
            >
              <User className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{t('training.heroStory.buttons.managePetProfile')}</span>
              <span className="sm:hidden">{t('training.heroStory.buttons.managePetProfile')}</span>
            </Button>
          </div>
        </div>

        {/* Upgrade-Hinweis für Nutzer ohne aktives Paket */}
        {user && !hasActiveSubscription && (
          <div className="mt-4 p-4 border border-primary/20 bg-primary/5 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-start sm:items-center gap-3">
                <Crown className="h-5 w-5 text-primary mt-0.5 sm:mt-0 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground text-sm sm:text-base">
                    {t('training.heroStory.premium.title')}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {t('training.heroStory.premium.description')}
                  </p>
                </div>
              </div>
              <Button 
                onClick={scrollToSubscriptionManagement}
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground w-full sm:w-auto text-sm"
                size="sm"
              >
                {t('training.heroStory.premium.button')}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
