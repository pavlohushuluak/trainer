/**
 * Get user's language preference from language_support table
 */
export async function getUserLanguage(
  supabaseClient: any,
  userEmail: string
): Promise<string> {
  try {
    console.log('🔍 Fetching language preference for user:', userEmail);
    
    const { data, error } = await supabaseClient
      .from('language_support')
      .select('language')
      .eq('email', userEmail)
      .single();

    if (error) {
      console.log('⚠️ No language preference found, using default (de):', error.message);
      return 'de'; // Default to German
    }

    if (data && data.language) {
      console.log('✅ Found language preference:', data.language);
      return data.language;
    }

    console.log('⚠️ No language preference found, using default (de)');
    return 'de'; // Default to German
  } catch (error) {
    console.error('❌ Error fetching language preference:', error);
    return 'de'; // Default to German on error
  }
}

/**
 * Validate if the language is supported
 */
export function isValidLanguage(language: string): boolean {
  const supportedLanguages = ['de', 'en'];
  return supportedLanguages.includes(language);
}

/**
 * Get fallback language if the user's language is not supported
 */
export function getFallbackLanguage(language: string): string {
  if (isValidLanguage(language)) {
    return language;
  }
  return 'de'; // Default to German for unsupported languages
} 