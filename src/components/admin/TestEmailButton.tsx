
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from '@/hooks/useTranslations';
import { supabase } from '@/integrations/supabase/client';
import { Send, Loader2 } from 'lucide-react';

interface TestEmailButtonProps {
  recipientEmail?: string;
}

export const TestEmailButton = ({ recipientEmail = "gl@cooper-ads.com" }: TestEmailButtonProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslations();

  const sendTestEmail = async () => {
    setLoading(true);
    try {
      
      const { data, error } = await supabase.functions.invoke('send-test-email', {
        body: {
          recipientEmail
        }
      });

      if (error) {
        console.error('Function invoke error:', error);
        throw error;
      }

      if (data?.error) {
        console.error('Function returned error:', data.error);
        throw new Error(data.error);
      }
      
      toast({
        title: t('testEmail.success.title'),
        description: t('testEmail.success.description', { email: recipientEmail }),
        duration: 5000
      });

    } catch (error: any) {
      console.error('Test email error:', error);
      
      const errorMessage = error?.message || t('testEmail.errors.unknownError');
      toast({
        title: t('testEmail.errors.title'),
        description: t('testEmail.errors.description', { error: errorMessage }),
        variant: "destructive",
        duration: 8000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={sendTestEmail}
      disabled={loading}
      className="w-full"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {t('testEmail.sending')}
        </>
      ) : (
        <>
          <Send className="mr-2 h-4 w-4" />
          {t('testEmail.sendTo', { email: recipientEmail })}
        </>
      )}
    </Button>
  );
};
