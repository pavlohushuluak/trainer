
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddAdminForm } from './AddAdminForm';
import { AdminUsersList } from './AdminUsersList';
import { DebugCard } from './DebugCard';
import { EmailManagement } from './EmailManagement';
import { useAdminUsers } from './hooks/useAdminUsers';
import { useTranslation } from 'react-i18next';

export const AdminSettings = () => {
  const {
    admins,
    isLoading,
    error,
    addAdmin,
    toggleAdminStatus,
    removeAdmin
  } = useAdminUsers();
  const { t } = useTranslation();

  const handleAddAdmin = (email: string, role: 'admin' | 'support') => {
    addAdmin.mutate({ email, role });
  };

  const handleToggleStatus = (adminId: string, activate: boolean) => {
    toggleAdminStatus.mutate({ adminId, activate });
  };

  const handleRemoveAdmin = (adminId: string) => {
    removeAdmin.mutate(adminId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48 sm:h-64">
        <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin" />
        <span className="ml-2 text-sm sm:text-base">{t('adminSettings.loading')}</span>
      </div>
    );
  }

  if (error) {
    console.error('Query error:', error);
    return (
      <div className="flex items-center justify-center h-48 sm:h-64">
        <div className="text-center">
          <p className="text-red-600 text-sm sm:text-base">{t('adminSettings.error.title')}</p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Section - Mobile Responsive */}
      <div className="space-y-2 sm:space-y-3">
        <h1 className="text-xl sm:text-2xl font-bold">{t('adminSettings.title')}</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          {t('adminSettings.description')}
        </p>
      </div>

      {/* Tabs Section - Mobile Responsive */}
      <Tabs defaultValue="email" className="space-y-3 sm:space-y-4">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 h-auto sm:h-10">
          <TabsTrigger value="email" className="text-xs sm:text-sm py-2 sm:py-1.5">
            {t('adminSettings.tabs.email')}
          </TabsTrigger>
          <TabsTrigger value="admins" className="text-xs sm:text-sm py-2 sm:py-1.5">
            {t('adminSettings.tabs.admins')}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="email" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
          <EmailManagement />
        </TabsContent>
        
        <TabsContent value="admins" className="space-y-4 sm:space-y-6 mt-3 sm:mt-4">
          <DebugCard admins={admins || []} />

          <AddAdminForm 
            onAddAdmin={handleAddAdmin}
            isAdding={addAdmin.isPending}
          />

          <AdminUsersList
            admins={admins || []}
            onToggleStatus={handleToggleStatus}
            onRemove={handleRemoveAdmin}
            isToggling={toggleAdminStatus.isPending}
            isRemoving={removeAdmin.isPending}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
