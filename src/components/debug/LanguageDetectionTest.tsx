import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { detectBrowserLanguage } from '@/utils/languageSupport';

export const LanguageDetectionTest = () => {
  const [detectedLanguage, setDetectedLanguage] = useState<string>('');
  const [localStorageLanguage, setLocalStorageLanguage] = useState<string>('');
  const [browserLanguage, setBrowserLanguage] = useState<string>('');

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

    console.log('🔍 Language Detection Test Results:', {
      detectedLanguage: detected,
      localStorageLanguage: stored,
      browserLanguage: browser,
      navigatorLanguage: navigator.language,
      userLanguage: (navigator as any).userLanguage
    });
  };

  const setTestLanguage = (language: 'de' | 'en') => {
    localStorage.setItem('i18nextLng', language);
    testLanguageDetection();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Language Detection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testLanguageDetection} className="w-full">
          Test Language Detection
        </Button>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Detected Language:</span>
            <span className="font-mono">{detectedLanguage}</span>
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

        <div className="flex gap-2">
          <Button 
            onClick={() => setTestLanguage('de')} 
            variant="outline" 
            size="sm"
          >
            Set German
          </Button>
          <Button 
            onClick={() => setTestLanguage('en')} 
            variant="outline" 
            size="sm"
          >
            Set English
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 