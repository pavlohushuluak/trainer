
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
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {t('subscription.invoices')}
        </CardTitle>
        <CardDescription>
          {t('subscription.invoicesDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {t('subscription.noInvoices')}
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {invoice.invoice_number || `${t('subscription.invoice')} ${invoice.id.slice(-8)}`}
                    </span>
                    <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                      {invoice.status === 'paid' ? t('subscription.paid') : invoice.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(invoice.created_at).toLocaleDateString(i18n.language === 'de' ? 'de-DE' : 'en-US')}
                    {invoice.paid_at && ` • ${t('subscription.paid')}: ${new Date(invoice.paid_at).toLocaleDateString(i18n.language === 'de' ? 'de-DE' : 'en-US')}`}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-medium flex items-center gap-1">
                      <Euro className="h-4 w-4" />
                      {formatPrice(invoice.amount_total, invoice.currency)}
                    </div>
                  </div>
                  {invoice.hosted_invoice_url && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(invoice.hosted_invoice_url, '_blank')}
                    >
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
