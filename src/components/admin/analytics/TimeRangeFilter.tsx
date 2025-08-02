
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';

interface TimeRangeFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export const TimeRangeFilter = ({ value, onChange }: TimeRangeFilterProps) => {
  const { t } = useTranslation();
  
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="7">{t('adminAnalytics.timeRange.last7Days')}</SelectItem>
        <SelectItem value="30">{t('adminAnalytics.timeRange.last30Days')}</SelectItem>
        <SelectItem value="90">{t('adminAnalytics.timeRange.last3Months')}</SelectItem>
        <SelectItem value="365">{t('adminAnalytics.timeRange.lastYear')}</SelectItem>
      </SelectContent>
    </Select>
  );
};
