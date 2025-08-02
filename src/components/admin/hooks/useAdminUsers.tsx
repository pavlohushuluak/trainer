
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { AdminUser } from '../types';

export const useAdminUsers = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: admins, isLoading, error } = useQuery({
    queryKey: ['admin-users-list'],
    queryFn: async () => {
      
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading admin users:', error);
        throw error;
      }
      
      return data;
    },
  });

  const addAdmin = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: 'admin' | 'support' }) => {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        throw new Error(t('adminHooks.adminUsers.errors.invalidEmail'));
      }

      // Get current user info first
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        throw new Error(t('adminHooks.adminUsers.errors.notAuthenticated'));
      }

      // Verify current user has admin privileges before allowing admin creation
      const { data: currentAdminData, error: adminCheckError } = await supabase
        .from('admin_users')
        .select('role, is_active')
        .eq('user_id', currentUser.id)
        .eq('is_active', true)
        .single();

      if (adminCheckError || !currentAdminData || currentAdminData.role !== 'admin') {
        throw new Error(t('adminHooks.adminUsers.errors.noPermission'));
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.toLowerCase().trim())
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw new Error(t('adminHooks.adminUsers.errors.userSearchError'));
      }

      if (!profile) {
        throw new Error(t('adminHooks.adminUsers.errors.userNotFound'));
      }

      const { data: existingAdmin, error: adminError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', profile.id)
        .single();

      if (existingAdmin) {
        throw new Error(t('adminHooks.adminUsers.errors.alreadyAdmin'));
      }

      const { error } = await supabase
        .from('admin_users')
        .insert({
          user_id: profile.id,
          email: email.toLowerCase().trim(),
          role: role,
          created_by: currentUser.id
        });

      if (error) {
        throw error;
      }

      // Log admin creation action for security audit
      await supabase
        .from('security_audit_log')
        .insert({
          user_id: currentUser.id,
          action: 'admin_user_created',
          resource_type: 'admin_users',
          resource_id: profile.id,
          details: { 
            target_email: email.toLowerCase().trim(), 
            assigned_role: role,
            created_by: currentUser.email
          }
        });

    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] });
      toast({
        title: t('adminHooks.adminUsers.toasts.adminAdded'),
        description: t('adminHooks.adminUsers.toasts.adminAddedDescription')
      });
    },
    onError: (error: Error) => {
      console.error('Add admin error:', error);
      toast({
        title: t('adminHooks.adminUsers.toasts.error'),
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const toggleAdminStatus = useMutation({
    mutationFn: async ({ adminId, activate }: { adminId: string; activate: boolean }) => {
      const { error } = await supabase
        .from('admin_users')
        .update({ is_active: activate })
        .eq('id', adminId);

      if (error) throw error;

      const admin = admins?.find(a => a.id === adminId);
      if (admin) {
        await supabase
          .from('admin_activity_log')
          .insert({
            admin_id: (await supabase.auth.getUser()).data.user?.id,
            action: activate ? 'admin_activated' : 'admin_deactivated',
            target_user_id: admin.user_id,
            details: { email: admin.email }
          });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] });
      toast({
        title: t('adminHooks.adminUsers.toasts.statusUpdated'),
        description: t('adminHooks.adminUsers.toasts.statusUpdatedDescription')
      });
    }
  });

  const removeAdmin = useMutation({
    mutationFn: async (adminId: string) => {
      const admin = admins?.find(a => a.id === adminId);
      
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', adminId);

      if (error) throw error;

      if (admin) {
        await supabase
          .from('admin_activity_log')
          .insert({
            admin_id: (await supabase.auth.getUser()).data.user?.id,
            action: 'admin_removed',
            target_user_id: admin.user_id,
            details: { email: admin.email, role: admin.role }
          });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] });
      toast({
        title: t('adminHooks.adminUsers.toasts.adminRemoved'),
        description: t('adminHooks.adminUsers.toasts.adminRemovedDescription')
      });
    }
  });

  return {
    admins,
    isLoading,
    error,
    addAdmin,
    toggleAdminStatus,
    removeAdmin
  };
};
