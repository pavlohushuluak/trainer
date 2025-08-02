
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

export const useTestUserManagement = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const toggleTestUser = useMutation({
    mutationFn: async ({ userId, isTestUser }: { userId: string; isTestUser: boolean }) => {
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
            is_test_user: isTestUser
          });

        if (insertError) throw insertError;
      } else {
        // Update existing subscriber record
        const { error } = await supabase
          .from('subscribers')
          .update({ is_test_user: isTestUser })
          .eq('user_id', userId);

        if (error) throw error;
      }

      await supabase
        .from('admin_activity_log')
        .insert({
          admin_id: (await supabase.auth.getUser()).data.user?.id,
          action: isTestUser ? 'user_marked_as_test' : 'user_unmarked_as_test',
          target_user_id: userId
        });
    },
    onSuccess: (_, { isTestUser }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: isTestUser ? t('adminHooks.testUserManagement.toasts.markedAsTest') : t('adminHooks.testUserManagement.toasts.unmarkedAsTest'),
        description: isTestUser ? t('adminHooks.testUserManagement.toasts.markedAsTestDescription') : t('adminHooks.testUserManagement.toasts.unmarkedAsTestDescription')
      });
    }
  });

  return {
    toggleTestUser
  };
};
