
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTranslations } from '@/hooks/useTranslations';

export const ComprehensiveFunctionTestButton = () => {
  const { toast } = useToast();
  const { t } = useTranslations();

  const testEmailFunction = async () => {
    try {
      
      const { data, error } = await supabase.functions.invoke('send-welcome-email', {
        body: { test: true }
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }
      
      toast({
        title: t('adminEmail.testButtons.comprehensiveTest.success'),
        description: t('adminEmail.testButtons.comprehensiveTest.successDescription', { recipient: data?.results?.finalRecipient || 'Test-Adresse' }),
        duration: 6000
      });
    } catch (error) {
      
      let errorMessage = t('adminEmail.testButtons.connectionTest.errorDescriptions.unknown');
      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast({
        title: t('adminEmail.testButtons.comprehensiveTest.error'),
        description: t('adminEmail.testButtons.comprehensiveTest.errorDescription', { errorMessage }),
        variant: "destructive",
        duration: 8000
      });
    }
  };

  return (
    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
      <Button 
        variant="outline" 
        size="sm"
        onClick={testEmailFunction}
        className="w-full bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 border-green-300 dark:border-green-700"
      >
        {t('adminEmail.testButtons.comprehensiveTest.title')}
      </Button>
      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
        {t('adminEmail.testButtons.comprehensiveTest.description')}
      </p>
    </div>
  );
};
