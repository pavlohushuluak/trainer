import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Download, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PaymentStatsCards } from './payment/PaymentStats';
import { PaymentFilters } from './payment/PaymentFilters';
import { InvoiceList } from './payment/InvoiceList';
import { downloadCSV } from './payment/utils';
import type { InvoiceWithProfile, PaymentStats } from './payment/types';
import { useTranslation } from 'react-i18next';

export const PaymentManagement = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('30');

  const { data: invoices, isLoading: invoicesLoading, error: invoicesError, refetch: refetchInvoices } = useQuery({
    queryKey: ['admin-invoices', searchQuery, statusFilter, dateFilter],
    queryFn: async () => {
      
      try {
        let query = supabase
          .from('invoices')
          .select(`
            id,
            invoice_number,
            amount_total,
            currency,
            status,
            created_at,
            due_date,
            paid_at,
            payment_method,
            hosted_invoice_url,
            invoice_pdf,
            stripe_invoice_id,
            user_id,
            profiles:user_id(email)
          `);

        // Apply date filter at database level
        if (dateFilter !== 'all') {
          const daysAgo = new Date();
          daysAgo.setDate(daysAgo.getDate() - parseInt(dateFilter));
          query = query.gte('created_at', daysAgo.toISOString());
        }

        // Apply status filter at database level
        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }

        const { data, error } = await query
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) {
          console.error('Invoices query error:', error);
          throw error;
        }


        // Process the data to match expected structure
        const processedData = (data || []).map((invoice: any) => ({
          ...invoice,
          profiles: invoice.profiles ? { email: invoice.profiles.email } : null
        })) as InvoiceWithProfile[];

        // Apply search filter on processed data if needed
        let filteredData = processedData;
        if (searchQuery.trim()) {
          filteredData = processedData.filter((invoice) => 
            invoice.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            invoice.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        return filteredData;

      } catch (error) {
        console.error('Error in invoices query:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: 1000,
  });

  const { data: paymentStats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useQuery({
    queryKey: ['admin-payment-stats'],
    queryFn: async (): Promise<PaymentStats | null> => {
      
      try {
        // Get basic invoice stats with a simpler query
        const { data: allInvoices, error } = await supabase
          .from('invoices')
          .select('amount_total, status, created_at')
          .order('created_at', { ascending: false })
          .limit(1000); // Reasonable limit for stats

        if (error) {
          console.error('Payment stats query error:', error);
          throw error;
        }

        const today = new Date();
        const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

        const totalRevenue = allInvoices
          .filter(inv => inv.status === 'paid')
          .reduce((sum, inv) => sum + (inv.amount_total || 0), 0);

        const thisMonthRevenue = allInvoices
          .filter(inv => 
            inv.status === 'paid' && 
            new Date(inv.created_at) >= thisMonth
          )
          .reduce((sum, inv) => sum + (inv.amount_total || 0), 0);

        const lastMonthRevenue = allInvoices
          .filter(inv => 
            inv.status === 'paid' && 
            new Date(inv.created_at) >= lastMonth && 
            new Date(inv.created_at) < thisMonth
          )
          .reduce((sum, inv) => sum + (inv.amount_total || 0), 0);

        const pendingAmount = allInvoices
          .filter(inv => inv.status === 'open' || inv.status === 'pending')
          .reduce((sum, inv) => sum + (inv.amount_total || 0), 0);

        const stats = {
          totalRevenue,
          thisMonthRevenue,
          lastMonthRevenue,
          pendingAmount,
          totalInvoices: allInvoices.length,
          paidInvoices: allInvoices.filter(inv => inv.status === 'paid').length
        };

        return stats;

      } catch (error) {
        console.error('Error in payment stats query:', error);
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes cache for stats
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: 1000,
  });

  const handleRefresh = () => {
    refetchInvoices();
    refetchStats();
  };

  // Show loading state
  if (invoicesLoading && !invoices) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">{t('adminPayments.loading')}</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (invoicesError) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              {t('adminPayments.error.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              {invoicesError instanceof Error ? invoicesError.message : t('adminPayments.error.message')}
            </p>
            <div className="flex gap-2">
              <Button onClick={handleRefresh} variant="outline" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                {t('adminPayments.error.retry')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('adminPayments.title')}</h1>
          <p className="text-muted-foreground">
            {t('adminPayments.description')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleRefresh} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            {t('adminPayments.header.refresh')}
          </Button>
          <Button onClick={() => downloadCSV(invoices || [], t)} disabled={!invoices?.length}>
            <Download className="h-4 w-4 mr-2" />
            {t('adminPayments.header.csvExport')}
          </Button>
        </div>
      </div>

      {/* Payment Stats */}
      {paymentStats && <PaymentStatsCards stats={paymentStats} />}
      
      {statsLoading && !paymentStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      )}

      {statsError && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground text-center">
              {t('adminPayments.error.statsError')}: {statsError instanceof Error ? statsError.message : t('adminPayments.error.unknownError')}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <PaymentFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        dateFilter={dateFilter}
        onDateChange={setDateFilter}
      />

      {/* Invoice List */}
      <InvoiceList invoices={invoices || []} isLoading={invoicesLoading} />
    </div>
  );
};
