
import { useTranslations } from "@/hooks/useTranslations";

export const PricingFooter = () => {
  const { t } = useTranslations();
  
  return (
    <div className="text-center mt-12 text-sm text-muted-foreground max-w-2xl mx-auto">
      <p>
        {t('pricing.footer.features')}
      </p>
      <div className="mt-3 text-xs text-green-600 font-medium">
        {t('pricing.footer.refundInfo')}
      </div>
    </div>
  );
};
