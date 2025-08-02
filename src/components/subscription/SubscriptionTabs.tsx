
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubscriptionOverview } from "./SubscriptionOverview";
import { SubscriptionPlans } from "./SubscriptionPlans";
import { InvoicesList } from "./InvoicesList";
import type { SubscriptionStatus, Invoice } from "./types";
import { useTranslation } from "react-i18next";

interface SubscriptionTabsProps {
  subscription: SubscriptionStatus;
  invoices: Invoice[];
  checkingOut: boolean;
  onCheckout: (priceType: string) => void;
  onManageSubscription: () => void;
}

export const SubscriptionTabs = ({
  subscription,
  invoices,
  checkingOut,
  onCheckout,
  onManageSubscription
}: SubscriptionTabsProps) => {
  const { t } = useTranslation();
  // Determine default tab based on subscription status
  const defaultTab = subscription.subscribed ? "overview" : "plans";

  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview">{t('training.subscriptionTabs.overview')}</TabsTrigger>
        <TabsTrigger value="plans" data-value="plans">{t('training.subscriptionTabs.plans')}</TabsTrigger>
        <TabsTrigger value="invoices">{t('training.subscriptionTabs.invoices')}</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <SubscriptionOverview 
          subscription={subscription}
          onManageSubscription={onManageSubscription}
        />
      </TabsContent>

      <TabsContent value="plans" className="space-y-4">
        <SubscriptionPlans
          subscription={subscription}
          checkingOut={checkingOut}
          onCheckout={onCheckout}
        />
      </TabsContent>

      <TabsContent value="invoices" className="space-y-4">
        <InvoicesList invoices={invoices} />
      </TabsContent>
    </Tabs>
  );
};
