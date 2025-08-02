
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldOff, Trash2, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AdminUser } from './types';
import { useTranslation } from 'react-i18next';

interface AdminUserCardProps {
  admin: AdminUser;
  onToggleStatus: (adminId: string, activate: boolean) => void;
  onRemove: (adminId: string) => void;
  isToggling: boolean;
  isRemoving: boolean;
}

export const AdminUserCard = ({ 
  admin, 
  onToggleStatus, 
  onRemove, 
  isToggling, 
  isRemoving 
}: AdminUserCardProps) => {
  const { t } = useTranslation();
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getRoleBadge = (role: string) => {
    return role === 'admin' ? (
      <Badge variant="destructive">{t('adminUserCard.roles.admin')}</Badge>
    ) : (
      <Badge variant="secondary">{t('adminUserCard.roles.support')}</Badge>
    );
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="font-medium">{admin.email}</h3>
            <p className="text-sm text-muted-foreground">
              {t('adminUserCard.added', { date: formatDate(admin.created_at) })}
              {(admin as any).created_by_profile && (
                <span> {t('adminUserCard.addedBy', { email: (admin as any).created_by_profile.email })}</span>
              )}
            </p>
            {admin.last_login && (
              <p className="text-sm text-muted-foreground">
                {t('adminUserCard.lastLogin', { date: formatDate(admin.last_login) })}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {getRoleBadge(admin.role)}
            <Badge variant={admin.is_active ? "default" : "outline"}>
              {admin.is_active ? t('adminUserCard.status.active') : t('adminUserCard.status.inactive')}
            </Badge>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onToggleStatus(admin.id, !admin.is_active)}
          disabled={isToggling}
        >
          {admin.is_active ? (
            <ShieldOff className="h-4 w-4" />
          ) : (
            <Shield className="h-4 w-4" />
          )}
        </Button>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('adminUserCard.removeDialog.title')}</DialogTitle>
              <DialogDescription>
                {t('adminUserCard.removeDialog.description', { email: admin.email })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline">{t('adminUserCard.removeDialog.cancel')}</Button>
              <Button 
                variant="destructive"
                onClick={() => onRemove(admin.id)}
                disabled={isRemoving}
              >
                {isRemoving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {t('adminUserCard.removeDialog.remove')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
