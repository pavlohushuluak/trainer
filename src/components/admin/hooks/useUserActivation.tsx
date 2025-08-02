
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

export const useUserActivation = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const activateUser = useMutation({
    mutationFn: async (userId: string) => {
      // First check if user has a subscriber record
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
            subscribed: true,
            is_manually_activated: true,
            subscription_status: 'active'
          });

        if (insertError) throw insertError;
      } else {
        // Update existing subscriber record
        const { error } = await supabase
          .from('subscribers')
          .update({ 
            subscribed: true,
            is_manually_activated: true,
            subscription_status: 'active'
          })
          .eq('user_id', userId);

        if (error) throw error;
      }

      await supabase
        .from('admin_activity_log')
        .insert({
          admin_id: (await supabase.auth.getUser()).data.user?.id,
          action: 'user_activated',
          target_user_id: userId
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: t('adminHooks.userActivation.toasts.userActivated'),
        description: t('adminHooks.userActivation.toasts.userActivatedDescription')
      });
    }
  });

  const deactivateUser = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('subscribers')
        .update({ 
          subscribed: false,
          is_manually_activated: false,
          subscription_status: 'inactive'
        })
        .eq('user_id', userId);

      if (error) throw error;

      await supabase
        .from('admin_activity_log')
        .insert({
          admin_id: (await supabase.auth.getUser()).data.user?.id,
          action: 'user_deactivated',
          target_user_id: userId
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: t('adminHooks.userActivation.toasts.userDeactivated'),
        description: t('adminHooks.userActivation.toasts.userDeactivatedDescription')
      });
    }
  });

  return {
    activateUser,
    deactivateUser
  };
};
