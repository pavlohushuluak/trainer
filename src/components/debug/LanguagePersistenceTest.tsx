import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { getCurrentLanguage, setLanguage } from '@/utils/languageSupport';

export const LanguagePersistenceTest = () => {
  const [localStorageLanguage, setLocalStorageLanguage] = useState<string>('');
  const [currentI18nLanguage, setCurrentI18nLanguage] = useState<string>('');
  const [testResults, setTestResults] = useState<string[]>([]);
  const { i18n, t } = useTranslation();

  const updateDisplay = () => {
    try {
      const stored = localStorage.getItem('i18nextLng');
      setLocalStorageLanguage(stored || 'not set');
      setCurrentI18nLanguage(i18n.language || 'not set');
    } catch (error) {
      console.error('Error updating display:', error);
    }
  };

  useEffect(() => {
    updateDisplay();
  }, [i18n.language]);

  const testLanguageChange = (language: 'de' | 'en') => {
    try {
      setLanguage(language);
      i18n.changeLanguage(language);
      updateDisplay();
      addTestResult(`✅ Language changed to ${language}`);
    } catch (error) {
      addTestResult(`❌ Error changing language to ${language}: ${error}`);
    }
  };

  const testRefresh = () => {
    addTestResult('🔄 Refreshing page...');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const testLocalStorage = () => {
    try {
      const testValue = 'test-value';
      localStorage.setItem('test-key', testValue);
      const retrieved = localStorage.getItem('test-key');
      localStorage.removeItem('test-key');
      
      if (retrieved === testValue) {
        addTestResult('✅ localStorage is working correctly');
      } else {
        addTestResult('❌ localStorage test failed');
      }
    } catch (error) {
      addTestResult(`❌ localStorage error: ${error}`);
    }
  };

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const clearTestResults = () => {
    setTestResults([]);
  };

  const testLanguagePersistence = () => {
    addTestResult('🧪 Testing language persistence...');
    
    // Test 1: Check if current language is saved
    const currentLang = getCurrentLanguage();
    addTestResult(`Current language from utility: ${currentLang}`);
    
    // Test 2: Check if i18n and localStorage are in sync
    const storedLang = localStorage.getItem('i18nextLng');
    if (i18n.language === storedLang) {
      addTestResult('✅ i18n and localStorage are in sync');
    } else {
      addTestResult('❌ i18n and localStorage are out of sync');
    }
    
    // Test 3: Test language change
    const testLang = i18n.language === 'de' ? 'en' : 'de';
    testLanguageChange(testLang as 'de' | 'en');
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Language Persistence Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline">localStorage</Badge>
            <span className="font-mono text-sm">{localStorageLanguage}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">i18n.language</Badge>
            <span className="font-mono text-sm">{currentI18nLanguage}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">getCurrentLanguage()</Badge>
            <span className="font-mono text-sm">{getCurrentLanguage()}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => testLanguageChange('de')} variant="outline" size="sm">
            Set German
          </Button>
          <Button onClick={() => testLanguageChange('en')} variant="outline" size="sm">
            Set English
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={testLanguagePersistence} variant="outline" size="sm">
            Test Persistence
          </Button>
          <Button onClick={testLocalStorage} variant="outline" size="sm">
            Test localStorage
          </Button>
        </div>
        
        <Button onClick={testRefresh} className="w-full">
          Test Refresh
        </Button>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Test Results</h4>
            <Button onClick={clearTestResults} variant="ghost" size="sm">
              Clear
            </Button>
          </div>
          <div className="max-h-32 overflow-y-auto text-xs space-y-1">
            {testResults.length === 0 ? (
              <p className="text-muted-foreground">No test results yet</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="p-1 bg-muted rounded">
                  {result}
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p><strong>Instructions:</strong></p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Change language using buttons above</li>
            <li>Click "Test Refresh" to reload the page</li>
            <li>Verify that the language persists after refresh</li>
            <li>Use "Test Persistence" to run automated tests</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}; 