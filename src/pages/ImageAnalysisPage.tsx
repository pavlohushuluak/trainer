import { Camera, Upload, Zap, AlertCircle } from 'lucide-react';
import MainNavigation from '@/components/layout/MainNavigation';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnimalImageUpload } from '@/components/training/image-analysis/AnimalImageUpload';
import { useState, useEffect } from 'react';
import { AnalysisDisplaySection } from '@/components/training/image-analysis/AnalysisDisplaySection';
import { useImageAnalysisLimit } from '@/hooks/useImageAnalysisLimit';
import { ImageAnalysisLimitDisplay } from '@/components/training/image-analysis/ImageAnalysisLimitDisplay';
import { useImageAnalysisLogic } from '@/components/training/image-analysis/hooks/useImageAnalysisLogic';
import { useTranslations } from '@/hooks/useTranslations';

const ImageAnalysisPage = () => {
  const { user } = useAuth();
  const { t } = useTranslations();
  
  // Create a temporary pet object for the standalone page
  const tempPet = {
    id: 'temp-standalone',
    name: 'Ihr Tier',
    species: 'Hund'
  };
  
  const {
    analysisResult,
    trainingPlan,
    showPlan,
    handleUploadComplete,
    handleCreatePlan,
    handleSavePlan,
    handleSaveAnalysis,
    handleStartOver
  } = useImageAnalysisLogic(tempPet);
  

  
  const {
    analysesUsed,
    canAnalyze,
    remainingAnalyses,
    hasReachedLimit,
    loading: limitLoading,
    maxAnalyses,
    error: limitError
  } = useImageAnalysisLimit();

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t('imageAnalysis.page.loginRequired.title')}</h1>
          <p className="text-muted-foreground">{t('imageAnalysis.page.loginRequired.description')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation user={user} />
      
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
            <Camera className="h-8 w-8 text-primary" />
            {t('imageAnalysis.page.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('imageAnalysis.page.subtitle')}
          </p>
        </div>

        <div className="grid gap-6">
          {/* Usage Limits Display */}
          {!limitLoading && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  {t('imageAnalysis.usage.title')}
                </CardTitle>
                <CardDescription>
                  {t('imageAnalysis.usage.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageAnalysisLimitDisplay
                  analysesUsed={analysesUsed}
                  maxAnalyses={maxAnalyses}
                  remainingAnalyses={remainingAnalyses}
                  hasReachedLimit={hasReachedLimit}
                  hasActiveSubscription={remainingAnalyses === 'Unbegrenzt'}
                />
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {limitError && (
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-destructive mb-2">
                  {t('imageAnalysis.usage.error.title')}
                </h3>
                <p className="text-destructive">
                  {limitError.message || t('imageAnalysis.usage.error.description')}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Image Upload Section */}
          {!limitError && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  {t('imageAnalysis.upload.title')}
                </CardTitle>
                <CardDescription>
                  {t('imageAnalysis.upload.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {limitLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">{t('imageAnalysis.usage.loading')}</p>
                  </div>
                ) : (
                  <AnimalImageUpload
                    onUploadComplete={(result) => {
                      handleUploadComplete(result);
                    }}
                    disabled={false}
                    createPlan={true}
                    userId={user.id}
                    petId={null} // For standalone analysis, we don't have a specific pet
                  />
                )}
              </CardContent>
            </Card>
          )}

          {/* Analysis Results */}
          {analysisResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  {t('imageAnalysis.results.title')}
                </CardTitle>
                <CardDescription>
                  {t('imageAnalysis.results.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AnalysisDisplaySection 
                  selectedPet={tempPet}
                  analysisResult={analysisResult}
                  trainingPlan={trainingPlan}
                  showPlan={showPlan}
                  onCreatePlan={handleCreatePlan}
                  onSaveAnalysis={handleSaveAnalysis}
                  onSavePlan={handleSavePlan}
                  onStartOver={() => {
                    handleStartOver();
                  }}
                  onPlanCreated={(plan) => {
                    // Handle when a plan is created from image analysis
                    console.log('Plan created from image analysis:', plan);
                    // You can navigate to the plan or show a success message
                  }}
                />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                {t('imageAnalysis.features.title')}
              </CardTitle>
              <CardDescription>
                {t('imageAnalysis.features.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">{t('imageAnalysis.features.bodyLanguage.title')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('imageAnalysis.features.bodyLanguage.description')}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">{t('imageAnalysis.features.behavior.title')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('imageAnalysis.features.behavior.description')}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">{t('imageAnalysis.features.environment.title')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('imageAnalysis.features.environment.description')}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">{t('imageAnalysis.features.recommendations.title')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('imageAnalysis.features.recommendations.description')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                {t('imageAnalysis.tips.title')}
              </CardTitle>
              <CardDescription>
                {t('imageAnalysis.tips.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">{t('imageAnalysis.tips.photoQuality.title')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('imageAnalysis.tips.photoQuality.description')}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">{t('imageAnalysis.tips.focus.title')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('imageAnalysis.tips.focus.description')}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">{t('imageAnalysis.tips.recency.title')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('imageAnalysis.tips.recency.description')}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">{t('imageAnalysis.tips.fileSize.title')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('imageAnalysis.tips.fileSize.description')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ImageAnalysisPage;