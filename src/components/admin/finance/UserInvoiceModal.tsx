/**
 * @fileoverview Modal component to display all invoices for a specific user
 * Shows user's invoice history with filtering and export capabilities
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, ExternalLink, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

interface Invoice {
  id: string;
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
}

interface UserInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  userId: string;
  invoices: Invoice[];
}

export const UserInvoiceModal = ({ isOpen, onClose, userEmail, userId, invoices }: UserInvoiceModalProps) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      paid: { variant: 'default', label: t('adminFinance.modal.status.paid') },
      open: { variant: 'secondary', label: t('adminFinance.modal.status.open') },
      pending: { variant: 'outline', label: t('adminFinance.modal.status.pending') },
      draft: { variant: 'outline', label: t('adminFinance.modal.status.draft') },
      void: { variant: 'destructive', label: t('adminFinance.modal.status.void') },
      uncollectible: { variant: 'destructive', label: t('adminFinance.modal.status.uncollectible') },
    };

    const statusInfo = statusMap[status] || { variant: 'outline' as const, label: status };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  // Filter invoices
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch = searchQuery.trim() === '' ||
      invoice.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.stripe_invoice_id?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    totalRevenue: invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.amount_total, 0),
    pendingAmount: invoices
      .filter(inv => inv.status === 'open' || inv.status === 'pending')
      .reduce((sum, inv) => sum + inv.amount_total, 0),
    totalInvoices: invoices.length,
    paidInvoices: invoices.filter(inv => inv.status === 'paid').length,
    pendingInvoices: invoices.filter(inv => inv.status === 'open' || inv.status === 'pending').length,
  };

  const downloadCSV = () => {
    if (filteredInvoices.length === 0) return;

    const headers = [
      t('adminFinance.modal.table.invoiceNumber'),
      t('adminFinance.modal.table.amount'),
      'Currency',
      t('adminFinance.modal.table.status'),
      t('adminFinance.modal.table.created'),
      t('adminFinance.modal.table.paidAt'),
    ];
    const rows = filteredInvoices.map(inv => [
      inv.invoice_number || 'N/A',
      (inv.amount_total / 100).toFixed(2),
      inv.currency.toUpperCase(),
      inv.status,
      format(new Date(inv.created_at), 'yyyy-MM-dd HH:mm'),
      inv.paid_at ? format(new Date(inv.paid_at), 'yyyy-MM-dd HH:mm') : 'N/A',
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `invoices_${userEmail}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] w-[95vw] sm:w-full overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-lg sm:text-xl md:text-2xl pr-8 break-words">
            {t('adminFinance.modal.title', { email: userEmail })}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {t('adminFinance.modal.subtitle')}
          </DialogDescription>
        </DialogHeader>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 my-3 sm:my-4">
          <Card>
            <CardHeader className="pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                {t('adminFinance.modal.stats.totalPaid')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="text-lg sm:text-xl md:text-2xl font-bold break-words">{formatCurrency(stats.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground truncate">
                {t('adminFinance.modal.stats.paidCount', { count: stats.paidInvoices })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                {t('adminFinance.modal.stats.pending')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="text-lg sm:text-xl md:text-2xl font-bold break-words">{formatCurrency(stats.pendingAmount)}</div>
              <p className="text-xs text-muted-foreground truncate">
                {t('adminFinance.modal.stats.pendingCount', { count: stats.pendingInvoices })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                {t('adminFinance.modal.stats.totalInvoices')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="text-lg sm:text-xl md:text-2xl font-bold">{stats.totalInvoices}</div>
              <p className="text-xs text-muted-foreground truncate">
                {t('adminFinance.modal.stats.allTime')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                {t('adminFinance.modal.stats.average')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="text-lg sm:text-xl md:text-2xl font-bold break-words">
                {stats.paidInvoices > 0 
                  ? formatCurrency(stats.totalRevenue / stats.paidInvoices)
                  : formatCurrency(0)}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {t('adminFinance.modal.stats.perInvoice')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center my-3 sm:my-4">
          <Input
            placeholder={t('adminFinance.modal.search.placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 text-sm"
          />
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder={t('adminFinance.modal.filter.label')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('adminFinance.modal.filter.all')}</SelectItem>
              <SelectItem value="paid">{t('adminFinance.modal.filter.paid')}</SelectItem>
              <SelectItem value="open">{t('adminFinance.modal.filter.open')}</SelectItem>
              <SelectItem value="pending">{t('adminFinance.modal.filter.pending')}</SelectItem>
              <SelectItem value="draft">{t('adminFinance.modal.filter.draft')}</SelectItem>
              <SelectItem value="void">{t('adminFinance.modal.filter.void')}</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            onClick={downloadCSV} 
            disabled={filteredInvoices.length === 0} 
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
          >
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">{t('adminFinance.modal.exportCsv')}</span>
            <span className="sm:hidden">CSV</span>
          </Button>
        </div>

        {/* Invoices Table - Mobile Responsive */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm whitespace-nowrap">
                    {t('adminFinance.modal.table.invoiceNumber')}
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm whitespace-nowrap">
                    {t('adminFinance.modal.table.amount')}
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm whitespace-nowrap">
                    {t('adminFinance.modal.table.status')}
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">
                    {t('adminFinance.modal.table.created')}
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden lg:table-cell">
                    {t('adminFinance.modal.table.paidAt')}
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm text-right whitespace-nowrap">
                    {t('adminFinance.modal.table.actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium text-xs sm:text-sm whitespace-nowrap">
                        <div className="max-w-[120px] sm:max-w-none truncate" title={invoice.invoice_number || 'N/A'}>
                          {invoice.invoice_number || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-xs sm:text-sm whitespace-nowrap">
                        {formatCurrency(invoice.amount_total, invoice.currency)}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell className="text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">
                        <div className="hidden lg:block">
                          {format(new Date(invoice.created_at), 'MMM dd, yyyy HH:mm')}
                        </div>
                        <div className="lg:hidden">
                          {format(new Date(invoice.created_at), 'MMM dd, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm whitespace-nowrap hidden lg:table-cell">
                        {invoice.paid_at 
                          ? format(new Date(invoice.paid_at), 'MMM dd, yyyy HH:mm')
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 sm:gap-2">
                          {invoice.hosted_invoice_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="h-8 px-2 sm:px-3"
                            >
                              <a href={invoice.hosted_invoice_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                                <span className="hidden sm:inline">{t('adminFinance.modal.table.view')}</span>
                              </a>
                            </Button>
                          )}
                          {invoice.invoice_pdf && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="h-8 px-2 sm:px-3"
                            >
                              <a href={invoice.invoice_pdf} target="_blank" rel="noopener noreferrer">
                                <FileText className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                                <span className="hidden sm:inline">{t('adminFinance.modal.table.pdf')}</span>
                              </a>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8 text-xs sm:text-sm">
                      {t('adminFinance.modal.table.noInvoices')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="flex justify-end mt-3 sm:mt-4">
          <Button onClick={onClose} variant="outline" size="sm" className="w-full sm:w-auto">
            {t('adminFinance.modal.close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
