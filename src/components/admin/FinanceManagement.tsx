/**
 * @fileoverview Finance Management component for admin dashboard
 * Shows all users as cards with their invoice statistics
 * Click on a user to view their detailed invoices in a modal
 */

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, RefreshCw, DollarSign, TrendingUp, FileText, Users as UsersIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCard } from './finance/UserCard';
import { UserInvoiceModal } from './finance/UserInvoiceModal';
import { useTranslation } from 'react-i18next';

interface Invoice {
  id: string;
  user_id: string;
  stripe_invoice_id: string | null;
  invoice_number: string | null;
  amount_total: number;
  currency: string;
  status: string;
  invoice_pdf: string | null;
  hosted_invoice_url: string | null;
  created_at: string;
  due_date: string | null;
  paid_at: string | null;
  profiles?: {
    email: string;
  } | null;
}

interface UserWithInvoices {
  userId: string;
  userEmail: string;
  invoices: Invoice[];
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  totalRevenue: number;
  pendingAmount: number;
  currency: string;
}

interface GlobalStats {
  totalRevenue: number;
  monthlyRevenue: number;
  pendingAmount: number;
  totalUsers: number;
  totalInvoices: number;
  averageRevenuePerUser: number;
}

export const FinanceManagement = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('revenue'); // revenue, invoices, pending
  const [selectedUser, setSelectedUser] = useState<UserWithInvoices | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch all invoices
  const { data: invoices, isLoading: invoicesLoading, error: invoicesError, refetch: refetchInvoices } = useQuery({
    queryKey: ['admin-finance-all-invoices'],
    queryFn: async () => {
      try {
        // First, fetch all invoices
        const { data: invoiceData, error: invoiceError } = await supabase
          .from('invoices')
          .select(`
            id,
            user_id,
            stripe_invoice_id,
            invoice_number,
            amount_total,
            currency,
            status,
            invoice_pdf,
            hosted_invoice_url,
            created_at,
            due_date,
            paid_at
          `)
          .order('created_at', { ascending: false })
          .limit(1000);

        if (invoiceError) throw invoiceError;

        // Then, fetch all unique user profiles
        const userIds = [...new Set((invoiceData || []).map(inv => inv.user_id))];

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, email')
          .in('id', userIds);

        if (profileError) {
          console.warn('Error fetching profiles:', profileError);
          // Continue without profiles if there's an error
        }

        // Create a map of user_id to email
        const profileMap = new Map(
          (profileData || []).map(profile => [profile.id, profile.email])
        );

        // Combine invoices with user emails
        return (invoiceData || []).map((invoice: any) => ({
          ...invoice,
          profiles: profileMap.has(invoice.user_id)
            ? { email: profileMap.get(invoice.user_id) }
            : null
        })) as Invoice[];
      } catch (error) {
        console.error('Error fetching invoices:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Group invoices by user and calculate statistics
  const usersWithInvoices = useMemo(() => {
    if (!invoices) return [];

    const userMap = new Map<string, UserWithInvoices>();

    invoices.forEach((invoice) => {
      const userId = invoice.user_id;
      const userEmail = invoice.profiles?.email || 'Unknown User';

      if (!userMap.has(userId)) {
        userMap.set(userId, {
          userId,
          userEmail,
          invoices: [],
          totalInvoices: 0,
          paidInvoices: 0,
          pendingInvoices: 0,
          totalRevenue: 0,
          pendingAmount: 0,
          currency: invoice.currency || 'EUR',
        });
      }

      const user = userMap.get(userId)!;
      user.invoices.push(invoice);
      user.totalInvoices++;

      if (invoice.status === 'paid') {
        user.paidInvoices++;
        user.totalRevenue += invoice.amount_total;
      } else if (invoice.status === 'open' || invoice.status === 'pending') {
        user.pendingInvoices++;
        user.pendingAmount += invoice.amount_total;
      }
    });

    return Array.from(userMap.values());
  }, [invoices]);

  // Calculate global statistics
  const globalStats = useMemo((): GlobalStats => {
    if (!invoices) {
      return {
        totalRevenue: 0,
        monthlyRevenue: 0,
        pendingAmount: 0,
        totalUsers: 0,
        totalInvoices: 0,
        averageRevenuePerUser: 0,
      };
    }

    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const paidInvoices = invoices.filter(inv => inv.status === 'paid');
    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.amount_total, 0);

    const monthlyRevenue = invoices
      .filter(inv =>
        inv.status === 'paid' &&
        new Date(inv.created_at) >= thisMonth
      )
      .reduce((sum, inv) => sum + inv.amount_total, 0);

    const pendingAmount = invoices
      .filter(inv => inv.status === 'open' || inv.status === 'pending')
      .reduce((sum, inv) => sum + inv.amount_total, 0);

    const totalUsers = usersWithInvoices.length;
    const averageRevenuePerUser = totalUsers > 0 ? totalRevenue / totalUsers : 0;

    return {
      totalRevenue,
      monthlyRevenue,
      pendingAmount,
      totalUsers,
      totalInvoices: invoices.length,
      averageRevenuePerUser,
    };
  }, [invoices, usersWithInvoices]);

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = usersWithInvoices;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.userEmail.toLowerCase().includes(query) ||
        user.userId.toLowerCase().includes(query)
      );
    }

    // Sort users
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'revenue':
          return b.totalRevenue - a.totalRevenue;
        case 'invoices':
          return b.totalInvoices - a.totalInvoices;
        case 'pending':
          return b.pendingAmount - a.pendingAmount;
        case 'email':
          return a.userEmail.localeCompare(b.userEmail);
        default:
          return b.totalRevenue - a.totalRevenue;
      }
    });

    return filtered;
  }, [usersWithInvoices, searchQuery, sortBy]);

  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const handleUserClick = (user: UserWithInvoices) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  if (invoicesLoading && !invoices) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">{t('adminFinance.loading')}</p>
        </div>
      </div>
    );
  }

  if (invoicesError) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              {t('adminFinance.error.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              {invoicesError instanceof Error ? invoicesError.message : t('adminFinance.error.failed')}
            </p>
            <Button onClick={() => refetchInvoices()} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              {t('adminFinance.error.retry')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with Stats Summary */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold truncate">{t('adminFinance.title')}</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {t('adminFinance.subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => refetchInvoices()} 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">{t('adminFinance.refresh')}</span>
              <span className="sm:hidden">{t('adminFinance.refresh')}</span>
            </Button>
          </div>
        </div>

        {/* Detailed Global Statistics - Below User Cards */}
        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">{t('adminFinance.globalStats.title')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="border-2 border-green-200 dark:border-green-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium">{t('adminFinance.globalStats.totalRevenue.label')}</CardTitle>
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400 break-words">
                  {formatCurrency(globalStats.totalRevenue)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('adminFinance.globalStats.totalRevenue.from', { count: globalStats.totalInvoices })}
                </p>
                <div className="mt-2 pt-2 border-t border-green-200 dark:border-green-800">
                  <p className="text-xs text-muted-foreground break-words">
                    {t('adminFinance.globalStats.totalRevenue.avgPerUser', { amount: formatCurrency(globalStats.averageRevenuePerUser) })}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-indigo-200 dark:border-indigo-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium">{t('adminFinance.globalStats.monthlyRevenue.label')}</CardTitle>
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400 break-words">
                  {formatCurrency(globalStats.monthlyRevenue)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('adminFinance.globalStats.monthlyRevenue.currentMonth')}
                </p>
                <div className="mt-2 pt-2 border-t border-indigo-200 dark:border-indigo-800">
                  <p className="text-xs text-muted-foreground">
                    {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-200 dark:border-orange-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium">{t('adminFinance.globalStats.pendingAmount.label')}</CardTitle>
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400 break-words">
                  {formatCurrency(globalStats.pendingAmount)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('adminFinance.globalStats.pendingAmount.unpaid')}
                </p>
                <div className="mt-2 pt-2 border-t border-orange-200 dark:border-orange-800">
                  <p className="text-xs text-muted-foreground">
                    {t('adminFinance.globalStats.pendingAmount.requiresAttention')}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 dark:border-blue-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium">{t('adminFinance.globalStats.totalUsers.label')}</CardTitle>
                <UsersIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {globalStats.totalUsers}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('adminFinance.globalStats.totalUsers.withInvoices')}
                </p>
                <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-muted-foreground">
                    {t('adminFinance.globalStats.totalUsers.totalInvoices', { count: globalStats.totalInvoices })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Search and Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <Input
          placeholder={t('adminFinance.search.placeholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder={t('adminFinance.sort.label')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="revenue">{t('adminFinance.sort.revenue')}</SelectItem>
            <SelectItem value="invoices">{t('adminFinance.sort.invoices')}</SelectItem>
            <SelectItem value="pending">{t('adminFinance.sort.pending')}</SelectItem>
            <SelectItem value="email">{t('adminFinance.sort.email')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* USER CARDS - SHOWN FIRST! */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-semibold">
            {t('adminFinance.userList.title', { count: filteredAndSortedUsers.length })}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {t('adminFinance.userList.clickToView')}
          </p>
        </div>

        {filteredAndSortedUsers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {filteredAndSortedUsers.map((user) => (
              <UserCard
                key={user.userId}
                userId={user.userId}
                userEmail={user.userEmail}
                totalInvoices={user.totalInvoices}
                paidInvoices={user.paidInvoices}
                pendingInvoices={user.pendingInvoices}
                totalRevenue={user.totalRevenue}
                pendingAmount={user.pendingAmount}
                currency={user.currency}
                onClick={() => handleUserClick(user)}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <UsersIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                {searchQuery ? t('adminFinance.userList.noResults') : t('adminFinance.userList.noUsers')}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* User Invoice Modal */}
      {selectedUser && (
        <UserInvoiceModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          userEmail={selectedUser.userEmail}
          userId={selectedUser.userId}
          invoices={selectedUser.invoices}
        />
      )}
    </div>
  );
};
