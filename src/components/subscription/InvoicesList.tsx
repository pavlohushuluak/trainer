
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Euro } from "lucide-react";

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
  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Rechnungen
        </CardTitle>
        <CardDescription>
          Ihre Zahlungshistorie und Rechnungen
        </CardDescription>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Noch keine Rechnungen vorhanden
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {invoice.invoice_number || `Rechnung ${invoice.id.slice(-8)}`}
                    </span>
                    <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                      {invoice.status === 'paid' ? 'Bezahlt' : invoice.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(invoice.created_at).toLocaleDateString('de-DE')}
                    {invoice.paid_at && ` • Bezahlt: ${new Date(invoice.paid_at).toLocaleDateString('de-DE')}`}
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
