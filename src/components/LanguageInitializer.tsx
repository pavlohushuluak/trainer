import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageInitializer = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    try {
      // Get language from localStorage
      const savedLanguage = localStorage.getItem('i18nextLng');
      
      // If no language is saved, default to 'de'
      const languageToUse = savedLanguage && ['de', 'en'].includes(savedLanguage) 
        ? savedLanguage 
        : 'de';
      
      // Set the language if it's different from current
      if (i18n.language !== languageToUse) {
        i18n.changeLanguage(languageToUse);
      }
      
      // Ensure localStorage has the correct value
      localStorage.setItem('i18nextLng', languageToUse);
      
      console.log('🌍 Language initialized:', languageToUse);
    } catch (error) {
      console.warn('Error initializing language:', error);
      // Fallback to default language
      i18n.changeLanguage('de');
    }
  }, [i18n]);

  // This component doesn't render anything
  return null;
}; 