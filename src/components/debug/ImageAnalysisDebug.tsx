import React from 'react';
import { useImageAnalysisLimit } from '@/hooks/useImageAnalysisLimit';
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

export const ImageAnalysisDebug = () => {
  const { user } = useAuth();
  const { hasActiveSubscription, subscriptionMode } = useSubscriptionStatus();
  const { t } = useTranslation();
  const {
    analysesUsed,
    maxAnalyses,
    remainingAnalyses,
    hasReachedLimit,
    canAnalyze,
    incrementUsage,
    resetUsage,
    loading,
    error
  } = useImageAnalysisLimit();

  const handleIncrement = async () => {
    console.log('🔍 Debug - Manually incrementing usage');
    const result = await incrementUsage();
    console.log('🔍 Debug - Increment result:', result);
  };

  const handleReset = async () => {
    console.log('🔍 Debug - Resetting usage');
    const result = await resetUsage();
    console.log('🔍 Debug - Reset result:', result);
  };

  return (
    <Card className="border-2 border-red-500">
      <CardHeader>
        <CardTitle>{t('debug.imageAnalysis.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>{t('debug.imageAnalysis.fields.userId')}:</strong> {user?.id || t('debug.imageAnalysis.values.noUser')}
          </div>
          <div>
            <strong>{t('debug.imageAnalysis.fields.subscription')}:</strong> {subscriptionMode} ({hasActiveSubscription ? t('debug.imageAnalysis.values.active') : t('debug.imageAnalysis.values.inactive')})
          </div>
          <div>
            <strong>{t('debug.imageAnalysis.fields.analysesUsed')}:</strong> {analysesUsed}
          </div>
          <div>
            <strong>{t('debug.imageAnalysis.fields.maxAnalyses')}:</strong> {maxAnalyses}
          </div>
          <div>
            <strong>{t('debug.imageAnalysis.fields.remaining')}:</strong> {remainingAnalyses}
          </div>
          <div>
            <strong>{t('debug.imageAnalysis.fields.hasReachedLimit')}:</strong> {hasReachedLimit ? t('debug.imageAnalysis.values.yes') : t('debug.imageAnalysis.values.no')}
          </div>
          <div>
            <strong>{t('debug.imageAnalysis.fields.canAnalyze')}:</strong> {canAnalyze ? t('debug.imageAnalysis.values.yes') : t('debug.imageAnalysis.values.no')}
          </div>
          <div>
            <strong>{t('debug.imageAnalysis.fields.loading')}:</strong> {loading ? t('debug.imageAnalysis.values.yes') : t('debug.imageAnalysis.values.no')}
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-sm">
            <strong>{t('debug.imageAnalysis.fields.error')}:</strong> {error.message}
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={handleIncrement} variant="outline" size="sm">
            {t('debug.imageAnalysis.buttons.testIncrement')}
          </Button>
          <Button onClick={handleReset} variant="outline" size="sm">
            {t('debug.imageAnalysis.buttons.resetUsage')}
          </Button>
        </div>

        <div className="text-xs text-gray-500">
          <p>{t('debug.imageAnalysis.note')}</p>
        </div>
      </CardContent>
    </Card>
  );
}; 