
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCachedQuery } from '@/hooks/useCachedQuery';
import { supabase } from '@/integrations/supabase/client';
import { CacheStatus } from './CacheStatus';
import { MetricCard } from './MetricCard';
import { SubscriberMetrics } from './SubscriberMetrics';
import { TrafficMetrics } from './TrafficMetrics';
import { SupportMetrics } from './SupportMetrics';
import { TrialConversionMetrics } from './TrialConversionMetrics';
import { TimeRangeFilter } from './TimeRangeFilter';
import { useState } from 'react';
import { Users, UserCheck, UserPlus, TrendingUp } from 'lucide-react';

export const OptimizedAnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('7d');

  // Cached query for overview metrics
  const { data: overviewMetrics, isLoading: overviewLoading } = useCachedQuery(
    ['analytics-overview', timeRange],
    {
      queryFn: async () => {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, created_at');
        
        const { data: subscribers, error: subscribersError } = await supabase
          .from('subscribers')
          .select('*');

        if (profilesError || subscribersError) {
          throw new Error('Failed to fetch overview metrics');
        }

        const totalUsers = profiles?.length || 0;
        const activeSubscribers = subscribers?.filter(s => s.subscription_status === 'active').length || 0;
        const trialUsers = subscribers?.filter(s => s.subscription_status === 'trialing').length || 0;
        
        // Calculate new signups based on time range
        const days = timeRange === '30d' ? 30 : timeRange === '7d' ? 7 : 1;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        const newSignups = profiles?.filter(p => 
          new Date(p.created_at) >= cutoffDate
        ).length || 0;

        const conversionRate = totalUsers > 0 ? (activeSubscribers / totalUsers) * 100 : 0;

        return {
          totalUsers,
          activeSubscribers,
          trialUsers,
          newSignups,
          conversionRate
        };
      },
      queryKey: ['analytics-overview', timeRange],
      cacheTTL: 5,
      cacheKey: `overview-${timeRange}`
    }
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">📊 Analytics Dashboard (Optimized)</h1>
          <p className="text-muted-foreground">
            Performance-optimized analytics with caching and lazy loading
          </p>
        </div>
        <TimeRangeFilter value={timeRange} onChange={setTimeRange} />
      </div>

      {/* Cache Status */}
      <CacheStatus />

      {/* Overview Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Users"
          value={overviewMetrics?.totalUsers || 0}
          icon={Users}
          isLoading={overviewLoading}
          trend={{ value: 12, isPositive: true }}
        />
        <MetricCard
          title="Active Subscribers"
          value={overviewMetrics?.activeSubscribers || 0}
          icon={UserCheck}
          isLoading={overviewLoading}
          trend={{ value: 8, isPositive: true }}
        />
        <MetricCard
          title="Trial Users"
          value={overviewMetrics?.trialUsers || 0}
          icon={UserPlus}
          isLoading={overviewLoading}
          trend={{ value: 15, isPositive: true }}
        />
        <MetricCard
          title="Conversion Rate"
          value={`${(overviewMetrics?.conversionRate || 0).toFixed(1)}%`}
          icon={TrendingUp}
          isLoading={overviewLoading}
          trend={{ value: 2.3, isPositive: true }}
        />
      </div>

      {/* Detailed Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        <SubscriberMetrics timeRange={timeRange} />
        <TrafficMetrics timeRange={timeRange} />
        <SupportMetrics timeRange={timeRange} />
        <TrialConversionMetrics timeRange={timeRange} />
      </div>
    </div>
  );
};
