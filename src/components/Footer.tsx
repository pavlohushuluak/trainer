
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ImpressumModal } from '@/components/legal/ImpressumModal';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { Button } from '@/components/ui/button';
import { ThemeLogo } from '@/components/ui/theme-logo';
import { useTranslations } from '@/hooks/useTranslations';

export const Footer = () => {
  const [showImpressum, setShowImpressum] = useState(false);
  const { revokeConsent } = useCookieConsent();
  const { t } = useTranslations();

  const handleCookieSettingsChange = () => {
    revokeConsent();
  };

  return (
    <footer className="bg-card text-card-foreground py-8 mt-auto border-t border-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <ThemeLogo className="h-8 w-auto" />
            </div>
            <p className="text-muted-foreground">
              {t('footer.tagline')}
            </p>
          </div>
          
          <div>
            <h4 className="text-md font-medium mb-3">{t('footer.legal')}</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/impressum" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('footer.imprint')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/datenschutz" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/agb" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Button
                  onClick={handleCookieSettingsChange}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground transition-colors p-0 h-auto font-normal justify-start"
                >
                  {t('footer.cookieSettings')}
                </Button>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-md font-medium mb-3">{t('footer.contact')}</h4>
            <div className="text-muted-foreground space-y-1">
              <p>{t('footer.email')}</p>
              <p>{t('footer.website')}</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-6 text-center text-muted-foreground">
          <p>{t('footer.copyright')}</p>
        </div>
      </div>

      <ImpressumModal isOpen={showImpressum} onClose={() => setShowImpressum(false)} />
    </footer>
  );
};
