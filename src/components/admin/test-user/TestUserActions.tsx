import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

export const useTestUserActions = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const createTestUser = useMutation({
    mutationFn: async (testEmail: string) => {
      
      try {
        // Überprüfe, ob bereits ein Subscriber mit dieser E-Mail existiert
        const { data: existingSubscriber, error: checkError } = await supabase
          .from('subscribers')
          .select('*')
          .eq('email', testEmail)
          .maybeSingle();

        if (checkError && checkError.code !== 'PGRST116') {
          throw new Error(t('adminTestUser.actions.errors.checkExistingUser', { error: checkError.message }));
        }

        let result;
        if (existingSubscriber) {
          // Aktiviere bestehenden Subscriber mit einem gültigen subscription_tier Wert
          const { error: updateError } = await supabase
            .from('subscribers')
            .update({
              subscribed: true,
              subscription_status: 'active',
              subscription_tier: 'plan5', // Verwende kleinschreibung
              billing_cycle: 'monthly',
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              trial_used: false,
              is_manually_activated: true,
              admin_notes: t('adminTestUser.actions.adminNotes.testAccessActivated', { date: new Date().toLocaleDateString() }),
              updated_at: new Date().toISOString()
            })
            .eq('email', testEmail);

          if (updateError) {
            throw new Error(t('adminTestUser.actions.errors.updateError', { error: updateError.message }));
          }
          
          result = { action: 'updated', email: testEmail };
        } else {
          // Erstelle neuen Test-Subscriber mit gültigem subscription_tier
          const { error: insertError } = await supabase
            .from('subscribers')
            .insert({
              email: testEmail,
              subscribed: true,
              subscription_status: 'active',
              subscription_tier: 'plan5', // Verwende kleinschreibung
              billing_cycle: 'monthly',
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              trial_used: false,
              is_manually_activated: true,
              admin_notes: t('adminTestUser.actions.adminNotes.testAccessCreated', { date: new Date().toLocaleDateString() }),
              country: 'DE'
            });

          if (insertError) {
            throw new Error(t('adminTestUser.actions.errors.createError', { error: insertError.message }));
          }
          
          result = { action: 'created', email: testEmail };
        }

        // Send welcome email for test user
        try {
          const { error: emailError } = await supabase.functions.invoke('send-welcome-email', {
            body: {
              emailType: 'test-user-welcome',
              userEmail: testEmail,
              userName: 'Test-Nutzer'
            }
          });

          if (emailError) {
            // Don't fail the whole operation if email fails
          } else {
          }
        } catch (emailError) {
          // Continue despite email error
        }

        return result;
      } catch (error: any) {
        throw error;
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: t('adminTestUser.actions.toasts.testAccessSuccess'),
        description: result.action === 'created' 
          ? t('adminTestUser.actions.toasts.testAccessCreated', { email: result.email })
          : t('adminTestUser.actions.toasts.testAccessUpdated', { email: result.email }),
        duration: 5000
      });
    },
    onError: (error: any) => {
      toast({
        title: t('adminTestUser.actions.toasts.testAccessError'),
        description: error.message || t('adminTestUser.actions.toasts.testAccessErrorDescription'),
        variant: "destructive",
        duration: 8000
      });
    },
    onSettled: () => {
      // Diese Funktion wird IMMER aufgerufen (egal ob Erfolg oder Fehler)
    }
  });

  const generateMagicLink = useMutation({
    mutationFn: async (testEmail: string) => {
      
      try {
        // Überprüfe zuerst die aktuelle Supabase-Konfiguration
        const { data: { session } } = await supabase.auth.getSession();
        
        // Validiere E-Mail-Format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(testEmail)) {
          throw new Error(t('adminTestUser.actions.errors.invalidEmailFormat'));
        }
        
        // Erstelle einen Magic Link für den Test-Benutzer
        const { data, error } = await supabase.auth.signInWithOtp({
          email: testEmail,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            shouldCreateUser: true,
            data: {
              origin: 'admin_test_user',
              created_by: session?.user?.email || 'admin'
            }
          }
        });


        if (error) {
          
          // Spezifische Fehlermeldungen
          if (error.message.includes('Email rate limit exceeded')) {
            throw new Error(t('adminTestUser.actions.errors.emailRateLimit'));
          }
          
          if (error.message.includes('Signup disabled')) {
            throw new Error(t('adminTestUser.actions.errors.signupDisabled'));
          }
          
          throw new Error(error.message);
        }
        
        // Send custom magic link email via our Edge Function
        try {
          const magicLinkUrl = `${window.location.origin}/auth/callback?token_hash=${data}&type=magiclink`;
          
          const { error: emailError } = await supabase.functions.invoke('send-welcome-email', {
            body: {
              emailType: 'magic-link',
              userEmail: testEmail,
              userName: 'Test-Nutzer',
              magicLink: magicLinkUrl
            }
          });

          if (emailError) {
            // Continue despite email error - Supabase still sent its default email
          } else {
          }
        } catch (emailError) {
          // Continue - the default Supabase email was still sent
        }
        
        return { data, email: testEmail };
      } catch (authError: any) {
        
        throw authError;
      }
    },
    onSuccess: (result) => {
      toast({
        title: t('adminTestUser.actions.toasts.magicLinkSent'),
        description: t('adminTestUser.actions.toasts.magicLinkDescription', { email: result.email }),
        duration: 8000
      });
    },
    onError: (error: any) => {
      
      let errorMessage = t('adminTestUser.actions.toasts.magicLinkGenericError');
      let suggestion = '';
      
      if (error.message.includes('email_address_invalid')) {
        errorMessage = t('adminTestUser.actions.errors.emailAddressInvalid');
        suggestion = t('adminTestUser.actions.errors.checkEmailAddress');
      } else if (error.message.includes('Email rate limit exceeded')) {
        errorMessage = t('adminTestUser.actions.errors.emailRateLimit');
        suggestion = t('adminTestUser.actions.errors.waitAndRetry');
      } else if (error.message.includes('Signup disabled')) {
        errorMessage = t('adminTestUser.actions.errors.signupDisabled');
        suggestion = t('adminTestUser.actions.errors.enableSignup');
      } else if (error.message.includes('Ungültiges E-Mail-Format')) {
        errorMessage = t('adminTestUser.actions.errors.invalidEmailFormat');
        suggestion = t('adminTestUser.actions.errors.enterValidEmail');
      } else {
        errorMessage = `${t('adminTestUser.actions.toasts.magicLinkError')}: ${error.message}`;
        suggestion = t('adminTestUser.actions.errors.checkSupabaseConfig');
      }
      
      toast({
        title: t('adminTestUser.actions.toasts.magicLinkError'),
        description: `${errorMessage}${suggestion ? ` ${suggestion}` : ''}`,
        variant: "destructive",
        duration: 10000
      });
    },
    onSettled: () => {
      // Diese Funktion wird IMMER aufgerufen (egal ob Erfolg oder Fehler)
    }
  });

  return {
    createTestUser,
    generateMagicLink
  };
};
