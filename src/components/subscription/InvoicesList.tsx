
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Euro } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Invoice {
  id: string;
  invoice_number: string;
  amount_total: number;
  currency: string;
  status: string;
  invoice_pdf?: string;
  hosted_invoice_url?: string;
  created_at: string;
  paid_at?: string;
}

interface InvoicesListProps {
  invoices: Invoice[];
}

export const InvoicesList = ({ invoices }: InvoicesListProps) => {
  const { t, i18n } = useTranslation();
  
  const formatPrice = (amount: number, currency: string) => {
    const locale = i18n.language === 'de' ? 'de-DE' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100);
  };

  return (
    <Card>
      <CardHeader className="px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-6">
        <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-base sm:text-lg lg:text-xl">
          <FileText className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
          <span className="truncate">{t('subscription.invoices')}</span>
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm mt-1.5 sm:mt-2">
          {t('subscription.invoicesDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4 lg:px-6 lg:pb-6">
        {invoices.length === 0 ? (
          <div className="text-center py-6 sm:py-8 lg:py-10 text-muted-foreground text-xs sm:text-sm">
            <FileText className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-3 opacity-50" />
            <p>{t('subscription.noInvoices')}</p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {invoices.map((invoice) => (
              <div 
                key={invoice.id} 
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 p-2.5 sm:p-3 lg:p-4 border border-border rounded-lg bg-card hover:bg-accent/5 transition-colors"
              >
                {/* Left Section - Invoice Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5">
                    <span className="font-medium text-xs sm:text-sm truncate">
                      {invoice.invoice_number || `${t('subscription.invoice')} ${invoice.id.slice(-8)}`}
                    </span>
                    <Badge 
                      variant={invoice.status === 'paid' ? 'default' : 'secondary'}
                      className="text-[10px] sm:text-xs px-1.5 py-0 sm:px-2 sm:py-0.5 flex-shrink-0"
                    >
                      {invoice.status === 'paid' ? t('subscription.paid') : invoice.status}
                    </Badge>
                  </div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground flex flex-wrap items-center gap-1">
                    <span className="flex-shrink-0">
                      {new Date(invoice.created_at).toLocaleDateString(i18n.language === 'de' ? 'de-DE' : 'en-US')}
                    </span>
                    {invoice.paid_at && (
                      <>
                        <span className="hidden sm:inline">•</span>
                        <span className="flex-shrink-0">
                          <span className="sm:hidden">{t('subscription.paid')}: </span>
                          <span className="hidden sm:inline">{t('subscription.paid')}: </span>
                          {new Date(invoice.paid_at).toLocaleDateString(i18n.language === 'de' ? 'de-DE' : 'en-US')}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right Section - Amount and Action */}
                <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 lg:gap-4 flex-shrink-0">
                  <div className="text-left sm:text-right">
                    <div className="font-semibold text-sm sm:text-base flex items-center gap-1">
                      <Euro className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-muted-foreground" />
                      <span>{formatPrice(invoice.amount_total, invoice.currency)}</span>
                    </div>
                  </div>
                  {invoice.hosted_invoice_url && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(invoice.hosted_invoice_url, '_blank')}
                      className="min-h-[36px] sm:min-h-[32px] text-xs px-3 sm:px-4 touch-manipulation"
                    >
                      <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5 flex-shrink-0" />
                      PDF
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
