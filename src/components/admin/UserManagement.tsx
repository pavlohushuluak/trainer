
import { useState } from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserWithDetails } from './types';
import { TestUserManager } from './TestUserManager';
import { UserSearch } from './UserSearch';
import { UserList } from './UserList';
import { UserDetailsModal } from './UserDetailsModal';
import { UserManagementHeader } from './UserManagementHeader';
import { useUserActions } from './hooks/useUserActions';
import { useUserSync } from './hooks/useUserSync';
import { useUserQuery } from './hooks/useUserQuery';
import { useTranslation } from 'react-i18next';

export const UserManagement = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserWithDetails | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const {
    activateUser,
    deactivateUser,
    setTrialPeriod,
    deleteUser,
    toggleTestUser,
    cancelUserSubscription
  } = useUserActions();

  const { syncStripeUsers } = useUserSync();
  const { data: users, isLoading, error, refetch } = useUserQuery(searchQuery);

  const handleShowDetails = (user: UserWithDetails) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const handleSetTrial = (userId: string, trialDays: string) => {
    setTrialPeriod.mutate({ userId, trialDays });
  };

  const handleToggleTestUser = (userId: string, isTestUser: boolean) => {
    toggleTestUser.mutate({ userId, isTestUser });
  };

  const handleSync = () => {
    syncStripeUsers.mutate();
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleCancelSubscription = (userId: string, immediateRefund: boolean) => {
    cancelUserSubscription.mutate({ userId, immediateRefund });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">{t('adminUsers.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-full max-w-md">
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
              <Button onClick={handleRefresh} variant="outline" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                {t('adminUsers.error.retry')}
              </Button>
              <Button onClick={handleSync} variant="outline">
                {t('adminUsers.error.syncStripe')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <UserManagementHeader
        onRefresh={handleRefresh}
        onSync={handleSync}
        isLoading={isLoading}
        isSyncing={syncStripeUsers.isPending}
      />

      {/* Test-Benutzer Manager */}
      <TestUserManager />

      {/* Such- und Filterbereich */}
      <UserSearch 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Nutzer-Liste */}
      <UserList
        users={users}
        onActivate={(userId) => activateUser.mutate(userId)}
        onDeactivate={(userId) => deactivateUser.mutate(userId)}
        onSetTrial={handleSetTrial}
        onToggleTestUser={handleToggleTestUser}
        onDelete={(userId) => deleteUser.mutate(userId)}
        onCancelSubscription={handleCancelSubscription}
        onShowDetails={handleShowDetails}
        isActivating={activateUser.isPending}
        isDeactivating={deactivateUser.isPending}
        isSettingTrial={setTrialPeriod.isPending}
        isTogglingTestUser={toggleTestUser.isPending}
        isDeleting={deleteUser.isPending}
        isCancelling={cancelUserSubscription.isPending}
      />

      {/* User Details Modal */}
      <UserDetailsModal
        user={selectedUser}
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
      />
    </div>
  );
};
