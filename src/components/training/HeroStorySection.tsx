
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { useTranslations } from "@/hooks/useTranslations";

interface HeroStorySectionProps {
  onChatOpen: () => void;
}


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
    <Card className="border-none shadow-sm bg-gradient-to-r from-primary/5 via-secondary to-accent/5">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-foreground mb-2 sm:mb-3">
              {t('training.heroStory.title')}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 leading-relaxed">
              {primaryPetName
                ? `${t('training.heroStory.description.withPet')} ${primaryPetName}`
                : t('training.heroStory.description.withoutPet')
              }
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-shrink-0">
            <Button
              onClick={handleChatClick}
              className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto text-sm sm:text-base py-2.5 sm:py-3 px-4 sm:px-6"
              size="lg"
            >
              <MessageCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">{t('training.heroStory.buttons.chatWithTrainer')}</span>
              {!hasActiveSubscription && hasPets && (
                <span className="ml-2 text-xs bg-green-500 px-2 py-1 rounded-full flex-shrink-0">
                  {t('training.heroStory.buttons.freeQuestions')}
                </span>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => document.getElementById('pet-section')?.scrollIntoView({ behavior: 'smooth' })}
              size="lg"
              className="w-full sm:w-auto text-sm sm:text-base py-2.5 sm:py-3 px-4 sm:px-6"
            >
              <User className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">{t('training.heroStory.buttons.managePetProfile')}</span>
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 sm:gap-3 lg:gap-6 text-xs sm:text-sm text-muted-foreground mt-3 lg:mt-0">
          <span className="inline-flex items-center">
            <span className="w-1.5 h-1.5 bg-primary/60 rounded-full mr-1.5 sm:mr-2 flex-shrink-0"></span>
            {t('training.heroStory.features.instantAnswers')}
          </span>
          <span className="inline-flex items-center">
            <span className="w-1.5 h-1.5 bg-primary/60 rounded-full mr-1.5 sm:mr-2 flex-shrink-0"></span>
            {t('training.heroStory.features.individualTraining')}
          </span>
          <span className="inline-flex items-center">
            <span className="w-1.5 h-1.5 bg-primary/60 rounded-full mr-1.5 sm:mr-2 flex-shrink-0"></span>
            {t('training.heroStory.features.behaviorAnalysis')}
          </span>
          {!hasActiveSubscription && (
            <span className="inline-flex items-center">
              <span className="w-1.5 h-1.5 bg-primary/60 rounded-full mr-1.5 sm:mr-2 flex-shrink-0"></span>
              {t('training.heroStory.features.detailedPlans')}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
