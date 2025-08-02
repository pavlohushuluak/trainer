
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const LiveTestEmailButton = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [sending, setSending] = useState(false);

  const sendLiveTestEmail = async () => {
    setSending(true);
    try {
      
      const { data, error } = await supabase.functions.invoke('send-welcome-email', {
        body: {
          emailType: 'welcome',
          userEmail: 'gl@cooper-ads.com',
          userName: 'Günter',
          planName: 'Premium Plan',
          trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          bypassTestMode: true  // NEW: This bypasses the test mode redirection
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
        title: t('adminEmail.testButtons.liveTest.success'),
        description: `Welcome-E-Mail wurde erfolgreich an gl@cooper-ads.com gesendet. E-Mail-ID: ${data?.emailId}`,
        duration: 6000
      });
    } catch (error) {
      console.error('Live test email error:', error);
      
      let errorMessage = t('adminEmail.testButtons.connectionTest.errorDescriptions.unknown');
      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast({
        title: t('adminEmail.testButtons.liveTest.error'),
        description: `Fehler: ${errorMessage}`,
        variant: "destructive",
        duration: 8000
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Button 
      onClick={sendLiveTestEmail}
      disabled={sending}
      className="bg-blue-600 hover:bg-blue-700 text-white"
    >
      {sending ? '📧 Sende...' : t('adminEmail.testButtons.liveTest.title')}
    </Button>
  );
};
