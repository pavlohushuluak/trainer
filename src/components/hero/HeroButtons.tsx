
import { Button } from "@/components/ui/button";
import { Camera, Star } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

interface HeroButtonsProps {
  handleGoToTraining: () => void;
}

export const HeroButtons = ({ handleGoToTraining }: HeroButtonsProps) => {
  const { t } = useTranslations();

  return (
    <Button 
      onClick={handleGoToTraining}
      size="lg" 
      className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold bg-brand-gradient hover:opacity-90 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200 min-h-[48px]"
    >
      <Star className="mr-2 h-5 w-5" />
      {t('hero.startPremium')}
    </Button>
  );
};
