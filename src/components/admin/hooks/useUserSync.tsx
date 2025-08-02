
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

export const useUserSync = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const syncStripeUsers = useMutation({
    mutationFn: async () => {
      
      const { data, error } = await supabase.functions.invoke('sync-stripe-users');
      
      if (error) {
        console.error('Stripe sync error:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: t('adminHooks.userSync.toasts.syncSuccess'),
        description: t('adminHooks.userSync.toasts.syncSuccessDescription', { count: data?.syncedUsers || 0 })
      });
    },
    onError: (error: Error) => {
      console.error('Sync error:', error);
      toast({
        title: t('adminHooks.userSync.toasts.syncError'),
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return {
    syncStripeUsers
  };
};
