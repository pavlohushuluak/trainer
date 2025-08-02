
import { useSubscriptionManager } from "./subscription/hooks/useSubscriptionManager";
import { SubscriptionManagerHeader } from "./subscription/SubscriptionManagerHeader";
import { SubscriptionLoadingState } from "./subscription/SubscriptionLoadingState";
import { SubscriptionErrorState } from "./subscription/SubscriptionErrorState";
import { SubscriptionTabs } from "./subscription/SubscriptionTabs";
import { UpgradeCard } from "./subscription/UpgradeCard";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";

const SubscriptionManager = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const {
    subscription,
    invoices,
    loading,
    checkingOut,
    error,
    checkSubscription,
    handleCheckout,
    handleCustomerPortal
  } = useSubscriptionManager();

  // Only show loading if we have no subscription data at all
  if (loading && !subscription) {
    return <SubscriptionLoadingState />;
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
    <div className="space-y-6">
      {/* Prominent Upgrade Card for Non-Subscribers */}
      {!subscription?.subscribed && !loading && (
        <UpgradeCard />
      )}


      {/* Immediate Status Display - Shows even during loading */}
      {(subscription?.subscribed || subscription?.subscription_status === 'active') && (
        <div className="p-4 bg-gradient-to-r from-green-50 dark:from-green-900/20 to-emerald-50 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              {t('subscriptionManager.premiumActive')}
            </p>
          </div>
          {subscription.subscription_tier && (
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
              {subscription.subscription_tier}{subscription.subscription_end ? ` ${t('subscriptionManager.until')} ${new Date(subscription.subscription_end).toLocaleDateString('de-DE')}` : ''}
            </p>
          )}
        </div>
      )}
      
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
