
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface RefreshSubscriptionButtonProps {
  onRefresh?: () => void;
}

export const RefreshSubscriptionButton = ({ onRefresh }: RefreshSubscriptionButtonProps) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleRefresh = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('❌ Error refreshing subscription:', error);
        throw error;
      }

      // Only show toast on manual refresh
      toast({
        title: t('subscription.refreshButton.updated'),
        description: t('subscription.refreshButton.successfullyUpdated'),
      });

      // Trigger parent refresh if callback provided
      if (onRefresh) {
        onRefresh();
      }
      
      // Force page reload to ensure all components get fresh data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error: any) {
      console.error('❌ Failed to refresh subscription:', error);
      toast({
        title: t('subscription.refreshButton.error'),
        description: t('subscription.refreshButton.couldNotUpdate'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleRefresh}
      disabled={loading}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
      {loading ? t('subscription.refreshButton.updating') : t('subscription.refreshButton.updateSubscription')}
    </Button>
  );
};
