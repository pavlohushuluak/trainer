import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const AnalyticsDebug = () => {
  const { user } = useAuth();
  const { trackPageView, trackEvent } = useAnalytics();
  const { t } = useTranslation();
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
      
      addResult(t('adminAnalytics.debug.testDbConnection'), data, error);
    } catch (err) {
      addResult(t('adminAnalytics.debug.testDbConnection'), null, err);
    }
    setIsLoading(false);
  };

  const testTrackPageViewFunction = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('track_page_view', {
        p_page_path: '/test-page',
        p_user_email: user?.email || 'test@example.com'
      });
      
      addResult(t('adminAnalytics.debug.testTrackPageViewFunction'), data, error);
    } catch (err) {
      addResult(t('adminAnalytics.debug.testTrackPageViewFunction'), null, err);
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
      
      addResult(t('adminAnalytics.debug.testDirectInsert'), data, error);
    } catch (err) {
      addResult(t('adminAnalytics.debug.testDirectInsert'), null, err);
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
      
      addResult(t('adminAnalytics.debug.viewCurrentData'), data, error);
    } catch (err) {
      addResult(t('adminAnalytics.debug.viewCurrentData'), null, err);
    }
    setIsLoading(false);
  };

  const testAnalyticsHook = async () => {
    setIsLoading(true);
    try {
      console.log('🧪 Testing analytics hook...');
      await trackPageView({ test: true, timestamp: new Date().toISOString() });
      addResult(t('adminAnalytics.debug.testAnalyticsHook'), 'Page view tracked successfully');
    } catch (err) {
      addResult(t('adminAnalytics.debug.testAnalyticsHook'), null, err);
    }
    setIsLoading(false);
  };

  const testHomepageView = async () => {
    setIsLoading(true);
    try {
      console.log('🧪 Testing homepage view...');
      await trackEvent('homepage_view', { test: true, timestamp: new Date().toISOString() });
      addResult(t('adminAnalytics.debug.testHomepageView'), 'Homepage view tracked successfully');
    } catch (err) {
      addResult(t('adminAnalytics.debug.testHomepageView'), null, err);
    }
    setIsLoading(false);
  };

  const testMainpageView = async () => {
    setIsLoading(true);
    try {
      console.log('🧪 Testing mainpage view...');
      await trackEvent('mainpage_view', { test: true, timestamp: new Date().toISOString() });
      addResult(t('adminAnalytics.debug.testMainpageView'), 'Mainpage view tracked successfully');
    } catch (err) {
      addResult(t('adminAnalytics.debug.testMainpageView'), null, err);
    }
    setIsLoading(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{t('adminAnalytics.debug.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button onClick={testDatabaseConnection} disabled={isLoading}>
            {t('adminAnalytics.debug.testDbConnection')}
          </Button>
          <Button onClick={testTrackPageViewFunction} disabled={isLoading}>
            {t('adminAnalytics.debug.testTrackPageViewFunction')}
          </Button>
          <Button onClick={testAnalyticsEventsTable} disabled={isLoading}>
            {t('adminAnalytics.debug.testDirectInsert')}
          </Button>
          <Button onClick={testCurrentAnalyticsData} disabled={isLoading}>
            {t('adminAnalytics.debug.viewCurrentData')}
          </Button>
          <Button onClick={testAnalyticsHook} disabled={isLoading}>
            {t('adminAnalytics.debug.testAnalyticsHook')}
          </Button>
          <Button onClick={testHomepageView} disabled={isLoading}>
            {t('adminAnalytics.debug.testHomepageView')}
          </Button>
          <Button onClick={testMainpageView} disabled={isLoading}>
            {t('adminAnalytics.debug.testMainpageView')}
          </Button>
          <Button onClick={clearResults} variant="outline">
            {t('adminAnalytics.debug.clearResults')}
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
                  <strong>{t('adminAnalytics.debug.error')}:</strong> {JSON.stringify(result.error, null, 2)}
                </div>
              ) : (
                <div className="text-green-600 text-sm">
                  <strong>{t('adminAnalytics.debug.success')}:</strong> {JSON.stringify(result.result, null, 2)}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-sm text-muted-foreground">
          <p><strong>{t('adminAnalytics.debug.currentUser')}:</strong> {user?.email || t('adminAnalytics.debug.notLoggedIn')}</p>
          <p><strong>{t('adminAnalytics.debug.currentPath')}:</strong> {window.location.pathname}</p>
          <p><strong>{t('adminAnalytics.debug.environment')}:</strong> {window.location.hostname === 'localhost' ? t('adminAnalytics.debug.development') : t('adminAnalytics.debug.production')}</p>
        </div>
      </CardContent>
    </Card>
  );
};
