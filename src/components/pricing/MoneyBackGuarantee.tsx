
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
    <div className="text-center mb-3 sm:mb-4 md:mb-6 lg:mb-8 px-3 sm:px-4">
      <div className="inline-block w-full max-w-4xl bg-gradient-to-r from-green-50 dark:from-green-900/20 to-emerald-50 dark:to-emerald-900/20 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 rounded-xl sm:rounded-2xl border-2 border-green-200 dark:border-green-800 shadow-md hover:shadow-lg transition-shadow duration-300">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-2.5 lg:gap-3 mb-3 sm:mb-4">
          <Shield className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-green-600 dark:text-green-400 flex-shrink-0" />
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-green-800 dark:text-green-200 text-center">
            {t('pricing.moneyBackGuarantee.title')}
          </h3>
        </div>
        
        <div className="space-y-2 sm:space-y-2.5 lg:space-y-3 max-w-2xl mx-auto">
          <p className="text-sm sm:text-base lg:text-lg text-green-700 dark:text-green-300 font-semibold leading-relaxed px-2 sm:px-0">
            {t('pricing.moneyBackGuarantee.description')}
          </p>
          
          <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center gap-3 sm:gap-4 lg:gap-6 mt-3 sm:mt-4">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 text-green-700 dark:text-green-300">
              <CheckCircle2 className="h-4 w-4 sm:h-4.5 sm:w-4.5 lg:h-5 lg:w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium">{t('pricing.moneyBackGuarantee.features.refund')}</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 text-green-700 dark:text-green-300">
              <Clock className="h-4 w-4 sm:h-4.5 sm:w-4.5 lg:h-5 lg:w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium">{t('pricing.moneyBackGuarantee.features.noFinePrint')}</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 text-green-700 dark:text-green-300">
              <Shield className="h-4 w-4 sm:h-4.5 sm:w-4.5 lg:h-5 lg:w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium">{t('pricing.moneyBackGuarantee.features.riskFree')}</span>
            </div>
          </div>
          
          <div className="bg-white/80 dark:bg-card/80 p-2.5 sm:p-3 lg:p-4 rounded-lg mt-3 sm:mt-4">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-muted-foreground leading-relaxed">
              <strong>{t('pricing.moneyBackGuarantee.howItWorks.title')}</strong> {t('pricing.moneyBackGuarantee.howItWorks.description')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
