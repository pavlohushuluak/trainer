
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

export const useSubscriptionCancellation = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const cancelUserSubscription = useMutation({
    mutationFn: async ({ userId, immediateRefund }: { userId: string; immediateRefund: boolean }) => {
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: {
          immediateRefund,
          adminUserId: userId // Pass the target user ID for admin cancellation
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, { immediateRefund }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      
      if (immediateRefund && data.refunded) {
        toast({
          title: t('adminHooks.subscriptionCancellation.toasts.cancelledWithRefund'),
          description: `Subscription wurde gekündigt und €${(data.refundAmount / 100).toFixed(2)} zurückerstattet.`
        });
      } else if (immediateRefund) {
        toast({
          title: t('adminHooks.subscriptionCancellation.toasts.cancelledImmediate'),
          description: t('adminHooks.subscriptionCancellation.toasts.cancelledImmediateDescription')
        });
      } else {
        toast({
          title: t('adminHooks.subscriptionCancellation.toasts.cancelledPeriodEnd'),
          description: t('adminHooks.subscriptionCancellation.toasts.cancelledPeriodEndDescription')
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: t('adminHooks.subscriptionCancellation.toasts.cancellationError'),
        description: error.message || t('adminHooks.subscriptionCancellation.toasts.cancellationErrorDescription'),
        variant: "destructive"
      });
    }
  });

  return {
    cancelUserSubscription
  };
};
