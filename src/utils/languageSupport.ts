import { supabase } from '@/integrations/supabase/client';

/**
 * Save or update user's language preference in the language_support table
 */
export const saveUserLanguageSupport = async (userEmail: string, language: string = 'de') => {
  try {
    console.log('Saving language support:', { userEmail, language });
    
    const { error } = await supabase.rpc('upsert_language_support', {
      user_email: userEmail,
      user_language: language
    });

    if (error) {
      console.error('Error saving language support:', error);
      return { success: false, error };
    }

    console.log('Language support saved successfully');
    return { success: true };
  } catch (error) {
    console.error('Exception saving language support:', error);
    return { success: false, error };
  }
};

/**
 * Get user's language preference from the language_support table
 */
export const getUserLanguageSupport = async (userEmail: string): Promise<string> => {
  try {
    const { data, error } = await supabase.rpc('get_language_support', {
      user_email: userEmail
    });

    if (error) {
      console.error('Error getting language support:', error);
      return 'de'; // Default to German
    }

    return data || 'de';
  } catch (error) {
    console.error('Exception getting language support:', error);
    return 'de'; // Default to German
  }
};

/**
 * Detect browser language and return supported language code
 */
export const detectBrowserLanguage = (): string => {
  // Check localStorage first (user preference)
  const storedLanguage = localStorage.getItem('i18nextLng');
  if (storedLanguage && ['de', 'en'].includes(storedLanguage)) {
    return storedLanguage;
  }

  // Check browser language
  const browserLanguage = navigator.language || (navigator as any).userLanguage;
  if (browserLanguage) {
    const languageCode = browserLanguage.substring(0, 2).toLowerCase();
    if (languageCode === 'en') {
      return 'en';
    }
  }

  // Default to German - always return 'de' as fallback
  return 'de';
};

/**
 * Initialize language support for new users (signup) or existing users (login)
 */
export const initializeUserLanguageSupport = async (userEmail: string, isNewUser: boolean = false) => {
  try {
    let languageToSave = 'de'; // Default

    if (isNewUser) {
      // For new users, detect their browser language
      languageToSave = detectBrowserLanguage();
      console.log('New user language detected:', languageToSave);
    } else {
      // For existing users, try to get their saved preference first
      const savedLanguage = await getUserLanguageSupport(userEmail);
      languageToSave = savedLanguage;
      console.log('Existing user language loaded:', languageToSave);
    }

    // Save/update the language preference
    const result = await saveUserLanguageSupport(userEmail, languageToSave);
    
    // Store in localStorage for i18n to pick up
    localStorage.setItem('i18nextLng', languageToSave);

    return { success: true, language: languageToSave };
  } catch (error) {
    console.error('Error initializing language support:', error);
    return { success: false, error };
  }
};