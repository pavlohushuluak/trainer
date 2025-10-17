
import { useSubscriptionManager } from "./subscription/hooks/useSubscriptionManager";
import { SubscriptionManagerHeader } from "./subscription/SubscriptionManagerHeader";
import { SubscriptionLoadingState } from "./subscription/SubscriptionLoadingState";
import { SubscriptionErrorState } from "./subscription/SubscriptionErrorState";
import { SubscriptionTabs } from "./subscription/SubscriptionTabs";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";

const SubscriptionManager = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { subscription: subscriptionStatus, isLoading: subscriptionLoading } = useSubscriptionStatus();
  const {
    invoices,
    loading: managerLoading,
    checkingOut,
    error,
    checkSubscription,
    handleCheckout,
    handleCustomerPortal
  } = useSubscriptionManager();

  // Use subscription data from useSubscriptionStatus
  const subscription = subscriptionStatus;
  const loading = subscriptionLoading || managerLoading;

  // Only show loading if we have no subscription data at all
  if (loading && !subscription) {
    return (
      <SubscriptionLoadingState 
        onRetry={checkSubscription}
        showRetry={true}
        loadingMessage={t('subscription.loadingState.loadingData')}
      />
    );
  }

  if (error) {
    return (
      <SubscriptionErrorState 
        error={error} 
        onRetry={checkSubscription} 
      />
    );
  }

  return (
    <div>
      
      {/* Loading info */}
      {loading && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            {t('subscriptionManager.loadingDetails')}
          </p>
        </div>
      )}
      
      <SubscriptionManagerHeader onRefresh={checkSubscription} />
      
      <SubscriptionTabs
        subscription={subscription}
        invoices={invoices}
        checkingOut={checkingOut}
        onCheckout={handleCheckout}
        onManageSubscription={handleCustomerPortal}
      />
    </div>
  );
};

export default SubscriptionManager;
