
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface UserManagementHeaderProps {
  onRefresh: () => void;
  onSync: () => void;
  isLoading: boolean;
  isSyncing: boolean;
}

export const UserManagementHeader = ({
  onRefresh,
  onSync,
  isLoading,
  isSyncing
}: UserManagementHeaderProps) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="min-w-0 flex-1">
        <h1 className="text-xl sm:text-2xl font-bold">{t('adminUsers.title')}</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          {t('adminUsers.description')}
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2">
        <Button 
          onClick={onRefresh} 
          variant="outline" 
          size="sm"
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{t('adminUsers.header.refresh')}</span>
          <span className="sm:hidden">{t('adminUsers.header.refresh')}</span>
        </Button>
        
        <Button 
          onClick={onSync} 
          variant="outline" 
          size="sm"
          disabled={isSyncing}
          className="w-full sm:w-auto"
        >
          {isSyncing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          <span className="hidden sm:inline">{t('adminUsers.header.stripeSync')}</span>
          <span className="sm:hidden">{t('adminUsers.header.stripeSync')}</span>
        </Button>
      </div>
    </div>
  );
};
