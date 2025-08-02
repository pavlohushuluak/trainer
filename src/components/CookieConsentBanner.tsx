
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Settings, Cookie } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Link } from 'react-router-dom';
import { getStoredConsent, storeConsent, hasConsent, CookieConsent, loadTrackingScripts } from '@/utils/cookieConsent';
import { useTranslations } from '@/hooks/useTranslations';

export const CookieConsentBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analyticsConsent, setAnalyticsConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const { t } = useTranslations();

  useEffect(() => {
    // Check if user already gave consent
    const existingConsent = getStoredConsent();
    
    if (existingConsent) {
      // Load tracking scripts based on existing consent
      loadTrackingScripts(existingConsent);
      setShowBanner(false);
    } else {
      // Show banner after a short delay
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const consent = {
      necessary: true,
      analytics: true,
      marketing: true
    };
    
    storeConsent(consent);
    setShowBanner(false);
  };

  const handleAcceptNecessary = () => {
    const consent = {
      necessary: true,
      analytics: false,
      marketing: false
    };
    
    storeConsent(consent);
    setShowBanner(false);
  };

  const handleSaveSettings = () => {
    const consent = {
      necessary: true,
      analytics: analyticsConsent,
      marketing: marketingConsent
    };
    
    storeConsent(consent);
    setShowBanner(false);
    setShowSettings(false);
  };

  const openSettings = () => {
    const existingConsent = getStoredConsent();
    if (existingConsent) {
      setAnalyticsConsent(existingConsent.analytics);
      setMarketingConsent(existingConsent.marketing);
    }
    setShowSettings(true);
  };

  const handleAnalyticsChange = (checked: boolean | "indeterminate") => {
    setAnalyticsConsent(checked === true);
  };

  const handleMarketingChange = (checked: boolean | "indeterminate") => {
    setMarketingConsent(checked === true);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Consent Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-black/80 backdrop-blur-sm">
        <Card className="max-w-4xl mx-auto p-6 bg-background border shadow-lg">
          <div className="flex items-start gap-4">
            <Cookie className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
            
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">{t('cookies.title')}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t('cookies.description')}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleAcceptAll} className="flex-1">
                  {t('cookies.acceptAll')}
                </Button>
                <Button onClick={handleAcceptNecessary} variant="outline" className="flex-1">
                  {t('cookies.acceptNecessary')}
                </Button>
                <Button onClick={openSettings} variant="outline" className="flex-1">
                  <Settings className="h-4 w-4 mr-2" />
                  {t('cookies.manageSettings')}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Cookie Settings Modal */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cookie className="h-5 w-5" />
              {t('cookies.settingsTitle')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{t('cookies.necessaryTitle')}</h3>
                  <span className="text-sm text-green-600 font-medium">{t('cookies.alwaysActive')}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('cookies.necessaryDescription')}
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="analytics"
                      checked={analyticsConsent}
                      onCheckedChange={handleAnalyticsChange}
                    />
                    <h3 className="font-medium">{t('cookies.analyticsTitle')}</h3>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('cookies.analyticsDescription')}
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="marketing"
                      checked={marketingConsent}
                      onCheckedChange={handleMarketingChange}
                    />
                    <h3 className="font-medium">{t('cookies.marketingTitle')}</h3>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('cookies.marketingDescription')}
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button onClick={handleSaveSettings} className="flex-1">
                {t('cookies.saveSettings')}
              </Button>
              <Button onClick={() => setShowSettings(false)} variant="outline" className="flex-1">
                {t('cookies.cancel')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
