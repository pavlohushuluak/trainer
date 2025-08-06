import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import de from './locales/de.json';
import en from './locales/en.json';

const resources = {
  de: {
    translation: de
  },
  en: {
    translation: en
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    detection: {
      order: ['localStorage', 'querystring', 'cookie', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      lookupQuerystring: 'lng',
      lookupCookie: 'i18nextLng',
      caches: ['localStorage', 'cookie'],
    },
  });

// Initialize language from localStorage on startup
const initializeLanguage = () => {
  try {
    const savedLanguage = localStorage.getItem('i18nextLng');
    if (savedLanguage && ['de', 'en'].includes(savedLanguage)) {
      i18n.changeLanguage(savedLanguage);
    } else {
      // Set default language in localStorage
      localStorage.setItem('i18nextLng', 'de');
    }
  } catch (error) {
    console.warn('Could not access localStorage during i18n initialization:', error);
  }
};

// Initialize after i18n is ready
i18n.on('initialized', () => {
  initializeLanguage();
});

export default i18n; 