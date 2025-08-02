
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
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">{t('adminUsers.title')}</h1>
        <p className="text-muted-foreground">
          {t('adminUsers.description')}
        </p>
      </div>
      
      <div className="flex gap-2">
        <Button 
          onClick={onRefresh} 
          variant="outline" 
          size="sm"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {t('adminUsers.header.refresh')}
        </Button>
        
        <Button 
          onClick={onSync} 
          variant="outline" 
          size="sm"
          disabled={isSyncing}
        >
          {isSyncing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          {t('adminUsers.header.stripeSync')}
        </Button>
      </div>
    </div>
  );
};
