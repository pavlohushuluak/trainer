
import { CheckCircle2 } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

export const HeroFeatures = () => {
  const { t } = useTranslations();
  
  return (
    <div className="flex flex-wrap justify-center gap-6 mb-10 animate-fade-in-up delay-300">
      <div className="flex items-center gap-2 text-muted-foreground">
        <CheckCircle2 className="h-5 w-5 text-green-500" />
        <span>{t('hero.features.trainerAvailable')}</span>
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <CheckCircle2 className="h-5 w-5 text-green-500" />
        <span>{t('hero.features.customized')}</span>
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <CheckCircle2 className="h-5 w-5 text-green-500" />
        <span>{t('hero.features.imageAnalysis')}</span>
      </div>
    </div>
  );
};
