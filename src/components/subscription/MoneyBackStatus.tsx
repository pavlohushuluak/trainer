
import { useState } from "react";
import { Shield, Calendar, AlertCircle, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { differenceInDays, format } from "date-fns";
import { de, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";

interface MoneyBackStatusProps {
  subscriptionStart?: string;
  isTrialing?: boolean;
}

export const MoneyBackStatus = ({ subscriptionStart, isTrialing }: MoneyBackStatusProps) => {
  const { t, i18n } = useTranslation();
  
  // Don't show for trial subscriptions
  if (!subscriptionStart || isTrialing) return null;

  const startDate = new Date(subscriptionStart);
  const today = new Date();
  const daysSinceStart = differenceInDays(today, startDate);
  const daysRemaining = Math.max(0, 14 - daysSinceStart);
  const isWithinMoneyBackPeriod = daysRemaining > 0;

  // Hide the money-back guarantee card if outside the 14-day period
  if (!isWithinMoneyBackPeriod) return null;

  const endDate = new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000);
  const [isOpen, setIsOpen] = useState(true);
  
  // Get locale for date formatting
  const locale = i18n.language === 'de' ? de : enUS;

  return (
    <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/20 my-4 sm:my-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3 px-4 sm:px-6">
          <CollapsibleTrigger className="flex items-start sm:items-center justify-between w-full text-left hover:bg-green-100/50 dark:hover:bg-green-900/30 -m-2 p-2 rounded transition-colors">
            <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-green-800 dark:text-green-200 text-base sm:text-lg">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 flex-shrink-0" />
                <span>{t('subscription.moneyBackGuarantee.active')}</span>
              </div>
              <Badge variant="outline" className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700 text-xs sm:text-sm whitespace-nowrap">
                {daysRemaining} {daysRemaining === 1 ? t('subscription.moneyBackGuarantee.day') : t('subscription.moneyBackGuarantee.days')} {t('subscription.moneyBackGuarantee.remaining')}
              </Badge>
            </CardTitle>
            <ChevronDown className={`h-4 w-4 text-green-600 dark:text-green-400 transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="space-y-3 sm:space-y-4 pt-0 px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-green-800 dark:text-green-200 font-medium leading-relaxed">
                  {t('subscription.moneyBackGuarantee.youHaveRemaining', { 
                    days: daysRemaining,
                    dayText: daysRemaining === 1 ? t('subscription.moneyBackGuarantee.day') : t('subscription.moneyBackGuarantee.days')
                  })}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  {t('subscription.moneyBackGuarantee.guaranteeEnd')}: {format(endDate, "dd. MMMM yyyy", { locale })}
                </p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-card p-3 sm:p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-start gap-2 sm:gap-3">
                <AlertCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs sm:text-sm text-green-700 dark:text-green-300 min-w-0">
                  <p className="font-medium mb-1">{t('subscription.moneyBackGuarantee.completeProtection')}</p>
                  <p className="leading-relaxed">
                    {t('subscription.moneyBackGuarantee.description')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
