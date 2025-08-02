
import { Target } from "lucide-react";
import { useTranslation } from "react-i18next";

export const EmptyStepsState = () => {
  const { t } = useTranslation();
  
  return (
    <div className="text-center text-gray-500 py-4">
      <Target className="h-8 w-8 mx-auto mb-2 text-gray-300" />
      <p className="text-sm">{t('training.emptyStepsState.title')}</p>
      <p className="text-xs">{t('training.emptyStepsState.subtitle')}</p>
    </div>
  );
};
