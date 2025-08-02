
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency, formatDate } from './utils';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { InvoiceWithProfile } from './types';

interface InvoiceListProps {
  invoices: InvoiceWithProfile[];
  isLoading?: boolean;
}

const ITEMS_PER_PAGE = 10;

const getStatusBadge = (status: string, t: any) => {
  switch (status) {
    case 'paid':
      return <Badge variant="default">{t('adminPayment.invoiceList.paid')}</Badge>;
    case 'open':
      return <Badge variant="destructive">{t('adminPayment.invoiceList.open')}</Badge>;
    case 'pending':
      return <Badge variant="secondary">{t('adminPayment.invoiceList.pending')}</Badge>;
    case 'draft':
      return <Badge variant="outline">{t('adminPayment.invoiceList.draft')}</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const InvoiceSkeleton = () => (
  <div className="flex items-center justify-between p-4 border rounded-lg">
    <div className="flex-1 space-y-2">
      <div className="flex items-center gap-4">
        <div className="space-y-1">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="text-right space-y-1">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
    <div className="flex items-center gap-2">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-16" />
    </div>
  </div>
);

export const InvoiceList = ({ invoices, isLoading = false }: InvoiceListProps) => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil((invoices?.length || 0) / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentInvoices = invoices?.slice(startIndex, endIndex) || [];

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('adminPayment.invoiceList.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <InvoiceSkeleton key={i} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t('adminPayment.invoiceList.title')} ({invoices?.length || 0})
          {totalPages > 1 && (
            <span className="text-sm font-normal text-muted-foreground ml-2">
              {t('adminPayment.invoiceList.page', { current: currentPage, total: totalPages })}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {currentInvoices?.map((invoice) => (
            <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="font-medium">
                      {invoice.invoice_number || `INV-${invoice.id.slice(0, 8)}`}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {invoice.profiles?.email || t('adminPayment.invoiceList.noEmail')}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(invoice.amount_total || 0, invoice.currency || 'EUR')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {invoice.created_at ? formatDate(invoice.created_at) : ''}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center gap-1">
                    {getStatusBadge(invoice.status || '', t)}
                    {invoice.payment_method && (
                      <Badge variant="outline" className="text-xs">
                        {invoice.payment_method}
                      </Badge>
                    )}
                  </div>
                </div>
                
                {invoice.paid_at && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('adminPayment.invoiceList.paidAt')}: {formatDate(invoice.paid_at)}
                  </p>
                )}
                
                {invoice.due_date && invoice.status !== 'paid' && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('adminPayment.invoiceList.dueDate')}: {formatDate(invoice.due_date)}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {invoice.hosted_invoice_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={invoice.hosted_invoice_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {t('adminPayment.invoiceList.view')}
                    </a>
                  </Button>
                )}
                
                {invoice.invoice_pdf && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={invoice.invoice_pdf} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" />
                      PDF
                    </a>
                  </Button>
                )}
              </div>
            </div>
          ))}
          
          {invoices?.length === 0 && !isLoading && (
            <p className="text-center text-muted-foreground py-8">
              {t('adminPayment.invoiceList.noInvoices')}
            </p>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-muted-foreground">
              {t('adminPayment.invoiceList.showing', { 
                start: startIndex + 1, 
                end: Math.min(endIndex, invoices?.length || 0), 
                total: invoices?.length || 0 
              })}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                {t('adminPayment.invoiceList.back')}
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                {t('adminPayment.invoiceList.next')}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
