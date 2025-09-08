import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const AnalyticsDebug = () => {
  const { user } = useAuth();
  const { trackPageView, trackEvent } = useAnalytics();
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
      const { data, error } = await supabase.rpc('track_page_view', {
        p_page_path: '/test-page',
        p_user_email: user?.email || 'test@example.com'
      });
      
      addResult('track_page_view Function', data, error);
    } catch (err) {
      addResult('track_page_view Function', null, err);
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
        <CardTitle>Analytics System Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button onClick={testDatabaseConnection} disabled={isLoading}>
            Test DB Connection
          </Button>
          <Button onClick={testTrackPageViewFunction} disabled={isLoading}>
            Test track_page_view Function
          </Button>
          <Button onClick={testAnalyticsEventsTable} disabled={isLoading}>
            Test Direct Insert
          </Button>
          <Button onClick={testCurrentAnalyticsData} disabled={isLoading}>
            View Current Data
          </Button>
          <Button onClick={testAnalyticsHook} disabled={isLoading}>
            Test Analytics Hook
          </Button>
          <Button onClick={testHomepageView} disabled={isLoading}>
            Test Homepage View
          </Button>
          <Button onClick={testMainpageView} disabled={isLoading}>
            Test Mainpage View
          </Button>
          <Button onClick={clearResults} variant="outline">
            Clear Results
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
                  <strong>Error:</strong> {JSON.stringify(result.error, null, 2)}
                </div>
              ) : (
                <div className="text-green-600 text-sm">
                  <strong>Success:</strong> {JSON.stringify(result.result, null, 2)}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-sm text-muted-foreground">
          <p><strong>Current User:</strong> {user?.email || 'Not logged in'}</p>
          <p><strong>Current Path:</strong> {window.location.pathname}</p>
          <p><strong>Environment:</strong> {window.location.hostname === 'localhost' ? 'Development' : 'Production'}</p>
        </div>
      </CardContent>
    </Card>
  );
};