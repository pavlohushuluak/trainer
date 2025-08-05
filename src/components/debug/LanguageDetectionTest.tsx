import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { detectBrowserLanguage } from '@/utils/languageSupport';
import { useTranslation } from 'react-i18next';

export const LanguageDetectionTest = () => {
  const [detectedLanguage, setDetectedLanguage] = useState<string>('');
  const [localStorageLanguage, setLocalStorageLanguage] = useState<string>('');
  const [browserLanguage, setBrowserLanguage] = useState<string>('');
  const [currentI18nLanguage, setCurrentI18nLanguage] = useState<string>('');
  const { i18n } = useTranslation();

  const testLanguageDetection = () => {
    // Test the unified detection function
    const detected = detectBrowserLanguage();
    setDetectedLanguage(detected);

    // Test localStorage
    const stored = localStorage.getItem('i18nextLng');
    setLocalStorageLanguage(stored || 'not set');

    // Test browser language
    const browser = navigator.language || (navigator as any).userLanguage;
    setBrowserLanguage(browser || 'not available');

    // Test current i18n language
    setCurrentI18nLanguage(i18n.language || 'not set');

    console.log('🔍 Language Detection Test Results:', {
      detectedLanguage: detected,
      localStorageLanguage: stored,
      browserLanguage: browser,
      currentI18nLanguage: i18n.language,
      navigatorLanguage: navigator.language,
      userLanguage: (navigator as any).userLanguage,
      i18nFallbackLng: i18n.options.fallbackLng,
      i18nDefaultLng: i18n.options.lng
    });
  };

  const setTestLanguage = (language: 'de' | 'en') => {
    localStorage.setItem('i18nextLng', language);
    i18n.changeLanguage(language);
    testLanguageDetection();
  };

  const clearLanguagePreference = () => {
    localStorage.removeItem('i18nextLng');
    testLanguageDetection();
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>🌍 Language Detection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testLanguageDetection} className="w-full">
          Test Language Detection
        </Button>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Detected Language:</span>
            <span className={`font-mono ${detectedLanguage === 'de' ? 'text-green-600 font-bold' : 'text-blue-600'}`}>
              {detectedLanguage}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Current i18n Language:</span>
            <span className={`font-mono ${currentI18nLanguage === 'de' ? 'text-green-600 font-bold' : 'text-blue-600'}`}>
              {currentI18nLanguage}
            </span>
          </div>
          <div className="flex justify-between">
            <span>localStorage:</span>
            <span className="font-mono">{localStorageLanguage}</span>
          </div>
          <div className="flex justify-between">
            <span>Browser Language:</span>
            <span className="font-mono">{browserLanguage}</span>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="text-sm font-medium mb-2">Test Actions:</div>
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={() => setTestLanguage('de')} 
              variant="outline" 
              size="sm"
              className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
            >
              🇩🇪 Set German
            </Button>
            <Button 
              onClick={() => setTestLanguage('en')} 
              variant="outline" 
              size="sm"
              className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
            >
              🇺🇸 Set English
            </Button>
            <Button 
              onClick={clearLanguagePreference} 
              variant="outline" 
              size="sm"
              className="bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
            >
              🗑️ Clear Preference
            </Button>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
            <div className="font-medium mb-1">Expected Behavior:</div>
            <ul className="space-y-1">
              <li>• <strong>German (de)</strong> should be the default language</li>
              <li>• If no preference is set, it should default to German</li>
              <li>• Browser language detection should work for English</li>
              <li>• All other languages should fallback to German</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 