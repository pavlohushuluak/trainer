
import { Card, CardContent } from '@/components/ui/card';
import { AdminUser } from './types';
import { useTranslation } from 'react-i18next';

interface DebugCardProps {
  admins: AdminUser[];
}

export const DebugCard = ({ admins }: DebugCardProps) => {
  const { t } = useTranslation();
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="pt-4">
        <p className="text-sm text-blue-800">
          {t('adminDebug.debugInfo', { count: admins?.length || 0 })}
        </p>
        {admins && admins.length > 0 && (
          <pre className="text-xs mt-2 text-blue-600">
            {JSON.stringify(admins[0], null, 2)}
          </pre>
        )}
      </CardContent>
    </Card>
  );
};
