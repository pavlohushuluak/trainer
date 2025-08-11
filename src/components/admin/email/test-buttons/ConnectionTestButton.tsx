
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTranslations } from '@/hooks/useTranslations';

export const ConnectionTestButton = () => {
  const { toast } = useToast();
  const { t } = useTranslations();

  const testEmailConfig = async () => {
    try {
      
      const { data, error } = await supabase.functions.invoke('update-email-config', {
        body: { testMode: true }
      });


      if (error) {
        
        // Check specific error types
        if (error.message?.includes('Failed to fetch') || error.message?.includes('FunctionsHttpError')) {
          toast({
            title: t('adminEmail.testButtons.connectionTest.edgeFunctionsUnreachable'),
            description: t('adminEmail.testButtons.connectionTest.edgeFunctionsUnreachableDescription'),
            variant: "destructive",
            duration: 8000
          });
          return;
        }
        
        throw error;
      }
      
      toast({
        title: t('adminEmail.testButtons.connectionTest.success'),
        description: t('adminEmail.testButtons.connectionTest.successDescription'),
        duration: 3000
      });
    } catch (error) {
      
      let errorMessage = t('adminEmail.testButtons.connectionTest.errorDescriptions.unknown');
      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Provide specific guidance based on error type
      let description = t('adminEmail.testButtons.connectionTest.errorDescription', { errorMessage });
      
      if (errorMessage.includes('Failed to fetch')) {
        description = t('adminEmail.testButtons.connectionTest.errorDescriptions.failedToFetch');
      } else if (errorMessage.includes('CORS')) {
        description = t('adminEmail.testButtons.connectionTest.errorDescriptions.cors');
      } else if (errorMessage.includes('JWT')) {
        description = t('adminEmail.testButtons.connectionTest.errorDescriptions.jwt');
      }
      
      toast({
        title: t('adminEmail.testButtons.connectionTest.error'),
        description,
        variant: "destructive",
        duration: 10000
      });
    }
  };

  return (
    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <Button 
        variant="outline" 
        size="sm"
        onClick={testEmailConfig}
        className="w-full"
      >
        {t('adminEmail.testButtons.connectionTest.title')}
      </Button>
      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
        {t('adminEmail.testButtons.connectionTest.description')}
      </p>
    </div>
  );
};
