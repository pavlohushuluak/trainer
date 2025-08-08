import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Globe, Check } from 'lucide-react';
import { useLanguagePreference } from '@/hooks/useLanguagePreference';
import { useTranslations } from '@/hooks/useTranslations';

export const LanguagePreferenceManager = () => {
  const { preference, loading, getLanguagePreference, setLanguagePreference } = useLanguagePreference();
  const { currentLanguage, changeLanguage } = useTranslations();

  useEffect(() => {
    getLanguagePreference();
  }, [getLanguagePreference]);

  const handleLanguageChange = async (language: 'de' | 'en') => {
    const success = await setLanguagePreference(language);
    if (success) {
      // Also update the current language in the app
      changeLanguage(language);
    }
  };

  const getLanguageDisplayName = (lang: string) => {
    switch (lang) {
      case 'de':
        return 'Deutsch';
      case 'en':
        return 'English';
      default:
        return lang;
    }
  };

  const getLanguageFlag = (lang: string) => {
    switch (lang) {
      case 'de':
        return '🇩🇪';
      case 'en':
        return '🇺🇸';
      default:
        return '🌍';
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Language Preference
          </CardTitle>
          <CardDescription>
            Loading your language preference...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Language Preference
        </CardTitle>
        <CardDescription>
          Choose your preferred language for the chat and application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Preference Display */}
        {preference && (
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-lg">{getLanguageFlag(preference.language)}</span>
              <span className="font-medium">{getLanguageDisplayName(preference.language)}</span>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Check className="h-3 w-3" />
              Saved
            </Badge>
          </div>
        )}

        {/* Language Options */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Available Languages:</h4>
          
          {/* German Option */}
          <Button
            variant={currentLanguage === 'de' ? 'default' : 'outline'}
            className="w-full justify-start h-auto p-3"
            onClick={() => handleLanguageChange('de')}
            disabled={loading}
          >
            <div className="flex items-center gap-3 w-full">
              <span className="text-lg">{getLanguageFlag('de')}</span>
              <div className="flex-1 text-left">
                <div className="font-medium">{getLanguageDisplayName('de')}</div>
                <div className="text-xs text-muted-foreground">German</div>
              </div>
              {currentLanguage === 'de' && <Check className="h-4 w-4" />}
            </div>
          </Button>

          {/* English Option */}
          <Button
            variant={currentLanguage === 'en' ? 'default' : 'outline'}
            className="w-full justify-start h-auto p-3"
            onClick={() => handleLanguageChange('en')}
            disabled={loading}
          >
            <div className="flex items-center gap-3 w-full">
              <span className="text-lg">{getLanguageFlag('en')}</span>
              <div className="flex-1 text-left">
                <div className="font-medium">{getLanguageDisplayName('en')}</div>
                <div className="text-xs text-muted-foreground">English</div>
              </div>
              {currentLanguage === 'en' && <Check className="h-4 w-4" />}
            </div>
          </Button>
        </div>

        {/* Info Text */}
        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <p className="mb-1">
            <strong>Note:</strong> Your language preference will be used for:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>AI chat responses</li>
            <li>Training plan generation</li>
            <li>System messages and notifications</li>
            <li>Application interface (if available)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}; 