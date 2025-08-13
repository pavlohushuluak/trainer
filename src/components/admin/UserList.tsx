
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCard } from './UserCard';
import { UserWithDetails } from './types';
import { useTranslation } from 'react-i18next';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

interface UserListProps {
  users: UserWithDetails[] | undefined;
  isLoading: boolean;
  error: Error | null;
  onActivate: (userId: string) => void;
  onDeactivate: (userId: string) => void;
  onSetTrial: (userId: string, trialDays: string) => void;
  onToggleTestUser: (userId: string, isTestUser: boolean) => void;
  onDelete: (userId: string) => void;
  onCancelSubscription: (userId: string, immediateRefund: boolean) => void;
  onShowDetails: (user: UserWithDetails) => void;
  onRefresh: () => void;
  onSync: () => void;
  isActivating: boolean;
  isDeactivating: boolean;
  isSettingTrial: boolean;
  isTogglingTestUser: boolean;
  isDeleting: boolean;
  isCancelling: boolean;
}

export const UserList = ({
  users,
  isLoading,
  error,
  onActivate,
  onDeactivate,
  onSetTrial,
  onToggleTestUser,
  onDelete,
  onCancelSubscription,
  onShowDetails,
  onRefresh,
  onSync,
  isActivating,
  isDeactivating,
  isSettingTrial,
  isTogglingTestUser,
  isDeleting,
  isCancelling
}: UserListProps) => {
  const { t } = useTranslation();

  // Show loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('adminUsers.userList.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">
                {t('adminUsers.loading')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error) {
    console.error('🔍 UserList: Error state:', error);
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            {t('adminUsers.error.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : t('adminUsers.error.message')}
          </p>
          <div className="flex gap-2">
            <Button onClick={onRefresh} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              {t('adminUsers.error.retry')}
            </Button>
            <Button onClick={onSync} variant="outline">
              {t('adminUsers.error.syncStripe')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('adminUsers.userList.title')} ({users?.length || 0})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users?.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onActivate={onActivate}
              onDeactivate={onDeactivate}
              onSetTrial={onSetTrial}
              onToggleTestUser={onToggleTestUser}
              onDelete={onDelete}
              onCancelSubscription={onCancelSubscription}
              onShowDetails={onShowDetails}
              isActivating={isActivating}
              isDeactivating={isDeactivating}
              isSettingTrial={isSettingTrial}
              isTogglingTestUser={isTogglingTestUser}
              isDeleting={isDeleting}
              isCancelling={isCancelling}
            />
          ))}
          
          {users?.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              {t('adminUsers.userList.noUsersFound')}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
