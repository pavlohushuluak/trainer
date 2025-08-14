import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, TestTube, CheckCircle, XCircle } from 'lucide-react';

export const ChatFunctionTest = () => {
  const { user } = useAuth();
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);

  const addResult = (test: string, success: boolean, details: string, error?: any) => {
    setTestResults(prev => [...prev, {
      test,
      success,
      details,
      error,
      timestamp: new Date().toISOString()
    }]);
  };

  const runTests = async () => {
    if (!user) {
      addResult('User Authentication', false, 'No user found');
      return;
    }

    setIsTesting(true);
    setTestResults([]);

    try {
      // Test 1: Check user session
      addResult('User Session', true, `User ID: ${user.id}, Email: ${user.email}`);

      // Test 2: Check auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        addResult('Auth Token', true, 'Valid session token found');
      } else {
        addResult('Auth Token', false, 'No valid session token');
        return;
      }

      // Test 3: Test edge function with minimal payload
      try {
        const { data, error } = await supabase.functions.invoke('chat-with-ai', {
          body: {
            message: 'Test message',
            sessionId: 'test-session',
            petId: null,
            trainerName: 'Test Trainer',
            language: 'en'
          }
        });

        if (error) {
          addResult('Edge Function Call', false, `Error: ${error.message}`, error);
        } else if (data) {
          addResult('Edge Function Call', true, `Response received: ${data.response ? 'Yes' : 'No'}`, data);
        } else {
          addResult('Edge Function Call', false, 'No data and no error returned');
        }
      } catch (funcError: any) {
        addResult('Edge Function Call', false, `Exception: ${funcError.message}`, funcError);
      }

      // Test 4: Check if function exists
      try {
        const response = await fetch(`${process.env.VITE_SUPABASE_URL}/functions/v1/chat-with-ai`, {
          method: 'OPTIONS',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          addResult('Function Exists', true, 'Function endpoint is accessible');
        } else {
          addResult('Function Exists', false, `HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (fetchError: any) {
        addResult('Function Exists', false, `Fetch error: ${fetchError.message}`, fetchError);
      }

    } catch (error: any) {
      addResult('Test Suite', false, `Test suite failed: ${error.message}`, error);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Chat Function Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runTests} 
          disabled={isTesting || !user}
          className="w-full"
        >
          {isTesting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Running Tests...
            </>
          ) : (
            'Run Chat Function Tests'
          )}
        </Button>

        {testResults.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">Test Results:</h3>
            {testResults.map((result, index) => (
              <Alert key={index} variant={result.success ? "default" : "destructive"}>
                <div className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <AlertDescription>
                    <strong>{result.test}:</strong> {result.details}
                    {result.error && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm">Error Details</summary>
                        <pre className="text-xs mt-1 p-2 bg-gray-100 rounded overflow-auto">
                          {JSON.stringify(result.error, null, 2)}
                        </pre>
                      </details>
                    )}
                  </AlertDescription>
                </div>
              </Alert>
            ))}
          </div>
        )}

        {!user && (
          <Alert variant="destructive">
            <AlertDescription>
              Please log in to run the tests.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}; 