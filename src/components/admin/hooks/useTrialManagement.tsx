
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

export const useTrialManagement = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const setTrialPeriod = useMutation({
    mutationFn: async ({ userId, trialDays }: { userId: string; trialDays: string }) => {
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + parseInt(trialDays));

      // Check if user has a subscriber record
      const { data: existingSubscriber } = await supabase
        .from('subscribers')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!existingSubscriber) {
        // Create subscriber record if it doesn't exist
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', userId)
          .single();

        if (!profile) throw new Error('User profile not found');

        const { error: insertError } = await supabase
          .from('subscribers')
          .insert({
            user_id: userId,
            email: profile.email,
            trial_end: trialEnd.toISOString(),
            subscription_status: 'trialing'
          });

        if (insertError) throw insertError;
      } else {
        // Update existing subscriber record
        const { error } = await supabase
          .from('subscribers')
          .update({ 
            trial_end: trialEnd.toISOString(),
            subscription_status: 'trialing'
          })
          .eq('user_id', userId);

        if (error) throw error;
      }

      await supabase
        .from('admin_activity_log')
        .insert({
          admin_id: (await supabase.auth.getUser()).data.user?.id,
          action: 'trial_period_set',
          target_user_id: userId,
          details: { trial_days: parseInt(trialDays) }
        });
    },
    onSuccess: (_, { trialDays }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: t('adminHooks.trialManagement.toasts.trialSet'),
        description: t('adminHooks.trialManagement.toasts.trialSetDescription', { days: trialDays })
      });
    }
  });

  return {
    setTrialPeriod
  };
};
