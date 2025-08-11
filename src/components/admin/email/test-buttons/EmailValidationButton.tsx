
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';

export const EmailValidationButton = () => {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const { toast } = useToast();
  const { t } = useTranslations();

  const validateEmailSetup = async () => {
    setLoading(true);
    try {
      
      const { data, error } = await supabase.functions.invoke('send-welcome-email', {
        body: { validate: true }
      });


      if (error) {
        console.error('Validation error:', error);
        throw error;
      }

      setLastResult(data);

      if (data?.valid) {
        const domainCount = data.details?.verifiedDomains?.length || 0;
        const hasVerifiedDomains = domainCount > 0;
        const isSynced = data.details?.apiKeyType === 'valid_and_synced';
        
        let title = t('adminEmail.testButtons.emailValidation.success');
        let description = `${t('adminEmail.testButtons.emailValidation.validation.apiKeyValid')}, ${domainCount} ${t('adminEmail.testButtons.emailValidation.validation.domainsVerified')}`;
        
        if (data.details?.testEmailId) {
          description += `, ${t('adminEmail.testButtons.emailValidation.validation.testEmailSent')}`;
        }
        
        if (isSynced) {
          title = "✅ API-Key erfolgreich synchronisiert";
          description += ` - ${t('adminEmail.testButtons.emailValidation.validation.configurationUpdated')}`;
        }
        
        if (!hasVerifiedDomains) {
          title = `⚠️ ${t('adminEmail.testButtons.emailValidation.validation.apiKeyValid')}, ${t('adminEmail.testButtons.emailValidation.validation.domainVerificationRequired')}`;
          description += `. ${t('adminEmail.testButtons.emailValidation.validation.domainNote')}`;
        }

        toast({
          title,
          description,
          duration: hasVerifiedDomains ? 8000 : 12000,
          variant: hasVerifiedDomains ? "default" : "destructive"
        });
      } else {
        const troubleshooting = data?.details?.troubleshooting || t('adminEmail.testButtons.emailValidation.validation.unknownValidationError');
        
        toast({
          title: t('adminEmail.testButtons.emailValidation.error'),
          description: `${data?.error || t('adminEmail.testButtons.emailValidation.validation.validationFailed')}\n\n${t('adminEmail.testButtons.emailValidation.validation.solutionSteps')}\n${troubleshooting}`,
          variant: "destructive",
          duration: 15000
        });
      }
    } catch (error) {
      console.error('Email validation error:', error);
      setLastResult({ valid: false, error: error.message });
      
      toast({
        title: t('adminEmail.testButtons.emailValidation.error'),
        description: `${t('adminEmail.testButtons.emailValidation.validation.error')} ${error.message}`,
        variant: "destructive",
        duration: 8000
      });
    } finally {
      setLoading(false);
    }
  };

  const forceSync = async () => {
    setSyncing(true);
    try {
      
      // First trigger a validation to check current state
      const { data, error } = await supabase.functions.invoke('send-welcome-email', {
        body: { validate: true }
      });

      if (error) {
        throw error;
      }

      if (data?.valid) {
        toast({
          title: t('adminEmail.testButtons.emailValidation.sync.configurationAlreadySynced'),
          description: t('adminEmail.testButtons.emailValidation.sync.configurationAlreadySyncedDescription'),
          duration: 5000
        });
      } else {
        toast({
          title: t('adminEmail.testButtons.emailValidation.sync.synchronizationRequired'),
          description: t('adminEmail.testButtons.emailValidation.sync.synchronizationRequiredDescription'),
          variant: "destructive",
          duration: 10000
        });
      }
      
      setLastResult(data);
    } catch (error) {
      console.error('Force sync error:', error);
      toast({
        title: t('adminEmail.testButtons.emailValidation.sync.synchronizationFailed'),
        description: t('adminEmail.testButtons.emailValidation.sync.synchronizationFailedDescription', { error: error.message }),
        variant: "destructive",
        duration: 8000
      });
    } finally {
      setSyncing(false);
    }
  };

  const getStatusIcon = () => {
    if (!lastResult) return null;
    
    if (lastResult.valid) {
      const hasVerifiedDomains = lastResult.details?.verifiedDomains?.length > 0;
      if (hasVerifiedDomains) {
        return <CheckCircle className="mr-2 h-4 w-4 text-green-600 dark:text-green-400" />;
      } else {
        return <AlertTriangle className="mr-2 h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
      }
    } else {
      return <XCircle className="mr-2 h-4 w-4 text-red-600 dark:text-red-400" />;
    }
  };

  const getButtonVariant = () => {
    if (!lastResult) return "outline";
    
    if (lastResult.valid) {
      const hasVerifiedDomains = lastResult.details?.verifiedDomains?.length > 0;
      return hasVerifiedDomains ? "default" : "outline";
    }
    return "outline";
  };

  return (
    <div className="space-y-3">
      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex gap-2 mb-2">
          <Button 
            onClick={validateEmailSetup}
            disabled={loading || syncing}
            className="flex-1"
            variant={getButtonVariant()}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('adminEmail.testButtons.emailValidation.validation.loading')}
              </>
            ) : (
              <>
                {getStatusIcon()}
                {t('adminEmail.testButtons.emailValidation.title')}
              </>
            )}
          </Button>
          
          <Button 
            onClick={forceSync}
            disabled={loading || syncing}
            variant="outline"
            size="sm"
          >
            {syncing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {lastResult && (
          <div className="text-xs">
            <div className={`p-2 rounded text-white ${lastResult.valid ? 'bg-green-600 dark:bg-green-500' : 'bg-red-600 dark:bg-red-500'}`}>
              <strong>{t('adminEmail.testButtons.emailValidation.validation.status')}</strong> {lastResult.valid ? t('adminEmail.testButtons.emailValidation.validation.functional') : t('adminEmail.testButtons.emailValidation.validation.faulty')}
              {lastResult.valid && !lastResult.details?.verifiedDomains?.length && (
                <span className="ml-2 text-yellow-200 dark:text-yellow-100">{t('adminEmail.testButtons.emailValidation.validation.domainVerificationRequiredNote')}</span>
              )}
            </div>
            {lastResult.details && (
              <div className="mt-1 p-2 bg-gray-100 dark:bg-gray-800/50 rounded text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                <div>{t('adminEmail.testButtons.emailValidation.validation.apiKey')} {lastResult.details.apiKeyValid ? '✅' : '❌'} 
                  {lastResult.details.apiKeyType && (
                    <span className="ml-1 text-xs">({lastResult.details.apiKeyType})</span>
                  )}
                </div>
                <div>
                  {t('adminEmail.testButtons.emailValidation.validation.domains')} {lastResult.details.verifiedDomains?.length || 0} {t('adminEmail.testButtons.emailValidation.validation.domainsVerified')}
                  {lastResult.details.verifiedDomains?.length > 0 && (
                    <span className="ml-1 text-xs">
                      ({lastResult.details.verifiedDomains.join(', ')})
                    </span>
                  )}
                </div>
                <div>{t('adminEmail.testButtons.emailValidation.validation.emailSending')} {lastResult.details.canSendEmails ? '✅' : '❌'}</div>
                {lastResult.details.testEmailId && (
                  <div>{t('adminEmail.testButtons.emailValidation.validation.testEmailId')} {lastResult.details.testEmailId}</div>
                )}
                {lastResult.details.syncTimestamp && (
                  <div>{t('adminEmail.testButtons.emailValidation.validation.lastSync')} {new Date(lastResult.details.syncTimestamp).toLocaleString()}</div>
                )}
              </div>
            )}
            {lastResult.error && (
              <div className="mt-1 p-2 bg-red-100 dark:bg-red-900/20 rounded text-red-700 dark:text-red-300 text-xs border border-red-200 dark:border-red-800">
                <strong>{t('adminEmail.testButtons.emailValidation.validation.error')}</strong> {lastResult.error}
              </div>
            )}
            {lastResult.details?.troubleshooting && (
              <div className="mt-1 p-2 bg-blue-100 dark:bg-blue-900/20 rounded text-blue-700 dark:text-blue-300 text-xs border border-blue-200 dark:border-blue-800">
                <strong>{t('adminEmail.testButtons.emailValidation.validation.troubleshooting')}</strong>
                <pre className="whitespace-pre-wrap mt-1 text-xs">{lastResult.details.troubleshooting}</pre>
              </div>
            )}
          </div>
        )}
        
        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
          {t('adminEmail.testButtons.emailValidation.description')}
        </p>
      </div>
    </div>
  );
};
