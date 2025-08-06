import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Globe, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslations } from '@/hooks/useTranslations';
import { useAuthContext } from '@/hooks/auth/AuthContext';
import { saveUserLanguageSupport } from '@/utils/languageSupport';
import { useLanguagePersistence } from '@/hooks/useLanguagePersistence';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const { t } = useTranslations();
  const { user } = useAuthContext();
  const { changeLanguage } = useLanguagePersistence();
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const languages = [
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = async (languageCode: 'de' | 'en') => {
    try {
      // Use the persistence hook to change language
      changeLanguage(languageCode);
    
    // Save to language_support table if user is logged in
    if (user?.email) {
      try {
        await saveUserLanguageSupport(user.email, languageCode);
        console.log('Language preference saved to database');
      } catch (error) {
        console.error('Failed to save language preference:', error);
      }
    }
    
    setIsOpen(false);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  // Simple fix: ensure scrollbar is always visible
  useEffect(() => {
    const ensureScrollbar = () => {
      // Force scrollbar to be visible
      document.documentElement.style.overflowY = 'scroll';
    };

    // Run on mount and when dropdown opens
    ensureScrollbar();
    
    if (isOpen) {
      // Additional check when dropdown is open
      const timer = setTimeout(ensureScrollbar, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Mobile version - more professional inline design
  if (isMobile) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-3">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">{t('common.language')}</span>
          </div>
          <div className="flex items-center gap-2">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code as 'de' | 'en')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  i18n.language === language.code
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                <span className="text-base">{language.flag}</span>
                <span className="hidden sm:inline">{language.name}</span>
                {i18n.language === language.code && (
                  <Check className="h-3 w-3" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Desktop version - dropdown menu
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLanguage.flag}</span>
          <span className="hidden md:inline">{currentLanguage.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end"
        className="z-[9999]"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code as 'de' | 'en')}
            className={`cursor-pointer flex items-center justify-between ${
              i18n.language === language.code ? 'bg-accent' : ''
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{language.flag}</span>
              <span>{language.name}</span>
            </div>
            {i18n.language === language.code && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}; 