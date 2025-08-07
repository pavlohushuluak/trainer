
import { Card, CardContent } from '@/components/ui/card';
import { AdminUser } from './types';
import { useTranslation } from 'react-i18next';

interface DebugCardProps {
  admins: AdminUser[];
}

export const DebugCard = ({ admins }: DebugCardProps) => {
  const { t } = useTranslation();
  return (
    <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
      <CardContent className="pt-4 p-3 sm:p-6">
        <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-300">
          {t('adminDebug.debugInfo', { count: admins?.length || 0 })}
        </p>
        {admins && admins.length > 0 && (
          <pre className="text-xs mt-2 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10 p-2 sm:p-3 rounded border border-blue-200/50 dark:border-blue-800/50 overflow-x-auto whitespace-pre-wrap break-words max-w-full">
            {JSON.stringify(admins[0], null, 2)}
          </pre>
        )}
      </CardContent>
    </Card>
  );
};
