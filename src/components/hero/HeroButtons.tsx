
import { Button } from "@/components/ui/button";
import { Camera, MessageCircle } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

interface HeroButtonsProps {
  handleGoToTraining: () => void;
  onStartChat?: () => void;
}

export const HeroButtons = ({ handleGoToTraining, onStartChat }: HeroButtonsProps) => {
  const { t } = useTranslations();
  return (
    <div className="flex flex-col gap-4 justify-center items-center mb-8 sm:mb-12 animate-fade-in-up delay-400 px-4">
      <Button 
        onClick={handleGoToTraining}
        size="lg" 
        className="w-full max-w-xs sm:max-w-none sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold bg-brand-gradient hover:opacity-90 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200 min-h-[48px]"
      >
        <Camera className="mr-2 h-5 w-5 flex-shrink-0" />
        <span className="text-center">{t('hero.startTraining')}</span>
      </Button>
    </div>
  );
};
