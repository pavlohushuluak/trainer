
import { Shield, CheckCircle2, Clock } from "lucide-react";
import { hasMoneyBackGuarantee } from "./planData";
import { useTranslations } from "@/hooks/useTranslations";

interface MoneyBackGuaranteeProps {
  currentPlans?: { id: string }[];
}

export const MoneyBackGuarantee = ({ currentPlans }: MoneyBackGuaranteeProps) => {
  const { t } = useTranslations();
  // Check if any of the current plans has money-back guarantee
  const hasGuarantee = currentPlans?.some(plan => hasMoneyBackGuarantee(plan.id)) ?? true;
  
  // Don't render if no plans have guarantee
  if (!hasGuarantee) {
    return null;
  }
  return (
    <div className="text-center mb-12">
      <div className="inline-block bg-gradient-to-r from-green-50 dark:from-green-900/20 to-emerald-50 dark:to-emerald-900/20 px-8 py-6 rounded-2xl border-2 border-green-200 dark:border-green-800 shadow-lg">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Shield className="h-8 w-8 text-green-600 dark:text-green-400" />
          <h3 className="text-2xl font-bold text-green-800 dark:text-green-200">
            {t('pricing.moneyBackGuarantee.title')}
          </h3>
        </div>
        
        <div className="space-y-3 max-w-2xl">
          <p className="text-lg text-green-700 dark:text-green-300 font-semibold">
            {t('pricing.moneyBackGuarantee.description')}
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 mt-4">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium">{t('pricing.moneyBackGuarantee.features.refund')}</span>
            </div>
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium">{t('pricing.moneyBackGuarantee.features.noFinePrint')}</span>
            </div>
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium">{t('pricing.moneyBackGuarantee.features.riskFree')}</span>
            </div>
          </div>
          
          <div className="bg-white/80 dark:bg-card/80 p-3 rounded-lg mt-4">
            <p className="text-sm text-gray-600 dark:text-muted-foreground">
              <strong>{t('pricing.moneyBackGuarantee.howItWorks.title')}</strong> {t('pricing.moneyBackGuarantee.howItWorks.description')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
