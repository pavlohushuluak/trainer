
import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
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
import { useAuth } from '@/hooks/useAuth';

export const UserManagement = () => {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  const [shouldFetch, setShouldFetch] = useState(true); // Start with true to load all users initially
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
  const { data: users, isLoading, error, refetch } = useUserQuery(activeSearchQuery, shouldFetch);

  console.log('🔍 UserManagement: Render state:', {
    user: !!user,
    authLoading,
    isLoading,
    usersCount: users?.length || 0,
    error: error?.message
  });

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
    console.log('🔍 UserManagement: Manual refresh triggered');
    refetch();
  };

  const handleFilter = (query: string) => {
    console.log('🔍 UserManagement: Filter triggered with query:', query);
    setActiveSearchQuery(query);
    setShouldFetch(true);
  };

  const handleClear = () => {
    console.log('🔍 UserManagement: Clear filter triggered');
    setActiveSearchQuery('');
    setSearchQuery('');
    setShouldFetch(true); // Keep fetching enabled to show all users
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleCancelSubscription = (userId: string, immediateRefund: boolean) => {
    cancelUserSubscription.mutate({ userId, immediateRefund });
  };

  // Show error if user is not authenticated
  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Authentication Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Please log in to access the admin panel.
            </p>
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
        searchQuery={activeSearchQuery}
        onSearchChange={handleSearchChange}
        onFilter={handleFilter}
        onClear={handleClear}
        isFiltering={isLoading}
      />

      {/* Nutzer-Liste */}
      <UserList
        users={users}
        isLoading={isLoading}
        error={error}
        onActivate={(userId) => activateUser.mutate(userId)}
        onDeactivate={(userId) => deactivateUser.mutate(userId)}
        onSetTrial={handleSetTrial}
        onToggleTestUser={handleToggleTestUser}
        onDelete={(userId) => deleteUser.mutate(userId)}
        onCancelSubscription={handleCancelSubscription}
        onShowDetails={handleShowDetails}
        onRefresh={handleRefresh}
        onSync={handleSync}
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
