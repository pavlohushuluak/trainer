
import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

export const useSubscriptionManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const mounted = useRef(true);
  const checkingSubscription = useRef(false);
  const loadingInvoices = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  const checkSubscription = useCallback(async (showToast = true) => {
    if (checkingSubscription.current || !user?.id) return;
    
    checkingSubscription.current = true;
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      
      if (mounted.current) {
        setSubscription(data || { subscribed: false });
        
        if (showToast) {
          toast({
            title: t('training.toasts.subscription.statusUpdated.title'),
            description: data?.subscribed 
              ? t('training.toasts.subscription.statusUpdated.description', { tier: data.subscription_tier || 'Active' })
              : t('training.toasts.subscription.freeMode.description'),
          });
        }
      }
    } catch (error: any) {
      console.error('💥 CRITICAL: Direct subscription check failed:', error);
      const errorMessage = error?.message || t('training.toasts.subscription.error.description');
      
      if (mounted.current) {
        setError(errorMessage);
        
        if (showToast) {
          toast({
            title: t('training.toasts.subscription.error.title'),
            description: t('training.toasts.subscription.error.description', { message: errorMessage }),
            variant: "destructive"
          });
        }
      }
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
      checkingSubscription.current = false;
    }
  }, [user, toast, t]);

  // Load invoices only once per user
  const loadInvoices = useCallback(async () => {
    if (loadingInvoices.current || !user?.id) return;
    
    loadingInvoices.current = true;
    
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error loading invoices:', error);
      } else if (mounted.current) {
        setInvoices(data || []);
      }
    } catch (error) {
      console.warn('Error loading invoices:', error);
    } finally {
      loadingInvoices.current = false;
    }
  }, [user?.id]);

  // Load data only when user changes
  useEffect(() => {
    if (user) {
      checkSubscription(false);
      loadInvoices();
    } else {
      setLoading(false);
    }
  }, [user, checkSubscription, loadInvoices]);

  const handleCheckout = async (priceType: string) => {
    if (checkingOut) return;
    
    setCheckingOut(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          priceType,
          successUrl: `${window.location.origin}/mein-tiertraining?success=true`,
          cancelUrl: `${window.location.origin}/?canceled=true`,
          customerInfo: {
            name: user?.user_metadata?.full_name || user?.email?.split('@')[0]
          }
        }
      });

      if (error) throw error;
      
      window.open(data.url, '_blank');
      
      toast({
        title: t('training.toasts.subscription.checkoutRedirect.title'),
        description: data.trialIncluded 
          ? t('training.toasts.subscription.checkoutRedirect.description')
          : t('training.toasts.subscription.checkoutOpened.description')
      });
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: t('training.toasts.subscription.checkoutError.title'),
        description: t('training.toasts.subscription.checkoutError.description'),
        variant: "destructive"
      });
    } finally {
      setCheckingOut(false);
    }
  };

  const handleCustomerPortal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        body: {
          returnUrl: `${window.location.origin}/mein-tiertraining`
        }
      });

      if (error) throw error;
      
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error creating customer portal session:', error);
      toast({
        title: t('training.toasts.subscription.checkoutError.title'),
        description: t('training.toasts.subscription.checkoutError.description'),
        variant: "destructive"
      });
    }
  };

  const handleCancelSubscription = async () => {
    try {
      const { error } = await supabase.functions.invoke('cancel-subscription');
      
      if (error) throw error;
      
      toast({
        title: t('training.toasts.subscription.cancellationStarted.title'),
        description: t('training.toasts.subscription.cancellationStarted.description'),
      });
      
      // Refresh subscription status
      await checkSubscription(false);
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast({
        title: t('training.toasts.subscription.cancellationError.title'),
        description: t('training.toasts.subscription.cancellationError.description'),
        variant: "destructive"
      });
    }
  };

  const handleReactivateSubscription = async () => {
    try {
      const { error } = await supabase.functions.invoke('reactivate-subscription');
      
      if (error) throw error;
      
      toast({
        title: t('training.toasts.subscription.reactivationSuccess.title'),
        description: t('training.toasts.subscription.reactivationSuccess.description'),
      });
      
      // Refresh subscription status
      await checkSubscription(false);
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      toast({
        title: t('training.toasts.subscription.reactivationError.title'),
        description: t('training.toasts.subscription.reactivationError.description'),
        variant: "destructive"
      });
    }
  };

  return {
    subscription,
    loading,
    error,
    checkingOut,
    invoices,
    checkSubscription,
    handleCheckout,
    handleCustomerPortal,
    handleCancelSubscription,
    handleReactivateSubscription
  };
};
