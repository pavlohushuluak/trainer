
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCachedQuery } from '@/hooks/useCachedQuery';
import { supabase } from '@/integrations/supabase/client';
import { CacheStatus } from './CacheStatus';
import { MetricCard } from './MetricCard';
import { SubscriberMetrics } from './SubscriberMetrics';
import { TrafficMetrics } from './TrafficMetrics';
import { SupportMetrics } from './SupportMetrics';
import { TimeRangeFilter } from './TimeRangeFilter';
import { useState, useCallback, useEffect } from 'react';
import { Users, UserCheck, UserPlus, TrendingUp, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

export const OptimizedAnalyticsDashboard = () => {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState('7d');
  const [refreshKey, setRefreshKey] = useState(0);

  // Function to force refresh of all data
  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  // Force refresh when component mounts to ensure fresh data
  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  // Cached query for overview metrics
  const { data: overviewMetrics, isLoading: overviewLoading } = useCachedQuery(
    ['analytics-overview', timeRange, refreshKey],
    {
      queryFn: async () => {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, created_at');
        
        const { data: subscribers, error: subscribersError } = await supabase
          .from('subscribers')
          .select('*, created_at');

        if (profilesError || subscribersError) {
          throw new Error('Failed to fetch overview metrics');
        }

        const totalUsers = profiles?.length || 0;
        const activeSubscribers = subscribers?.filter(s => s.subscription_status === 'active').length || 0;
        const freeUsers = subscribers?.filter(s => !s.subscribed && s.questions_num > 0).length || 0;
        
        // Calculate new signups based on time range
        const days = timeRange === '30d' ? 30 : timeRange === '7d' ? 7 : 1;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        const newSignups = profiles?.filter(p => 
          new Date(p.created_at) >= cutoffDate
        ).length || 0;

        // Calculate conversion rate: Free users who converted to paying within time range
        // Get subscribers who were created within the time range and are now active
        const newConversions = subscribers?.filter(s => 
          s.subscription_status === 'active' && 
          s.created_at && 
          new Date(s.created_at) >= cutoffDate
        ).length || 0;
        
        // Get free users who were active within the time range
        const freeUsersInPeriod = subscribers?.filter(s => 
          !s.subscribed && 
          s.questions_num > 0 && 
          s.created_at && 
          new Date(s.created_at) >= cutoffDate
        ).length || 0;
        
        // Calculate conversion rate: new conversions / (free users in period + new conversions)
        const conversionRate = (freeUsersInPeriod + newConversions) > 0 ? 
          (newConversions / (freeUsersInPeriod + newConversions)) * 100 : 0;

        return {
          totalUsers,
          activeSubscribers,
          freeUsers,
          newSignups,
          conversionRate
        };
      },
      queryKey: ['analytics-overview', timeRange, refreshKey],
      cacheTTL: 1,
      cacheKey: `overview-${timeRange}`
    }
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">📊 {t('adminAnalytics.dashboard.title')}</h1>
          <p className="text-muted-foreground">
            {t('adminAnalytics.dashboard.description')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TimeRangeFilter value={timeRange} onChange={setTimeRange} />
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={overviewLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${overviewLoading ? 'animate-spin' : ''}`} />
            {t('adminAnalytics.refresh')}
          </Button>
        </div>
      </div>

      {/* Cache Status */}
      <CacheStatus />

      {/* Overview Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title={t('adminAnalytics.metrics.totalUsers')}
          value={overviewMetrics?.totalUsers || 0}
          icon={Users}
          isLoading={overviewLoading}
          trend={{ value: 12, isPositive: true }}
        />
        <MetricCard
          title={t('adminAnalytics.metrics.activeSubscribers')}
          value={overviewMetrics?.activeSubscribers || 0}
          icon={UserCheck}
          isLoading={overviewLoading}
          trend={{ value: 8, isPositive: true }}
        />
        <MetricCard
          title={t('adminAnalytics.metrics.freeUsers')}
          value={overviewMetrics?.freeUsers || 0}
          icon={UserPlus}
          isLoading={overviewLoading}
          trend={{ value: 15, isPositive: true }}
        />
        <MetricCard
          title={t('adminAnalytics.metrics.conversionRate')}
          value={`${(overviewMetrics?.conversionRate || 0).toFixed(1)}%`}
          icon={TrendingUp}
          description={t('adminAnalytics.metrics.freeToPaying')}
          isLoading={overviewLoading}
          trend={{ value: 2.3, isPositive: true }}
        />
      </div>

      {/* Detailed Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        <SubscriberMetrics timeRange={timeRange} refreshKey={refreshKey} />
        <TrafficMetrics timeRange={timeRange} refreshKey={refreshKey} />
        <SupportMetrics timeRange={timeRange} refreshKey={refreshKey} />
      </div>
    </div>
  );
};
