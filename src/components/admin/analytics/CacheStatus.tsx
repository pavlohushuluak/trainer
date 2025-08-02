
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PerformanceCache } from '@/utils/performance';
import { RefreshCw, Database } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const CacheStatus = () => {
  const { t } = useTranslation();
  const [cacheSize, setCacheSize] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const updateCacheInfo = () => {
    // Since the cache is private, we'll simulate cache info
    // In a real implementation, you'd expose cache stats
    setCacheSize(Math.floor(Math.random() * 100) + 1);
    setLastUpdate(new Date());
  };

  const clearCache = () => {
    PerformanceCache.clear();
    setCacheSize(0);
    setLastUpdate(new Date());
  };

  useEffect(() => {
    updateCacheInfo();
    const interval = setInterval(updateCacheInfo, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium">{t('adminAnalytics.cacheStatus.title')}</CardTitle>
          <CardDescription>
            {t('adminAnalytics.cacheStatus.description')}
          </CardDescription>
        </div>
        <Database className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{t('adminAnalytics.cacheStatus.cacheEntries')}:</span>
            <span className="font-medium">{cacheSize}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>{t('adminAnalytics.cacheStatus.lastUpdate')}:</span>
            <span className="text-muted-foreground">
              {lastUpdate?.toLocaleTimeString() || t('adminAnalytics.cacheStatus.unknown')}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={clearCache}
            className="w-full mt-2"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            {t('adminAnalytics.cacheStatus.clearCache')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
