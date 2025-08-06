
import { useState } from "react";
import { PricingHeader } from "@/components/pricing/PricingHeader";
import { PackageContent } from "@/components/pricing/PackageContent";
import { MoneyBackGuarantee } from "@/components/pricing/MoneyBackGuarantee";
import { PricingToggle } from "@/components/pricing/PricingToggle";
import { PricingCardsOptimized } from "@/components/pricing/PricingCardsOptimized";
import { PaymentMethods } from "@/components/pricing/PaymentMethods";
import { PricingFooter } from "@/components/pricing/PricingFooter";
import { getMonthlyPlans, getSixMonthPlans } from "@/components/pricing/planData";
import { useTranslations } from "@/hooks/useTranslations";

export const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);
  const { t } = useTranslations();
  const currentPlans = isYearly ? getSixMonthPlans(t) : getMonthlyPlans(t);

  return (
    <section id="pricing" className="py-10 bg-secondary/30">
      <div className="container mx-auto px-4">
        <PricingHeader />
        <PackageContent />
        <MoneyBackGuarantee currentPlans={currentPlans} />
        <PricingToggle isYearly={isYearly} onToggle={setIsYearly} />
        <PricingCardsOptimized isYearly={isYearly} />
        <PaymentMethods />
        <PricingFooter />
      </div>
    </section>
  );
};
