import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";

interface DataRefreshButtonProps {
  onRefresh?: () => void;
  className?: string;
}

export const DataRefreshButton = ({ onRefresh, className }: DataRefreshButtonProps) => {
  const { t } = useTranslation();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const handleRefresh = async () => {
    if (isRefreshing || !user) return;
    
    setIsRefreshing(true);
    
    try {
      // Clear all relevant caches
      await queryClient.invalidateQueries({ queryKey: ['pets', user.id] });
      await queryClient.invalidateQueries({ queryKey: ['subscription-status', user.id] });
      await queryClient.invalidateQueries({ queryKey: ['admin-check', user.id] });
      
      // Force refresh all queries
      await queryClient.refetchQueries({ queryKey: ['pets', user.id] });
      await queryClient.refetchQueries({ queryKey: ['subscription-status', user.id] });
      
      // Call custom refresh if provided
      if (onRefresh) {
        await onRefresh();
      }
      
      toast({
        title: t('dataRefreshButton.toast.success.title'),
        description: t('dataRefreshButton.toast.success.description'),
      });
    } catch (error) {
      console.error('💥 MANUAL REFRESH: Failed to refresh data:', error);
      toast({
        title: t('dataRefreshButton.toast.error.title'),
        description: t('dataRefreshButton.toast.error.description'),
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Button
      onClick={handleRefresh}
      disabled={isRefreshing}
      variant="outline"
      size="sm"
      className={className}
    >
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      {isRefreshing ? t('dataRefreshButton.refreshing') : t('dataRefreshButton.refreshData')}
    </Button>
  );
};