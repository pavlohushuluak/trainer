
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import SubscriptionManager from '@/components/SubscriptionManager';
import { MainLayout } from '@/components/layout/MainLayout';
import { BreadcrumbNavigation } from '@/components/subscription/BreadcrumbNavigation';
import { useTranslations } from '@/hooks/useTranslations';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslations();

  useEffect(() => {
    // Only redirect if we're sure the user is not authenticated
    if (!loading && !user) {
      console.log('Dashboard: User not authenticated, redirecting to login');
      navigate('/login');
      toast({
        title: t('dashboard.notAuthenticated'),
        description: t('dashboard.loginRequired'),
      });
    }
  }, [user, loading, navigate, toast, t]);

  useEffect(() => {
    // Handle success/cancel URL parameters from Stripe checkout - only once
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const canceled = urlParams.get('canceled');
    
    if (success === 'true') {
      // Clear checkout flags on successful payment
      sessionStorage.removeItem('pendingCheckout');
      sessionStorage.removeItem('pendingCheckoutPriceType');
      
      toast({
        title: t('dashboard.paymentSuccess'),
        description: t('dashboard.subscriptionActivated'),
      });
      // Clean up URL parameters
      window.history.replaceState({}, document.title, '/mein-tiertraining');
    } else if (canceled === 'true') {
      // Clear checkout flags on canceled payment
      sessionStorage.removeItem('pendingCheckout');
      sessionStorage.removeItem('pendingCheckoutPriceType');
      
      toast({
        title: t('dashboard.paymentCanceled'),
        description: t('dashboard.checkoutCanceled'),
        variant: "destructive"
      });
      // Clean up URL parameters
      window.history.replaceState({}, document.title, '/');
    }
  }, [toast, t]);

  // Show loading only when absolutely necessary
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is not logged in, return null (useEffect handles redirect)
  if (!user) {
    return null;
  }

  return (
    <MainLayout showFooter={false} showSupportButton={false}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <BreadcrumbNavigation />
          </div>
          <SubscriptionManager />
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
