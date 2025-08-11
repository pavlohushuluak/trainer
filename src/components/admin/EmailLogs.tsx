
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Mail, Search, Filter, Download, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useTranslations } from '@/hooks/useTranslations';

interface EmailLog {
  id: string;
  type: string;
  title: string;
  message: string;
  user_id: string | null;
  status: string;
  created_at: string;
  recipient_email?: string;
  error_details?: string;
}

export const EmailLogs = () => {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<EmailLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const { toast } = useToast();
  const { t, currentLanguage } = useTranslations();

  const logsPerPage = 50;

  useEffect(() => {
    loadEmailLogs();
  }, [currentPage]);

  useEffect(() => {
    filterLogs();
  }, [logs, searchQuery, statusFilter, typeFilter]);

  const loadEmailLogs = async () => {
    try {
      setIsLoading(true);
      
      // Get email-related system notifications
      const { data, error, count } = await supabase
        .from('system_notifications')
        .select('*', { count: 'exact' })
        .in('type', [
          'welcome_email',
          'checkout_confirmation', 
          'cancellation_email',
          'support_notification',
          'payment_notification',
          'email_config_change'
        ])
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * logsPerPage, currentPage * logsPerPage - 1);

      if (error) throw error;

      // Enhance logs with extracted email info
      const enhancedLogs = data?.map(log => ({
        ...log,
        recipient_email: extractEmailFromMessage(log.message),
        error_details: log.status === 'failed' ? log.message : undefined
      })) || [];

      setLogs(enhancedLogs);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error loading email logs:', error);
      toast({
        title: t('admin.emailLogs.toasts.loadError.title'),
        description: t('admin.emailLogs.toasts.loadError.description'),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const extractEmailFromMessage = (message: string): string => {
    const emailMatch = message.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    return emailMatch ? emailMatch[1] : '';
  };

  const filterLogs = () => {
    let filtered = logs;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(log => 
        log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.recipient_email && log.recipient_email.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(log => log.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(log => log.type === typeFilter);
    }

    setFilteredLogs(filtered);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="default" className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-xs">{t('admin.emailLogs.status.sent')}</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="text-xs">{t('admin.emailLogs.status.failed')}</Badge>;
      case 'processed':
        return <Badge variant="secondary" className="text-xs">{t('admin.emailLogs.status.processed')}</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const typeLabels: Record<string, string> = {
      'welcome_email': t('admin.emailLogs.emailTypes.welcome_email'),
      'checkout_confirmation': t('admin.emailLogs.emailTypes.checkout_confirmation'),
      'cancellation_email': t('admin.emailLogs.emailTypes.cancellation_email'),
      'support_notification': t('admin.emailLogs.emailTypes.support_notification'),
      'payment_notification': t('admin.emailLogs.emailTypes.payment_notification'),
      'email_config_change': t('admin.emailLogs.emailTypes.email_config_change')
    };
    
    return (
      <Badge variant="outline" className="text-xs">
        {typeLabels[type] || type}
      </Badge>
    );
  };

  const exportLogs = () => {
    const csvContent = [
      [t('admin.emailLogs.table.date'), t('admin.emailLogs.table.type'), t('admin.emailLogs.table.recipient'), t('admin.emailLogs.table.subject'), t('admin.emailLogs.table.status'), t('admin.emailLogs.table.details')].join(','),
      ...filteredLogs.map(log => [
        format(new Date(log.created_at), 'dd.MM.yyyy HH:mm', { locale: currentLanguage === 'de' ? de : undefined }),
        log.type,
        log.recipient_email || '',
        `"${log.title.replace(/"/g, '""')}"`,
        log.status,
        `"${log.message.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `email-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const refreshLogs = () => {
    setCurrentPage(1);
    loadEmailLogs();
  };

  const totalPages = Math.ceil(totalCount / logsPerPage);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2 text-foreground">{t('admin.emailLogs.loading')}</span>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Mail className="h-5 w-5" />
          {t('admin.emailLogs.title')}
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
          {t('admin.emailLogs.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="text-center p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{totalCount}</div>
            <div className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">{t('admin.emailLogs.statistics.total')}</div>
          </div>
          <div className="text-center p-2 sm:p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">
              {logs.filter(l => l.status === 'sent').length}
            </div>
            <div className="text-xs sm:text-sm text-green-700 dark:text-green-300">{t('admin.emailLogs.statistics.sent')}</div>
          </div>
          <div className="text-center p-2 sm:p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <div className="text-lg sm:text-2xl font-bold text-red-600 dark:text-red-400">
              {logs.filter(l => l.status === 'failed').length}
            </div>
            <div className="text-xs sm:text-sm text-red-700 dark:text-red-300">{t('admin.emailLogs.statistics.failed')}</div>
          </div>
          <div className="text-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-lg sm:text-2xl font-bold text-gray-600 dark:text-gray-300">
              {logs.filter(l => l.status === 'processed').length}
            </div>
            <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-400">{t('admin.emailLogs.statistics.processed')}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-start sm:items-center">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('admin.emailLogs.filters.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder={t('admin.emailLogs.filters.status')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('admin.emailLogs.filters.allStatuses')}</SelectItem>
              <SelectItem value="sent">{t('admin.emailLogs.statistics.sent')}</SelectItem>
              <SelectItem value="failed">{t('admin.emailLogs.statistics.failed')}</SelectItem>
              <SelectItem value="processed">{t('admin.emailLogs.statistics.processed')}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder={t('admin.emailLogs.filters.emailType')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('admin.emailLogs.filters.allTypes')}</SelectItem>
              <SelectItem value="welcome_email">{t('admin.emailLogs.emailTypes.welcome_email')}</SelectItem>
              <SelectItem value="checkout_confirmation">{t('admin.emailLogs.emailTypes.checkout_confirmation')}</SelectItem>
              <SelectItem value="cancellation_email">{t('admin.emailLogs.emailTypes.cancellation_email')}</SelectItem>
              <SelectItem value="support_notification">{t('admin.emailLogs.emailTypes.support_notification')}</SelectItem>
              <SelectItem value="payment_notification">{t('admin.emailLogs.emailTypes.payment_notification')}</SelectItem>
              <SelectItem value="email_config_change">{t('admin.emailLogs.emailTypes.email_config_change')}</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2 w-full sm:w-auto">
            <Button onClick={refreshLogs} variant="outline" size="sm" className="flex-1 sm:flex-none">
              {t('admin.emailLogs.filters.refresh')}
            </Button>

            <Button onClick={exportLogs} variant="outline" size="sm" className="flex-1 sm:flex-none">
              <Download className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">{t('admin.emailLogs.filters.export')}</span>
              <span className="sm:hidden">{t('admin.emailLogs.filters.exportShort')}</span>
            </Button>
          </div>
        </div>

        {/* Results count */}
        <div className="text-xs sm:text-sm text-muted-foreground">
          {filteredLogs.length} {t('admin.emailLogs.results.of')} {totalCount} {t('admin.emailLogs.results.emails')}
          {searchQuery && ` (${t('admin.emailLogs.results.filteredBy')} "${searchQuery}")`}
        </div>

        {/* Email logs table */}
        <div className="border rounded-lg border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs sm:text-sm">{t('admin.emailLogs.table.date')}</TableHead>
                <TableHead className="text-xs sm:text-sm">{t('admin.emailLogs.table.type')}</TableHead>
                <TableHead className="text-xs sm:text-sm hidden sm:table-cell">{t('admin.emailLogs.table.recipient')}</TableHead>
                <TableHead className="text-xs sm:text-sm">{t('admin.emailLogs.table.subject')}</TableHead>
                <TableHead className="text-xs sm:text-sm">{t('admin.emailLogs.table.status')}</TableHead>
                <TableHead className="text-xs sm:text-sm hidden lg:table-cell">{t('admin.emailLogs.table.details')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                    {t('admin.emailLogs.table.noLogsFound')}
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium text-xs sm:text-sm">
                      {format(new Date(log.created_at), 'dd.MM.yyyy HH:mm', { locale: currentLanguage === 'de' ? de : undefined })}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">{getTypeBadge(log.type)}</TableCell>
                    <TableCell className="max-w-32 sm:max-w-48 truncate text-xs sm:text-sm hidden sm:table-cell">
                      {log.recipient_email || '-'}
                    </TableCell>
                    <TableCell className="max-w-32 sm:max-w-64 truncate text-xs sm:text-sm">
                      {log.title}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">{getStatusBadge(log.status)}</TableCell>
                    <TableCell className="text-xs sm:text-sm hidden lg:table-cell">
                      <div className="max-w-48 sm:max-w-96 truncate text-muted-foreground">
                        {log.status === 'failed' && log.error_details ? (
                          <span className="text-red-600 dark:text-red-400">{log.error_details}</span>
                        ) : (
                          log.message
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs sm:text-sm text-muted-foreground">
              {t('admin.emailLogs.pagination.page')} {currentPage} {t('admin.emailLogs.pagination.of')} {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="text-xs sm:text-sm"
              >
                {t('admin.emailLogs.pagination.previous')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="text-xs sm:text-sm"
              >
                {t('admin.emailLogs.pagination.next')}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
