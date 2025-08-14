import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Send, MessageSquare } from 'lucide-react';

export const SimpleChatTest = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const sendTestMessage = async () => {
    if (!message.trim() || !user) return;

    setIsLoading(true);
    setError('');
    setResponse('');

    try {
      console.log('🔍 Testing chat function...');
      
      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: {
          message: message.trim(),
          sessionId: 'test-session-' + Date.now(),
          petId: null,
          trainerName: 'Test Trainer',
          language: 'en'
        }
      });

      console.log('📨 Chat function response:', { data, error });

      if (error) {
        setError(`Error: ${error.message}`);
        console.error('❌ Chat function error:', error);
      } else if (data) {
        setResponse(data.response || 'No response content');
        console.log('✅ Chat function success:', data);
      } else {
        setError('No data and no error returned');
      }
    } catch (err: any) {
      setError(`Exception: ${err.message}`);
      console.error('💥 Chat function exception:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Simple Chat Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Test Message:</label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter a test message..."
            rows={3}
          />
        </div>

        <Button 
          onClick={sendTestMessage} 
          disabled={isLoading || !message.trim() || !user}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Test Message
            </>
          )}
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>
              <strong>Error:</strong> {error}
            </AlertDescription>
          </Alert>
        )}

        {response && (
          <Alert>
            <AlertDescription>
              <strong>Response:</strong>
              <div className="mt-2 p-3 bg-gray-50 rounded text-sm whitespace-pre-wrap">
                {response}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {!user && (
          <Alert variant="destructive">
            <AlertDescription>
              Please log in to test the chat function.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}; 