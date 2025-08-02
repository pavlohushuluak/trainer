
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Euro, Calendar, FileText, CreditCard } from 'lucide-react';
import { formatCurrency } from './utils';
import { useTranslation } from 'react-i18next';
import type { PaymentStats } from './types';

interface PaymentStatsProps {
  stats: PaymentStats;
}

export const PaymentStatsCards = ({ stats }: PaymentStatsProps) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('adminPayment.paymentStats.totalRevenue')}</CardTitle>
          <Euro className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(stats.totalRevenue)}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.paidInvoices} {t('adminPayment.paymentStats.paidInvoices')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('adminPayment.paymentStats.thisMonth')}</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(stats.thisMonthRevenue)}
          </div>
          <p className="text-xs text-muted-foreground">
            {t('adminPayment.paymentStats.vsLastMonth', { amount: formatCurrency(stats.lastMonthRevenue) })}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('adminPayment.paymentStats.pending')}</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(stats.pendingAmount)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('adminPayment.paymentStats.totalInvoices')}</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalInvoices}</div>
        </CardContent>
      </Card>
    </div>
  );
};
