/**
 * @fileoverview User card component for Finance page
 * Displays user information and invoice statistics
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, FileText, TrendingUp, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface UserCardProps {
  userId: string;
  userEmail: string;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  totalRevenue: number;
  pendingAmount: number;
  currency: string;
  onClick: () => void;
}

export const UserCard = ({
  userId,
  userEmail,
  totalInvoices,
  paidInvoices,
  pendingInvoices,
  totalRevenue,
  pendingAmount,
  currency,
  onClick,
}: UserCardProps) => {
  const { t } = useTranslation();
  
  const formatCurrency = (amount: number, curr: string = 'EUR') => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: curr.toUpperCase(),
    }).format(amount / 100);
  };

  const hasPending = pendingInvoices > 0;
  const hasRevenue = totalRevenue > 0;

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.01] sm:hover:scale-[1.02] border-2 active:scale-[0.98]",
        hasPending ? "border-orange-200 dark:border-orange-800" : "border-border"
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3 p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm sm:text-base truncate" title={userEmail}>
                {userEmail}
              </CardTitle>
              <p className="text-xs text-muted-foreground truncate">
                {t('adminFinance.userCard.userId')}: {userId.slice(0, 8)}...
              </p>
            </div>
          </div>
          {hasPending && (
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-4">
        {/* Revenue Section */}
        <div className="space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0">
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium truncate">{t('adminFinance.userCard.totalRevenue')}</span>
            </div>
            <span className={cn(
              "text-base sm:text-lg font-bold flex-shrink-0",
              hasRevenue ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
            )}>
              {formatCurrency(totalRevenue, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground gap-2">
            <span className="truncate">{t('adminFinance.userCard.paidInvoices', { count: paidInvoices })}</span>
            <span className="flex-shrink-0">
              {t('adminFinance.userCard.average')}: {paidInvoices > 0 ? formatCurrency(totalRevenue / paidInvoices, currency) : formatCurrency(0, currency)}
            </span>
          </div>
        </div>

        {/* Pending Section */}
        {hasPending && (
          <div className="space-y-1.5 sm:space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0">
                <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium truncate">{t('adminFinance.userCard.pendingAmount')}</span>
              </div>
              <span className="text-base sm:text-lg font-bold text-orange-600 dark:text-orange-400 flex-shrink-0">
                {formatCurrency(pendingAmount, currency)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="truncate">{t('adminFinance.userCard.pending', { count: pendingInvoices })}</span>
            </div>
          </div>
        )}

        {/* Invoices Count */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0">
            <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium truncate">{t('adminFinance.userCard.totalInvoices')}</span>
          </div>
          <Badge variant="secondary" className="text-xs sm:text-sm flex-shrink-0">
            {totalInvoices}
          </Badge>
        </div>

        {/* Status Breakdown */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-2">
          {paidInvoices > 0 && (
            <Badge variant="default" className="text-xs">
              {t('adminFinance.userCard.paid', { count: paidInvoices })}
            </Badge>
          )}
          {pendingInvoices > 0 && (
            <Badge variant="outline" className="text-xs border-orange-300 text-orange-700 dark:text-orange-400">
              {t('adminFinance.userCard.pendingBadge', { count: pendingInvoices })}
            </Badge>
          )}
          {totalInvoices === 0 && (
            <Badge variant="outline" className="text-xs">
              {t('adminFinance.userCard.noInvoices')}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

