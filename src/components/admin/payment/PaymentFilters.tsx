
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PaymentFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  dateFilter: string;
  onDateChange: (value: string) => void;
}

export const PaymentFilters = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  dateFilter,
  onDateChange,
}: PaymentFiltersProps) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          {t('adminPayment.paymentFilters.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder={t('adminPayment.paymentFilters.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder={t('adminPayment.paymentFilters.statusPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('adminPayment.paymentFilters.allStatuses')}</SelectItem>
              <SelectItem value="paid">{t('adminPayment.invoiceList.paid')}</SelectItem>
              <SelectItem value="open">{t('adminPayment.invoiceList.open')}</SelectItem>
              <SelectItem value="pending">{t('adminPayment.invoiceList.pending')}</SelectItem>
              <SelectItem value="draft">{t('adminPayment.invoiceList.draft')}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={onDateChange}>
            <SelectTrigger>
              <SelectValue placeholder={t('adminPayment.paymentFilters.datePlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">{t('adminPayment.paymentFilters.last7Days')}</SelectItem>
              <SelectItem value="30">{t('adminPayment.paymentFilters.last30Days')}</SelectItem>
              <SelectItem value="90">{t('adminPayment.paymentFilters.last90Days')}</SelectItem>
              <SelectItem value="365">{t('adminPayment.paymentFilters.lastYear')}</SelectItem>
              <SelectItem value="all">{t('adminPayment.paymentFilters.allDates')}</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            {t('adminPayment.paymentFilters.advancedFilters')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
