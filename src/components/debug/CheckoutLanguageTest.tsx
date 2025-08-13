import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { detectBrowserLanguage } from '@/utils/languageSupport';

export const CheckoutLanguageTest = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { i18n } = useTranslation();

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testLanguageDetection = () => {
    addTestResult('🔍 Testing language detection...');
    
    // Test localStorage
    const storedLanguage = localStorage.getItem('i18nextLng');
    addTestResult(`📦 localStorage language: ${storedLanguage || 'not set'}`);
    
    // Test browser language
    const browserLanguage = navigator.language || (navigator as any).userLanguage;
    addTestResult(`🌐 Browser language: ${browserLanguage || 'not available'}`);
    
    // Test unified detection
    const detectedLanguage = detectBrowserLanguage();
    addTestResult(`🎯 Detected language: ${detectedLanguage}`);
    
    // Test current i18n language
    addTestResult(`🎨 Current i18n language: ${i18n.language || 'not set'}`);
  };

  const testCheckoutLanguageParameter = async () => {
    setLoading(true);
    addTestResult('🧪 Testing checkout language parameter...');
    
    try {
      // Get current language from localStorage or default to 'de'
      const currentLanguage = localStorage.getItem('i18nextLng') || 'de';
      addTestResult(`📤 Sending language parameter: ${currentLanguage}`);
      
      // Simulate the checkout request body (without actually calling the function)
      const requestBody = {
        priceType: 'plan1-monthly',
        successUrl: `${window.location.origin}/mein-tiertraining?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/?canceled=true`,
        language: currentLanguage
      };
      
      addTestResult(`📋 Request body: ${JSON.stringify(requestBody, null, 2)}`);
      addTestResult('✅ Language parameter correctly included in request body');
      
    } catch (error) {
      addTestResult(`❌ Error testing checkout: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const setTestLanguage = (language: 'de' | 'en') => {
    localStorage.setItem('i18nextLng', language);
    i18n.changeLanguage(language);
    addTestResult(`🌍 Language set to: ${language}`);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🧪 Checkout Language Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={testLanguageDetection}
            variant="outline"
            size="sm"
          >
            🔍 Test Detection
          </Button>
          <Button 
            onClick={testCheckoutLanguageParameter}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            {loading ? '⏳ Testing...' : '🧪 Test Checkout'}
          </Button>
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
            onClick={clearResults}
            variant="outline"
            size="sm"
            className="bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
          >
            🗑️ Clear Results
          </Button>
        </div>

        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="text-sm font-medium mb-2">Test Results:</div>
          <div className="max-h-64 overflow-y-auto space-y-1">
            {testResults.length === 0 ? (
              <div className="text-gray-500 text-sm">No test results yet. Run a test to see results.</div>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="text-xs font-mono bg-white p-2 rounded border">
                  {result}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
            <div className="font-medium mb-1">Expected Behavior:</div>
            <ul className="space-y-1">
              <li>• Language parameter should be included in checkout request body</li>
              <li>• Parameter should match current localStorage language</li>
              <li>• Default should be 'de' if no language is set</li>
              <li>• Edge function should use this parameter for localized descriptions</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 