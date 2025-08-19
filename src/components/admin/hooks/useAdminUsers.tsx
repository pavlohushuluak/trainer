
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { AdminUser } from '../types';
import { useState, useCallback } from 'react';

export const useAdminUsers = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  
  // Local state for optimistic updates
  const [localAdmins, setLocalAdmins] = useState<AdminUser[]>([]);

  // Simple query to fetch admin users
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
      
      const adminData = data || [];
      setLocalAdmins(adminData);
      return adminData;
    },
  });

  // Frontend-only add admin with optimistic updates
  const addAdmin = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: 'admin' | 'support' }) => {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        throw new Error('Invalid email format');
      }

      // Get current user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        throw new Error('Not authenticated');
      }

      // Create new admin object
      const newAdmin: AdminUser = {
        id: `temp-${Date.now()}`, // Temporary ID for optimistic update
        email: email.toLowerCase().trim(),
        role: role,
        is_active: true,
        created_at: new Date().toISOString(),
        created_by: currentUser.id
      };

      // Optimistic update
      setLocalAdmins(prev => [newAdmin, ...prev]);

      // Simple insert
      const { data, error } = await supabase
        .from('admin_users')
        .insert({
          user_id: currentUser.id, // Use current user as placeholder
          email: email.toLowerCase().trim(),
          role: role,
          created_by: currentUser.id,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        // Revert optimistic update on error
        setLocalAdmins(prev => prev.filter(admin => admin.id !== newAdmin.id));
        throw error;
      }

      // Update with real data
      if (data) {
        setLocalAdmins(prev => prev.map(admin => 
          admin.id === newAdmin.id ? data : admin
        ));
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] });
      toast({
        title: 'Admin added successfully',
        description: 'The admin user has been added to the system.'
      });
    },
    onError: (error: Error) => {
      console.error('Add admin error:', error);
      toast({
        title: 'Error adding admin',
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Frontend-only toggle status with optimistic updates
  const toggleAdminStatus = useMutation({
    mutationFn: async ({ adminId, activate }: { adminId: string; activate: boolean }) => {
      // Optimistic update
      setLocalAdmins(prev => prev.map(admin => 
        admin.id === adminId ? { ...admin, is_active: activate } : admin
      ));

      const { error } = await supabase
        .from('admin_users')
        .update({ is_active: activate })
        .eq('id', adminId);

      if (error) {
        // Revert optimistic update on error
        setLocalAdmins(prev => prev.map(admin => 
          admin.id === adminId ? { ...admin, is_active: !activate } : admin
        ));
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] });
      toast({
        title: 'Status updated',
        description: 'Admin status has been updated successfully.'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating status',
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Frontend-only remove admin with optimistic updates
  const removeAdmin = useMutation({
    mutationFn: async (adminId: string) => {
      // Store admin for potential revert
      const adminToRemove = localAdmins.find(admin => admin.id === adminId);
      
      // Optimistic update
      setLocalAdmins(prev => prev.filter(admin => admin.id !== adminId));

      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', adminId);

      if (error) {
        // Revert optimistic update on error
        if (adminToRemove) {
          setLocalAdmins(prev => [...prev, adminToRemove]);
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] });
      toast({
        title: 'Admin removed',
        description: 'Admin user has been removed successfully.'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error removing admin',
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Use local state for display
  const displayAdmins = localAdmins.length > 0 ? localAdmins : (admins || []);

  return {
    admins: displayAdmins,
    isLoading,
    error,
    addAdmin,
    toggleAdminStatus,
    removeAdmin
  };
};
