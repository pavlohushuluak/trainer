import { CreditCard, Star, Check, Clock } from 'lucide-react';
import MainNavigation from '@/components/layout/MainNavigation';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

const SubscriptionPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t('subscriptionPage.loginRequired.title')}</h1>
          <p className="text-muted-foreground">{t('subscriptionPage.loginRequired.description')}</p>
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
            <CreditCard className="h-8 w-8 text-primary" />
            {t('subscriptionPage.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('subscriptionPage.subtitle')}
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                {t('subscriptionPage.currentSubscription.title')}
              </CardTitle>
              <CardDescription>
                {t('subscriptionPage.currentSubscription.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{t('subscriptionPage.currentSubscription.planName')}</h3>
                    <p className="text-sm text-muted-foreground">{t('subscriptionPage.currentSubscription.planDescription')}</p>
                  </div>
                  <Badge variant="secondary">
                    <Clock className="h-3 w-3 mr-1" />
                    {t('subscriptionPage.currentSubscription.active')}
                  </Badge>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <label className="text-sm font-medium">{t('subscriptionPage.currentSubscription.nextPayment')}</label>
                    <p className="text-sm text-muted-foreground">15. August 2024</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t('subscriptionPage.currentSubscription.amount')}</label>
                    <p className="text-sm text-muted-foreground">€19.99 / Monat</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('subscriptionPage.includedFeatures.title')}</CardTitle>
              <CardDescription>
                {t('subscriptionPage.includedFeatures.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  t('subscriptionPage.includedFeatures.unlimitedChat'),
                  t('subscriptionPage.includedFeatures.personalizedPlans'),
                  t('subscriptionPage.includedFeatures.imageAnalysis'),
                  t('subscriptionPage.includedFeatures.communityAccess'),
                  t('subscriptionPage.includedFeatures.mobileApp'),
                  t('subscriptionPage.includedFeatures.prioritySupport')
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('subscriptionPage.paymentDetails.title')}</CardTitle>
              <CardDescription>
                {t('subscriptionPage.paymentDetails.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">{t('subscriptionPage.paymentDetails.paymentMethod')}</label>
                  <div className="flex items-center gap-2 mt-1">
                    <CreditCard className="h-4 w-4" />
                    <span className="text-sm">•••• •••• •••• 1234</span>
                    <Badge variant="outline" className="text-xs">Visa</Badge>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    {t('subscriptionPage.paymentDetails.changePaymentMethod')}
                  </Button>
                  <Button variant="outline" size="sm">
                    {t('subscriptionPage.paymentDetails.viewInvoices')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('subscriptionPage.manageSubscription.title')}</CardTitle>
              <CardDescription>
                {t('subscriptionPage.manageSubscription.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t('subscriptionPage.manageSubscription.info')}
                </p>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    {t('subscriptionPage.manageSubscription.changePlan')}
                  </Button>
                  <Button variant="outline" size="sm">
                    {t('subscriptionPage.manageSubscription.pauseSubscription')}
                  </Button>
                  <Button variant="destructive" size="sm">
                    {t('subscriptionPage.manageSubscription.cancel')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;