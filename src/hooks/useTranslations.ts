import { useTranslation } from 'react-i18next';

export const useTranslations = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (language: 'de' | 'en') => {
    i18n.changeLanguage(language);
    // Ensure localStorage is updated
    localStorage.setItem('i18nextLng', language);
  };

  const currentLanguage = i18n.language as 'de' | 'en';

  return {
    t,
    changeLanguage,
    currentLanguage,
    isGerman: currentLanguage === 'de',
    isEnglish: currentLanguage === 'en'
  };
}; 