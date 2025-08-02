
import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface EmailModeToggleProps {
  testMode: boolean;
  setTestMode: (mode: boolean) => void;
  updating: boolean;
  setUpdating: (updating: boolean) => void;
}

export const EmailModeToggle = ({ testMode, setTestMode, updating, setUpdating }: EmailModeToggleProps) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [syncing, setSyncing] = useState(false);

  // Load current email configuration on mount
  useEffect(() => {
    loadEmailConfig();
  }, []);

  const loadEmailConfig = async () => {
    try {
      
      // Get current configuration directly from Edge Functions validation
      const { data: validationData, error: validationError } = await supabase.functions.invoke('send-welcome-email', {
        body: { validate: true }
      });

      if (validationError) {
        console.error('Validation error:', validationError);
        throw validationError;
      }


      if (validationData?.valid && validationData?.details) {
        // Determine if we're in live mode based on API setup
        const isLiveMode = validationData.details.apiKeyValid && 
                          validationData.details.canSendEmails && 
                          (validationData.details.verifiedDomains?.length > 0);
        
        setTestMode(!isLiveMode);
        
        // Update database configuration to match current setup
        await supabase.functions.invoke('update-email-config', {
          body: { testMode: !isLiveMode }
        });
      } else {
        // Fallback: Load from database if validation fails
        const { data } = await supabase
          .from('system_notifications')
          .select('message')
          .eq('id', '00000000-0000-0000-0000-000000000001')
          .eq('type', 'email_config')
          .single();

        if (data?.message) {
          const config = JSON.parse(data.message);
          setTestMode(config.testMode !== false);
        }
      }
    } catch (error) {
      console.error('Failed to load email config:', error);
      // Default to test mode if loading fails
      setTestMode(true);
    }
  };

  const syncConfiguration = async () => {
    setSyncing(true);
    try {
      
      // Validate current Edge Function setup
      const { data, error } = await supabase.functions.invoke('send-welcome-email', {
        body: { validate: true }
      });

      if (error) {
        console.error('Sync validation error:', error);
        throw error;
      }


      if (data?.valid && data?.details) {
        // Auto-detect mode based on setup
        const hasVerifiedDomains = data.details.verifiedDomains?.length > 0;
        const canSendEmails = data.details.canSendEmails;
        const apiKeyValid = data.details.apiKeyValid;
        
        const isLiveMode = apiKeyValid && canSendEmails && hasVerifiedDomains;
        
        
        // Update local state
        setTestMode(!isLiveMode);
        
        // Update database configuration
        await supabase.functions.invoke('update-email-config', {
          body: { testMode: !isLiveMode }
        });

        const modeText = isLiveMode ? t('adminEmail.modeToggle.liveMode') : t('adminEmail.modeToggle.testMode');
        const domainCount = data.details.verifiedDomains?.length || 0;
        
        toast({
          title: t('adminEmail.modeToggle.toasts.syncSuccess'),
          description: `${modeText} erkannt und aktiviert. API-Key gültig, ${domainCount} verifizierte Domain(s).`,
          duration: 5000
        });
      } else {
        throw new Error(data?.error || 'E-Mail-Konfiguration ungültig');
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: t('adminEmail.modeToggle.toasts.syncError'),
        description: `Fehler: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleTestMode = async () => {
    setUpdating(true);
    try {
      const { error } = await supabase.functions.invoke('update-email-config', {
        body: { testMode: !testMode }
      });

      if (error) throw error;
      
      if (!testMode) {
        toast({
          title: t('adminEmail.modeToggle.toasts.testModeActivated'),
          description: "Alle E-Mails werden an die Test-Adresse weitergeleitet.",
          duration: 5000
        });
      } else {
        toast({
          title: t('adminEmail.modeToggle.toasts.liveModeActivated'),
          description: "E-Mails werden an echte Nutzer-Adressen versendet. Stellen Sie sicher, dass die Domain tiertrainer24.com in Resend verifiziert ist.",
          duration: 8000
        });
      }
      
      setTestMode(!testMode);
    } catch (error) {
      console.error('Toggle error:', error);
      toast({
        title: t('adminEmail.modeToggle.toasts.toggleError'),
        description: t('adminEmail.modeToggle.toasts.toggleErrorDescription'),
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="space-y-1">
          <div className="font-medium flex items-center gap-2 text-foreground">
            {/* {testMode ? "🧪 Test-Modus aktiv" : "🚀 Live-Modus"} */}
            {(updating || syncing) && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {testMode 
              ? t('adminEmail.modeToggle.testDescription')
              : t('adminEmail.modeToggle.liveDescription')
            }
          </div>
        </div>
        <Switch
          checked={!testMode}
          onCheckedChange={handleToggleTestMode}
          disabled={updating || syncing}
        />
      </div>

      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={syncConfiguration}
          disabled={syncing || updating}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          {t('adminEmail.modeToggle.syncConfiguration')}
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={loadEmailConfig}
          disabled={syncing || updating}
          className="flex items-center gap-2"
        >
          {t('adminEmail.modeToggle.reload')}
        </Button>
      </div>

      <div className="text-xs text-gray-600 dark:text-gray-400 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
        {t('adminEmail.modeToggle.autoSyncInfo')}
      </div>
    </div>
  );
};
