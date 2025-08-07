
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
      <Badge variant="destructive" className="text-xs">{t('adminUserCard.roles.admin')}</Badge>
    ) : (
      <Badge variant="secondary" className="text-xs">{t('adminUserCard.roles.support')}</Badge>
    );
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg gap-3 sm:gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm sm:text-base truncate">{admin.email}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t('adminUserCard.added', { date: formatDate(admin.created_at) })}
              {(admin as any).created_by_profile && (
                <span> {t('adminUserCard.addedBy', { email: (admin as any).created_by_profile.email })}</span>
              )}
            </p>
            {admin.last_login && (
              <p className="text-xs sm:text-sm text-muted-foreground">
                {t('adminUserCard.lastLogin', { date: formatDate(admin.last_login) })}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {getRoleBadge(admin.role)}
            <Badge variant={admin.is_active ? "default" : "outline"} className="text-xs">
              {admin.is_active ? t('adminUserCard.status.active') : t('adminUserCard.status.inactive')}
            </Badge>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 self-end sm:self-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onToggleStatus(admin.id, !admin.is_active)}
          disabled={isToggling}
          className="h-8 w-8 sm:h-9 sm:w-auto px-2 sm:px-3"
        >
          {admin.is_active ? (
            <ShieldOff className="h-4 w-4" />
          ) : (
            <Shield className="h-4 w-4" />
          )}
        </Button>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 w-8 sm:h-9 sm:w-auto px-2 sm:px-3">
              <Trash2 className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">{t('adminUserCard.removeDialog.title')}</DialogTitle>
              <DialogDescription className="text-sm sm:text-base">
                {t('adminUserCard.removeDialog.description', { email: admin.email })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button variant="outline" className="w-full sm:w-auto text-sm">
                {t('adminUserCard.removeDialog.cancel')}
              </Button>
              <Button 
                variant="destructive"
                onClick={() => onRemove(admin.id)}
                disabled={isRemoving}
                className="w-full sm:w-auto text-sm"
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
