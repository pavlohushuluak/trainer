
import { Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const EmptyPlansState = () => {
  const { t } = useTranslation();
  
  return (
    <div className="text-center text-muted-foreground py-6">
      <Target className="h-8 w-8 mx-auto mb-2 text-gray-300" />
      <p className="text-sm">{t('training.emptyPlansState.title')}</p>
      <p className="text-xs">{t('training.emptyPlansState.subtitle')}</p>
    </div>
  );
};
