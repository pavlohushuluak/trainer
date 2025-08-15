
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTranslations } from '@/hooks/useTranslations';

export const ChatDiagnostics = () => {
  const { user } = useAuth();
  const { currentLanguage, t } = useTranslations();
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
      name: t('chat.diagnostics.tests.userAuth'),
      status: user ? t('chat.diagnostics.status.pass') : t('chat.diagnostics.status.fail'),
      details: user ? `${t('chat.diagnostics.details.userAuthenticated')} ${user.id}` : t('chat.diagnostics.details.noUserAuthenticated')
    });

    // Test 2: Supabase Connection
    try {
      const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
      results.tests.push({
        name: t('chat.diagnostics.tests.supabaseConnection'),
        status: error ? t('chat.diagnostics.status.fail') : t('chat.diagnostics.status.pass'),
        details: error ? error.message : t('chat.diagnostics.details.connectionSuccessful')
      });
    } catch (error) {
      results.tests.push({
        name: t('chat.diagnostics.tests.supabaseConnection'),
        status: t('chat.diagnostics.status.fail'),
        details: `${t('chat.diagnostics.details.networkError')} ${error}`
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
            name: t('chat.diagnostics.tests.chatSessionCreation'),
            status: t('chat.diagnostics.status.fail'),
            details: error.message
          });
        } else {
          results.tests.push({
            name: t('chat.diagnostics.tests.chatSessionCreation'),
            status: t('chat.diagnostics.status.pass'),
            details: `${t('chat.diagnostics.details.sessionCreated')} ${data.id}`
          });

          // Clean up test session
          await supabase.from('chat_sessions').delete().eq('id', data.id);
        }
      } catch (error) {
        results.tests.push({
          name: t('chat.diagnostics.tests.chatSessionCreation'),
          status: t('chat.diagnostics.status.fail'),
          details: `${t('chat.diagnostics.details.networkError')} ${error}`
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
        name: t('chat.diagnostics.tests.chatEdgeFunction'),
        status: error ? t('chat.diagnostics.status.fail') : t('chat.diagnostics.status.pass'),
        details: error ? `${t('chat.diagnostics.details.functionError')} ${error.message}` : t('chat.diagnostics.details.functionAccessible')
      });
    } catch (error) {
      results.tests.push({
        name: t('chat.diagnostics.tests.chatEdgeFunction'),
        status: t('chat.diagnostics.status.fail'),
        details: `${t('chat.diagnostics.details.networkError')} ${error}`
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
          name: t('chat.diagnostics.tests.petProfilesAccess'),
          status: error ? t('chat.diagnostics.status.fail') : t('chat.diagnostics.status.pass'),
          details: error ? error.message : `${t('chat.diagnostics.details.foundPetProfiles')} ${data?.length || 0} ${t('chat.diagnostics.details.petProfiles')}`
        });
      } catch (error) {
        results.tests.push({
          name: t('chat.diagnostics.tests.petProfilesAccess'),
          status: t('chat.diagnostics.status.fail'),
          details: `${t('chat.diagnostics.details.networkError')} ${error}`
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
          name: t('chat.diagnostics.tests.chatMessagesTable'),
          status: error ? t('chat.diagnostics.status.fail') : t('chat.diagnostics.status.pass'),
          details: error ? error.message : t('chat.diagnostics.details.chatMessagesAccessible')
        });
      } catch (error) {
        results.tests.push({
          name: t('chat.diagnostics.tests.chatMessagesTable'),
          status: t('chat.diagnostics.status.fail'),
          details: `${t('chat.diagnostics.details.networkError')} ${error}`
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
        name: t('chat.diagnostics.tests.networkConnectivity'),
        status: response.ok ? t('chat.diagnostics.status.pass') : t('chat.diagnostics.status.fail'),
        details: response.ok ? t('chat.diagnostics.details.directNetworkWorking') : `HTTP ${response.status}: ${response.statusText}`
      });
    } catch (error) {
      results.tests.push({
        name: t('chat.diagnostics.tests.networkConnectivity'),
        status: t('chat.diagnostics.status.fail'),
        details: `${t('chat.diagnostics.details.networkError')} ${error}`
      });
    }

    setDiagnostics(results);
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case t('chat.diagnostics.status.pass'): return '✅';
      case t('chat.diagnostics.status.fail'): return '❌';
      default: return '⚠️';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case t('chat.diagnostics.status.pass'): return 'text-green-600';
      case t('chat.diagnostics.status.fail'): return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {t('chat.diagnostics.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runDiagnostics} 
          disabled={loading}
          className="w-full"
        >
          {loading ? t('chat.diagnostics.running') : t('chat.diagnostics.runButton')}
        </Button>

        {diagnostics && (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                {t('chat.diagnostics.timestamp')} {new Date(diagnostics.timestamp).toLocaleString(currentLanguage === 'en' ? 'en-US' : 'de-DE')}
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
              <h4 className="font-medium mb-2">{t('chat.diagnostics.summary')}</h4>
              <div className="text-sm space-y-1">
                <div>✅ {t('chat.diagnostics.passed')} {diagnostics.tests.filter((t: any) => t.status === t('chat.diagnostics.status.pass')).length}</div>
                <div>❌ {t('chat.diagnostics.failed')} {diagnostics.tests.filter((t: any) => t.status === t('chat.diagnostics.status.fail')).length}</div>
                <div>⚠️ {t('chat.diagnostics.warnings')} {diagnostics.tests.filter((t: any) => t.status === t('chat.diagnostics.status.warning')).length}</div>
              </div>
              
              {diagnostics.tests.filter((t: any) => t.status === t('chat.diagnostics.status.fail')).length > 0 && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                  <h5 className="font-medium text-red-800 mb-2">{t('chat.diagnostics.recommendations')}</h5>
                  <ul className="text-sm text-red-700 space-y-1">
                    {diagnostics.tests.some((t: any) => t.name === t('chat.diagnostics.tests.userAuth') && t.status === t('chat.diagnostics.status.fail')) && (
                      <li>{t('chat.diagnostics.authFail')}</li>
                    )}
                    {diagnostics.tests.some((t: any) => t.name === t('chat.diagnostics.tests.chatEdgeFunction') && t.status === t('chat.diagnostics.status.fail')) && (
                      <li>{t('chat.diagnostics.edgeFunctionFail')}</li>
                    )}
                    {diagnostics.tests.some((t: any) => t.name === t('chat.diagnostics.tests.networkConnectivity') && t.status === t('chat.diagnostics.status.fail')) && (
                      <li>{t('chat.diagnostics.networkFail')}</li>
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
