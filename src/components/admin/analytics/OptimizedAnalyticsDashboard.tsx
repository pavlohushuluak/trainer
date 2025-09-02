
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCachedQuery } from '@/hooks/useCachedQuery';
import { supabase } from '@/integrations/supabase/client';
import { CacheStatus } from './CacheStatus';
import { MetricCard } from './MetricCard';
import { SubscriberMetrics } from './SubscriberMetrics';
import { TrafficMetrics } from './TrafficMetrics';
import { SupportMetrics } from './SupportMetrics';
import { FreeConversionMetrics } from './FreeConversionMetrics';
import { TimeRangeFilter } from './TimeRangeFilter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useEffect } from 'react';
import { Users, UserCheck, UserPlus, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const OptimizedAnalyticsDashboard = () => {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState('7');

  // Log time range changes for debugging
  useEffect(() => {
    console.log('Analytics Dashboard - Time range changed to:', timeRange);
  }, [timeRange]);

  // Static overview metrics (not time-dependent)
  const { data: overviewMetrics, isLoading: overviewLoading } = useCachedQuery(
    ['analytics-overview-static'],
    {
      queryFn: async () => {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, created_at');
        
        const { data: subscribers, error: subscribersError } = await supabase
          .from('subscribers')
          .select('*, created_at');

        if (profilesError || subscribersError) {
          console.error('Analytics Dashboard - Database errors:', { profilesError, subscribersError });
          throw new Error('Failed to fetch overview metrics');
        }

        const totalUsers = profiles?.length || 0;
        const activeSubscribers = subscribers?.filter(s => s.subscription_status === 'active').length || 0;
        const freeUsers = subscribers?.filter(s => s.subscription_status === 'inactive' && (s.questions_num || 0) > 0).length || 0;
        
        // Calculate new signups for last 30 days (static)
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 30);
        
        const newSignups = profiles?.filter(p => 
          p.created_at && new Date(p.created_at) >= cutoffDate
        ).length || 0;

        // Calculate overall conversion rate (static)
        const totalConversions = subscribers?.filter(s => s.subscription_status === 'active').length || 0;
        const totalFreeUsers = subscribers?.filter(s => s.subscription_status === 'inactive' && (s.questions_num || 0) > 0).length || 0;
        
        // Conversion rate: percentage of free users who converted to paying
        const conversionRate = totalFreeUsers > 0 ? 
          (totalConversions / totalFreeUsers) * 100 : 0;

        return {
          totalUsers,
          activeSubscribers,
          freeUsers,
          newSignups,
          conversionRate
        };
      },
      queryKey: ['analytics-overview-static'],
      cacheTTL: 5,
      cacheKey: 'overview-static'
    }
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">📊 {t('adminAnalytics.dashboard.title')}</h1>
        <p className="text-muted-foreground">
          {t('adminAnalytics.dashboard.description')}
        </p>
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

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="traffic" className="space-y-4">
        <TabsList className="grid w-full h-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="traffic" className="text-xs sm:text-sm">{t('adminAnalytics.tabs.traffic')}</TabsTrigger>
          <TabsTrigger value="conversion" className="text-xs sm:text-sm">{t('adminAnalytics.tabs.conversion')}</TabsTrigger>
          <TabsTrigger value="subscribers" className="text-xs sm:text-sm">{t('adminAnalytics.tabs.subscribers')}</TabsTrigger>
          <TabsTrigger value="support" className="text-xs sm:text-sm">{t('adminAnalytics.tabs.support')}</TabsTrigger>
        </TabsList>
        
        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
          <TimeRangeFilter value={timeRange} onChange={setTimeRange} />
        </div>

        <TabsContent value="traffic">
          <TrafficMetrics timeRange={timeRange} />
        </TabsContent>

        <TabsContent value="conversion">
          <FreeConversionMetrics timeRange={timeRange} />
        </TabsContent>

        <TabsContent value="subscribers">
          <SubscriberMetrics timeRange={timeRange} />
        </TabsContent>

        <TabsContent value="support">
          <SupportMetrics timeRange={timeRange} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
