import { useTranslation } from 'react-i18next';

export const formatCurrency = (amount: number, currency: string = 'EUR') => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

export const downloadCSV = (invoices: any[], t: any) => {
  if (!invoices) return;

  const csvData = invoices.map(invoice => ({
    [t('adminPayment.utils.csvHeaders.invoiceNumber')]: invoice.invoice_number || '',
    [t('adminPayment.utils.csvHeaders.email')]: invoice.profiles?.email || '',
    [t('adminPayment.utils.csvHeaders.amount')]: formatCurrency(invoice.amount_total || 0, invoice.currency || 'EUR'),
    [t('adminPayment.utils.csvHeaders.status')]: invoice.status || '',
    [t('adminPayment.utils.csvHeaders.created')]: invoice.created_at ? formatDate(invoice.created_at) : '',
    [t('adminPayment.utils.csvHeaders.paid')]: invoice.paid_at ? formatDate(invoice.paid_at) : '',
    [t('adminPayment.utils.csvHeaders.paymentMethod')]: invoice.payment_method || ''
  }));

  const headers = Object.keys(csvData[0]);
  const csvContent = [
    headers.join(','),
    ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = t('adminPayment.utils.csvFilename', { date: new Date().toISOString().split('T')[0] });
  link.click();
};
