import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface LanguagePreference {
  id: number;
  email: string;
  language: string;
  created_at: string;
  updated_at: string;
}

export const useLanguagePreference = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [preference, setPreference] = useState<LanguagePreference | null>(null);

  // Get user's language preference
  const getLanguagePreference = useCallback(async () => {
    if (!user?.email) return null;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('language_support')
        .select('*')
        .eq('email', user.email)
        .single();

      if (error) {
        console.log('No language preference found:', error.message);
        return null;
      }

      setPreference(data);
      return data;
    } catch (error) {
      console.error('Error fetching language preference:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  // Set user's language preference
  const setLanguagePreference = useCallback(async (language: 'de' | 'en') => {
    if (!user?.email) {
      toast({
        title: 'Error',
        description: 'You must be logged in to set language preference',
        variant: 'destructive',
      });
      return false;
    }

    try {
      setLoading(true);
      
      // Try to update existing preference first
      const { data: updateData, error: updateError } = await supabase
        .from('language_support')
        .update({ language, updated_at: new Date().toISOString() })
        .eq('email', user.email)
        .select()
        .single();

      if (updateError && updateError.code === 'PGRST116') {
        // No existing record found, create new one
        const { data: insertData, error: insertError } = await supabase
          .from('language_support')
          .insert({
            email: user.email,
            language,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        setPreference(insertData);
        toast({
          title: 'Language preference saved',
          description: `Your language preference has been set to ${language === 'en' ? 'English' : 'German'}`,
        });
        return true;
      }

      if (updateError) {
        throw updateError;
      }

      setPreference(updateData);
      toast({
        title: 'Language preference updated',
        description: `Your language preference has been updated to ${language === 'en' ? 'English' : 'German'}`,
      });
      return true;
    } catch (error) {
      console.error('Error setting language preference:', error);
      toast({
        title: 'Error',
        description: 'Failed to save language preference. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.email, toast]);

  // Delete user's language preference
  const deleteLanguagePreference = useCallback(async () => {
    if (!user?.email) {
      toast({
        title: 'Error',
        description: 'You must be logged in to delete language preference',
        variant: 'destructive',
      });
      return false;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('language_support')
        .delete()
        .eq('email', user.email);

      if (error) {
        throw error;
      }

      setPreference(null);
      toast({
        title: 'Language preference deleted',
        description: 'Your language preference has been removed',
      });
      return true;
    } catch (error) {
      console.error('Error deleting language preference:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete language preference. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.email, toast]);

  return {
    preference,
    loading,
    getLanguagePreference,
    setLanguagePreference,
    deleteLanguagePreference,
  };
}; 