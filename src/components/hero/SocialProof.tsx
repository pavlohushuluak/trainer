
import { Star } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

export const SocialProof = () => {
  const { t } = useTranslations();
  
  return (
    <div className="animate-fade-in-up delay-500">
      <div className="flex justify-center items-center gap-2 mb-4">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
          ))}
        </div>
        <span className="text-muted-foreground font-medium">{t('hero.socialProof.rating')}</span>
      </div>
      <p className="text-muted-foreground">
        {t('hero.socialProof.description')}
      </p>
    </div>
  );
};
