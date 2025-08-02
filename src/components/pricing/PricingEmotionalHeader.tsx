
import { format, addDays } from "date-fns";
import { de } from "date-fns/locale";
import { useTranslations } from "@/hooks/useTranslations";

export const PricingEmotionalHeader = () => {
  const { t } = useTranslations();
  const trialEndDate = addDays(new Date(), 14);

  return (
    <div className="text-center mb-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        🐾 {t('pricing.title')}
      </h2>
      <p className="text-lg text-gray-600 max-w-3xl mx-auto">
        {t('pricing.subtitle')}
      </p>
      <div className="mt-4 text-sm text-green-600 font-medium">
        {t('pricing.guarantee')}
      </div>
    </div>
  );
};
