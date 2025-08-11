
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';

export const SimpleEmailValidationButton = () => {
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const { toast } = useToast();
  const { t } = useTranslations();

  const validateEmailSetup = async () => {
    setLoading(true);
    
    try {
      // Step 1: Test basic email sending
      const { data: testData, error: testError } = await supabase.functions.invoke('send-test-email', {
        body: { recipientEmail: 'owydwaldt12@gmail.com' }
      });


      if (testError) {
        console.error('❌ Test email failed:', testError);
        setLastResult({ 
          valid: false, 
          error: testError.message,
          step: 'test_email_send'
        });
        
        toast({
          title: t('adminEmail.testButtons.emailValidation.toasts.testEmailFailed.title'),
          description: t('adminEmail.testButtons.emailValidation.toasts.testEmailFailed.description', { error: testError.message }),
          variant: "destructive",
          duration: 10000
        });
        return;
      }

      if (testData?.success) {
        setLastResult({ 
          valid: true, 
          message: t('adminEmail.testButtons.emailValidation.status.successful'),
          emailId: testData.emailId,
          step: 'test_email_send'
        });
        
        toast({
          title: t('adminEmail.testButtons.emailValidation.toasts.testEmailSuccess.title'),
          description: t('adminEmail.testButtons.emailValidation.toasts.testEmailSuccess.description', { emailId: testData.emailId }),
          duration: 8000
        });
      } else {
        setLastResult({ 
          valid: false, 
          error: testData?.error || t('adminEmail.testButtons.connectionTest.errorDescriptions.unknown'),
          step: 'test_email_send'
        });
        
        toast({
          title: t('adminEmail.testButtons.emailValidation.toasts.testEmailPartialFailure.title'),
          description: t('adminEmail.testButtons.emailValidation.toasts.testEmailPartialFailure.description', { error: testData?.error || t('adminEmail.testButtons.connectionTest.errorDescriptions.unknown') }),
          variant: "destructive",
          duration: 10000
        });
      }

    } catch (error: any) {
      console.error('💥 Email validation error:', error);
      setLastResult({ 
        valid: false, 
        error: error.message,
        step: 'validation_exception'
      });
      
      toast({
        title: t('adminEmail.testButtons.emailValidation.toasts.validationError.title'),
        description: t('adminEmail.testButtons.emailValidation.toasts.validationError.description', { error: error.message }),
        variant: "destructive",
        duration: 8000
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (!lastResult) return null;
    
    if (lastResult.valid) {
      return <CheckCircle className="mr-2 h-4 w-4 text-green-600 dark:text-green-400" />;
    } else {
      return <XCircle className="mr-2 h-4 w-4 text-red-600 dark:text-red-400" />;
    }
  };

  const getButtonVariant = () => {
    if (!lastResult) return "outline";
    return lastResult.valid ? "default" : "outline";
  };

  return (
    <div className="space-y-3">
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <Button 
          onClick={validateEmailSetup}
          disabled={loading}
          className="w-full"
          variant={getButtonVariant()}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('adminEmail.testButtons.emailValidation.loading')}
            </>
          ) : (
            <>
              {getStatusIcon()}
              {t('adminEmail.testButtons.emailValidation.title')}
            </>
          )}
        </Button>
        
        {lastResult && (
          <div className="mt-3 text-xs">
            <div className={`p-2 rounded text-white ${lastResult.valid ? 'bg-green-600 dark:bg-green-500' : 'bg-red-600 dark:bg-red-500'}`}>
              <strong>Status:</strong> {lastResult.valid ? t('adminEmail.testButtons.emailValidation.status.successful') : t('adminEmail.testButtons.emailValidation.status.failed')}
            </div>
            {lastResult.error && (
              <div className="mt-1 p-2 bg-red-100 dark:bg-red-900/20 rounded text-red-700 dark:text-red-300 text-xs border border-red-200 dark:border-red-800">
                <strong>{t('adminEmail.testButtons.emailValidation.status.error')}</strong> {lastResult.error}
              </div>
            )}
            {lastResult.emailId && (
              <div className="mt-1 p-2 bg-green-100 dark:bg-green-900/20 rounded text-green-700 dark:text-green-300 text-xs border border-green-200 dark:border-green-800">
                <strong>{t('adminEmail.testButtons.emailValidation.status.emailId')}</strong> {lastResult.emailId}
              </div>
            )}
          </div>
        )}
        
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
          {t('adminEmail.testButtons.emailValidation.description')}
        </p>
      </div>
    </div>
  );
};
