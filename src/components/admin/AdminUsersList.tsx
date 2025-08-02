
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminUserCard } from './AdminUserCard';
import { AdminUser } from './types';
import { useTranslation } from 'react-i18next';

interface AdminUsersListProps {
  admins: AdminUser[];
  onToggleStatus: (adminId: string, activate: boolean) => void;
  onRemove: (adminId: string) => void;
  isToggling: boolean;
  isRemoving: boolean;
}

export const AdminUsersList = ({ 
  admins, 
  onToggleStatus, 
  onRemove, 
  isToggling, 
  isRemoving 
}: AdminUsersListProps) => {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('adminUsersList.title', { count: admins?.length || 0 })}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {admins?.map((admin) => (
            <AdminUserCard
              key={admin.id}
              admin={admin}
              onToggleStatus={onToggleStatus}
              onRemove={onRemove}
              isToggling={isToggling}
              isRemoving={isRemoving}
            />
          ))}
          
          {admins?.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              {t('adminUsersList.noAdmins')}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
