
import { Shield } from "lucide-react";
import { useTranslation } from "react-i18next";

export const FreeTrialHighlight = () => {
  const { t } = useTranslation();
  
  return (
    <div className="text-center mb-12">
      <div className="inline-block bg-gradient-to-r from-green-50 to-emerald-50 px-8 py-6 rounded-2xl border-2 border-green-200 shadow-lg">
        <h3 className="text-2xl font-bold text-green-800 mb-3 flex items-center justify-center gap-2">
          <Shield className="h-6 w-6 text-green-600" />
          {t('pricing.freeTrial.guarantee')}
        </h3>
        <p className="text-green-700 font-medium mb-2">
          {t('pricing.freeTrial.startToday')}
        </p>
        <p className="text-sm text-green-600">
          {t('pricing.freeTrial.description')}
        </p>
      </div>
    </div>
  );
};
