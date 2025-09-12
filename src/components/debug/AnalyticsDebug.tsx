import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useTranslations } from '@/hooks/useTranslations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const AnalyticsDebug = () => {
  const { user } = useAuth();
  const { trackPageView, trackEvent } = useAnalytics();
  const { t } = useTranslations();
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (test: string, result: any, error?: any) => {
    setTestResults(prev => [...prev, {
      test,
      result,
      error,
      timestamp: new Date().toISOString()
    }]);
  };

  const testDatabaseConnection = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .limit(1);
      
      addResult('Database Connection', data, error);
    } catch (err) {
      addResult('Database Connection', null, err);
    }
    setIsLoading(false);
  };

  const testTrackPageViewFunction = async () => {
    setIsLoading(true);
    try {
      await trackEvent('page_view', { test: true, overridePath: '/test-page' });
      addResult('track_page_view Function (via hook)', 'Tracked via useAnalytics');
    } catch (err) {
      addResult('track_page_view Function (via hook)', null, err);
    }
    setIsLoading(false);
  };

  const testAnalyticsEventsTable = async () => {
    setIsLoading(true);
    try {
      // Test inserting directly into analytics_events table
      const { data, error } = await supabase
        .from('analytics_events')
        .insert({
          date: new Date().toISOString().split('T')[0],
          mainpage_view: 0,
          homepage_view: 1,
          page_view: 0,
          view_user: [user?.email || 'test@example.com']
        })
        .select();
      
      addResult('Direct Insert to analytics_events', data, error);
    } catch (err) {
      addResult('Direct Insert to analytics_events', null, err);
    }
    setIsLoading(false);
  };

  const testCurrentAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .order('date', { ascending: false })
        .limit(10);
      
      addResult('Current Analytics Data', data, error);
    } catch (err) {
      addResult('Current Analytics Data', null, err);
    }
    setIsLoading(false);
  };

  const testAnalyticsHook = async () => {
    setIsLoading(true);
    try {
      console.log('🧪 Testing analytics hook...');
      await trackPageView({ test: true, timestamp: new Date().toISOString() });
      addResult('Analytics Hook Test', 'Page view tracked successfully');
    } catch (err) {
      addResult('Analytics Hook Test', null, err);
    }
    setIsLoading(false);
  };

  const testHomepageView = async () => {
    setIsLoading(true);
    try {
      console.log('🧪 Testing homepage view...');
      await trackEvent('homepage_view', { test: true, timestamp: new Date().toISOString() });
      addResult('Homepage View Test', 'Homepage view tracked successfully');
    } catch (err) {
      addResult('Homepage View Test', null, err);
    }
    setIsLoading(false);
  };

  const testMainpageView = async () => {
    setIsLoading(true);
    try {
      console.log('🧪 Testing mainpage view...');
      await trackEvent('mainpage_view', { test: true, timestamp: new Date().toISOString() });
      addResult('Mainpage View Test', 'Mainpage view tracked successfully');
    } catch (err) {
      addResult('Mainpage View Test', null, err);
    }
    setIsLoading(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{t('analyticsDebug.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button onClick={testDatabaseConnection} disabled={isLoading}>
            {t('analyticsDebug.buttons.testDbConnection')}
          </Button>
          <Button onClick={testTrackPageViewFunction} disabled={isLoading}>
            {t('analyticsDebug.buttons.testTrackPageViewFunction')}
          </Button>
          <Button onClick={testAnalyticsEventsTable} disabled={isLoading}>
            {t('analyticsDebug.buttons.testDirectInsert')}
          </Button>
          <Button onClick={testCurrentAnalyticsData} disabled={isLoading}>
            {t('analyticsDebug.buttons.viewCurrentData')}
          </Button>
          <Button onClick={testAnalyticsHook} disabled={isLoading}>
            {t('analyticsDebug.buttons.testAnalyticsHook')}
          </Button>
          <Button onClick={testHomepageView} disabled={isLoading}>
            {t('analyticsDebug.buttons.testHomepageView')}
          </Button>
          <Button onClick={testMainpageView} disabled={isLoading}>
            {t('analyticsDebug.buttons.testMainpageView')}
          </Button>
          <Button onClick={clearResults} variant="outline">
            {t('analyticsDebug.buttons.clearResults')}
          </Button>
        </div>

        <div className="space-y-2">
          {testResults.map((result, index) => (
            <div key={index} className="p-3 border rounded-lg">
              <div className="font-semibold">{result.test}</div>
              <div className="text-sm text-muted-foreground">
                {new Date(result.timestamp).toLocaleString()}
              </div>
              {result.error ? (
                <div className="text-red-600 text-sm">
                  <strong>{t('analyticsDebug.testResults.error')}</strong> {JSON.stringify(result.error, null, 2)}
                </div>
              ) : (
                <div className="text-green-600 text-sm">
                  <strong>{t('analyticsDebug.testResults.success')}</strong> {JSON.stringify(result.result, null, 2)}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-sm text-muted-foreground">
          <p><strong>{t('analyticsDebug.status.currentUser')}</strong> {user?.email || t('analyticsDebug.status.notLoggedIn')}</p>
          <p><strong>{t('analyticsDebug.status.currentPath')}</strong> {window.location.pathname}</p>
          <p><strong>{t('analyticsDebug.status.environment')}</strong> {window.location.hostname === 'localhost' ? t('analyticsDebug.status.development') : t('analyticsDebug.status.production')}</p>
        </div>
      </CardContent>
    </Card>
  );
};