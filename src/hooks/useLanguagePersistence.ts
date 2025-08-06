import { useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getCurrentLanguage, setLanguage } from '@/utils/languageSupport';

export const useLanguagePersistence = () => {
  const { i18n } = useTranslation();

  // Initialize language on mount
  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem('i18nextLng') || getCurrentLanguage();
      
      // Set the language if it's different from current
      if (i18n.language !== savedLanguage) {
        i18n.changeLanguage(savedLanguage);
      }
      
      console.log('🌍 Language persistence initialized:', savedLanguage);
    } catch (error) {
      console.warn('Error initializing language persistence:', error);
      // Fallback to default language
      i18n.changeLanguage('de');
    }
  }, [i18n]);

  // Function to change language with persistence
  const changeLanguage = useCallback((language: 'de' | 'en') => {
    try {
      // Update i18n
      i18n.changeLanguage(language);
      
      // Save to localStorage
      setLanguage(language);
      
      console.log('🌍 Language changed and persisted:', language);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  }, [i18n]);

  // Function to get current language
  const getCurrentLanguageValue = useCallback(() => {
    return getCurrentLanguage();
  }, []);

  return {
    currentLanguage: i18n.language as 'de' | 'en',
    changeLanguage,
    getCurrentLanguage: getCurrentLanguageValue,
    isGerman: i18n.language === 'de',
    isEnglish: i18n.language === 'en'
  };
}; 