
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTranslations } from '@/hooks/useTranslations';

export const ChatDiagnostics = () => {
  const { user } = useAuth();
  const { currentLanguage } = useTranslations();
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    const results: any = {
      timestamp: new Date().toISOString(),
      user: !!user,
      userId: user?.id,
      tests: []
    };

    // Test 1: User Authentication
    results.tests.push({
      name: 'User Authentication',
      status: user ? 'PASS' : 'FAIL',
      details: user ? `User ID: ${user.id}` : 'No user authenticated'
    });

    // Test 2: Supabase Connection
    try {
      const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
      results.tests.push({
        name: 'Supabase Connection',
        status: error ? 'FAIL' : 'PASS',
        details: error ? error.message : 'Connection successful'
      });
    } catch (error) {
      results.tests.push({
        name: 'Supabase Connection',
        status: 'FAIL',
        details: `Error: ${error}`
      });
    }

    // Test 3: Chat Session Creation
    if (user) {
      try {
        const { data, error } = await supabase
          .from('chat_sessions')
          .insert([{
            user_id: user.id,
            title: `Diagnostic Test ${Date.now()}`
          }])
          .select()
          .single();

        if (error) {
          results.tests.push({
            name: 'Chat Session Creation',
            status: 'FAIL',
            details: error.message
          });
        } else {
          results.tests.push({
            name: 'Chat Session Creation',
            status: 'PASS',
            details: `Session created: ${data.id}`
          });

          // Clean up test session
          await supabase.from('chat_sessions').delete().eq('id', data.id);
        }
      } catch (error) {
        results.tests.push({
          name: 'Chat Session Creation',
          status: 'FAIL',
          details: `Error: ${error}`
        });
      }
    }

    // Test 4: Edge Function Health Check
    try {
      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: {
          message: 'test',
          sessionId: 'diagnostic-test',
          petId: null,
          trainerName: 'Test',
          language: currentLanguage
        }
      });

      results.tests.push({
        name: 'Chat Edge Function',
        status: error ? 'FAIL' : 'PASS',
        details: error ? `Function error: ${error.message}` : 'Function accessible and responding'
      });
    } catch (error) {
      results.tests.push({
        name: 'Chat Edge Function',
        status: 'FAIL',
        details: `Network error: ${error}`
      });
    }

    // Test 5: Pet Profiles Access
    if (user) {
      try {
        const { data, error } = await supabase
          .from('pet_profiles')
          .select('id, name')
          .eq('user_id', user.id)
          .limit(1);

        results.tests.push({
          name: 'Pet Profiles Access',
          status: error ? 'FAIL' : 'PASS',
          details: error ? error.message : `Found ${data?.length || 0} pet profiles`
        });
      } catch (error) {
        results.tests.push({
          name: 'Pet Profiles Access',
          status: 'FAIL',
          details: `Error: ${error}`
        });
      }
    }

    // Test 6: Chat Messages Table Access
    if (user) {
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);

        results.tests.push({
          name: 'Chat Messages Table',
          status: error ? 'FAIL' : 'PASS',
          details: error ? error.message : 'Chat messages table accessible'
        });
      } catch (error) {
        results.tests.push({
          name: 'Chat Messages Table',
          status: 'FAIL',
          details: `Error: ${error}`
        });
      }
    }

    // Test 7: Network Connectivity
    try {
      const response = await fetch('https://vuzhlwyhcrsxqfysczsu.supabase.co/rest/v1/', {
        method: 'HEAD',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1emhsd3loY3JzeHFmeXNjenN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NjU2NDQsImV4cCI6MjA2NTE0MTY0NH0.XXczMcxqEKgwNnRZOJmL02_FEcE5b3_by29qM1dYsX0'
        }
      });

      results.tests.push({
        name: 'Network Connectivity',
        status: response.ok ? 'PASS' : 'FAIL',
        details: response.ok ? 'Direct network connection working' : `HTTP ${response.status}: ${response.statusText}`
      });
    } catch (error) {
      results.tests.push({
        name: 'Network Connectivity',
        status: 'FAIL',
        details: `Network error: ${error}`
      });
    }

    setDiagnostics(results);
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS': return '✅';
      case 'FAIL': return '❌';
      default: return '⚠️';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASS': return 'text-green-600';
      case 'FAIL': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔍 Chat-System Diagnose vs. Supabase
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runDiagnostics} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Teste Chat-System...' : 'Vollständige Chat-Diagnose starten'}
        </Button>

        {diagnostics && (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                Diagnose durchgeführt am: {new Date(diagnostics.timestamp).toLocaleString('de-DE')}
              </AlertDescription>
            </Alert>

            <div className="grid gap-3">
              {diagnostics.tests.map((test: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{test.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getStatusIcon(test.status)}</span>
                      <span className={`text-sm font-medium ${getStatusColor(test.status)}`}>
                        {test.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground bg-gray-50 p-2 rounded">
                    {test.details}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Zusammenfassung:</h4>
              <div className="text-sm space-y-1">
                <div>✅ Bestanden: {diagnostics.tests.filter((t: any) => t.status === 'PASS').length}</div>
                <div>❌ Fehlgeschlagen: {diagnostics.tests.filter((t: any) => t.status === 'FAIL').length}</div>
                <div>⚠️ Warnungen: {diagnostics.tests.filter((t: any) => t.status === 'WARNING').length}</div>
              </div>
              
              {diagnostics.tests.filter((t: any) => t.status === 'FAIL').length > 0 && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                  <h5 className="font-medium text-red-800 mb-2">Empfohlene Maßnahmen:</h5>
                  <ul className="text-sm text-red-700 space-y-1">
                    {diagnostics.tests.some((t: any) => t.name === 'User Authentication' && t.status === 'FAIL') && (
                      <li>• Bitte melde dich an, um alle Chat-Funktionen zu testen</li>
                    )}
                    {diagnostics.tests.some((t: any) => t.name === 'Chat Edge Function' && t.status === 'FAIL') && (
                      <li>• Edge Function Problem - OpenAI API Key überprüfen</li>
                    )}
                    {diagnostics.tests.some((t: any) => t.name === 'Network Connectivity' && t.status === 'FAIL') && (
                      <li>• Netzwerkverbindung zu Supabase überprüfen</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
