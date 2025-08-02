import { supabase } from '@/integrations/supabase/client';

export interface LanguageSupportRecord {
  id?: number;
  email: string;
  language: string;
}

export class LanguageSupportService {
  /**
   * Update or insert language preference for user using database function
   */
  static async upsertLanguageSupport(email: string, language: string): Promise<void> {
    try {
      console.log(`🌐 Updating language support: ${email} -> ${language}`);
      
      // Use database function to upsert language support
      const { error } = await supabase.rpc('upsert_language_support', {
        user_email: email,
        user_language: language
      });

      if (error) {
        console.error('Error upserting language support:', error);
      } else {
        console.log(`✅ Updated language support for ${email}`);
      }
    } catch (error) {
      console.error('Exception in upsertLanguageSupport:', error);
    }
  }

  /**
   * Get language preference for user using database function
   */
  static async getLanguageSupport(email: string): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('get_language_support', {
        user_email: email
      });

      if (error) {
        console.log(`Error getting language support for ${email}, defaulting to 'de'`);
      }

      return data;
    } catch (error) {
      console.error('Exception getting language support:', error);
    }
  }

  /**
   * Track language on signup
   */
  static async trackSignupLanguage(email: string): Promise<void> {
    // Get browser language or default to German
    const browserLang = typeof window !== 'undefined' 
      ? window.navigator.language.substring(0, 2) 
      : 'de';
    
    const language = ['de', 'en'].includes(browserLang) ? browserLang : 'de';
    
    await this.upsertLanguageSupport(email, language);
  }

  /**
   * Track language on login - check current i18n language
   */
  static async trackLoginLanguage(email: string): Promise<void> {
    try {
      // Get current language from localStorage (set by i18n)
      const currentLang = localStorage.getItem('i18nextLng') || 'de';
      const language = ['de', 'en'].includes(currentLang) ? currentLang : 'de';
      
      await this.upsertLanguageSupport(email, language);
    } catch (error) {
      console.error('Error tracking login language:', error);
    }
  }
}