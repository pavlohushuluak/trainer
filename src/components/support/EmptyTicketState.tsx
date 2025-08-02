
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';

export const EmptyTicketState = () => {
  const { t } = useTranslations();
  
  return (
    <div className="text-center py-8 text-muted-foreground">
      <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
      <p>{t('support.emptyState.title')}</p>
      <p className="text-sm">{t('support.emptyState.subtitle')}</p>
    </div>
  );
};
