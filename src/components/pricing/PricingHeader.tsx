
import { useTranslations } from "@/hooks/useTranslations";

export const PricingHeader = () => {
  const { t } = useTranslations();
  
  return (
    <div className="text-center mb-4 md:mb-8">
      <h2 className="text-2xl md:text-3xl xl:text-4xl font-bold text-foreground mb-2">
        {t('pricing.header.title')}
      </h2>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4 md:mb-8">
        {t('pricing.header.subtitle')}
      </p>
    </div>
  );
};
