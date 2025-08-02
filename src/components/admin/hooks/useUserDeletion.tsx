
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

export const useUserDeletion = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      // Get current session for authorization
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error(t('adminHooks.userDeletion.errors.noSession'));
      }

      // Call the delete-user edge function
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw new Error(error.message || t('adminHooks.userDeletion.errors.deleteFailed'));
      }

      if (!data.success) {
        throw new Error(data.error || t('adminHooks.userDeletion.errors.deleteFailed'));
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      
      if (data.refunded && data.refundAmount > 0) {
        toast({
          title: t('adminHooks.userDeletion.toasts.userDeletedWithRefund'),
          description: `Der Nutzer wurde vollständig gelöscht und €${(data.refundAmount / 100).toFixed(2)} zurückerstattet.`
        });
      } else {
        toast({
          title: t('adminHooks.userDeletion.toasts.userDeleted'),
          description: t('adminHooks.userDeletion.toasts.userDeletedDescription')
        });
      }
    },
    onError: (error: any) => {
      console.error('Delete user error:', error);
      toast({
        title: t('adminHooks.userDeletion.toasts.deleteError'),
        description: error.message || t('adminHooks.userDeletion.toasts.deleteErrorDescription'),
        variant: "destructive"
      });
    }
  });

  return {
    deleteUser
  };
};
