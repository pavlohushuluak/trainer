
import { useTranslations } from "@/hooks/useTranslations";

export const PricingHeader = () => {
  const { t } = useTranslations();
  
  return (
    <div className="text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12 px-3 sm:px-4">
      <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 md:mb-6 leading-tight px-2 sm:px-0">
        {t('pricing.header.title')}
      </h2>
      <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto mb-4 sm:mb-6 md:mb-8 leading-relaxed px-2 sm:px-0">
        {t('pricing.header.subtitle')}
      </p>
    </div>
  );
};
