
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCard } from './UserCard';
import { UserWithDetails } from './types';
import { useTranslation } from 'react-i18next';

interface UserListProps {
  users: UserWithDetails[] | undefined;
  onActivate: (userId: string) => void;
  onDeactivate: (userId: string) => void;
  onSetTrial: (userId: string, trialDays: string) => void;
  onToggleTestUser: (userId: string, isTestUser: boolean) => void;
  onDelete: (userId: string) => void;
  onCancelSubscription: (userId: string, immediateRefund: boolean) => void;
  onShowDetails: (user: UserWithDetails) => void;
  isActivating: boolean;
  isDeactivating: boolean;
  isSettingTrial: boolean;
  isTogglingTestUser: boolean;
  isDeleting: boolean;
  isCancelling: boolean;
}

export const UserList = ({
  users,
  onActivate,
  onDeactivate,
  onSetTrial,
  onToggleTestUser,
  onDelete,
  onCancelSubscription,
  onShowDetails,
  isActivating,
  isDeactivating,
  isSettingTrial,
  isTogglingTestUser,
  isDeleting,
  isCancelling
}: UserListProps) => {
  const { t } = useTranslation();
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
