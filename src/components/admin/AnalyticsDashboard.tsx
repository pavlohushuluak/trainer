
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  TrendingUp,
  Users,
  UserPlus,
  DollarSign,
  HeadphonesIcon,
  Calendar,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { TrafficMetrics } from './analytics/TrafficMetrics';
import { FreeConversionMetrics } from './analytics/FreeConversionMetrics';
import { SubscriberMetrics } from './analytics/SubscriberMetrics';
import { SupportMetrics } from './analytics/SupportMetrics';
import { MetricCard } from './analytics/MetricCard';
import { TimeRangeFilter } from './analytics/TimeRangeFilter';
import { AnalyticsDebug } from '../debug/AnalyticsDebug';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

export const AnalyticsDashboard = () => {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState('30');
  const [comparison, setComparison] = useState('previous_period');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get date range based on selection
  const getDateRange = () => {
    const now = new Date();
    const days = parseInt(timeRange);
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return { startDate: startDate.toISOString(), endDate: now.toISOString() };
  };

  const { startDate, endDate } = getDateRange();

  // Key metrics overview with resilient loading
  const { data: overviewStats, isLoading: overviewLoading, error: overviewError } = useQuery({
    queryKey: ['analytics-overview', timeRange],
    queryFn: async () => {

      // Use Promise.allSettled for resilient loading
      const [
        totalUsersResult,
        activeSubscribersResult,
        freeUsersResult,
        newSignupsResult,
        conversionsResult
      ] = await Promise.allSettled([
        // Total users
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        // Active subscribers
        supabase.from('subscribers').select('*', { count: 'exact', head: true }).not('subscription_tier', 'eq', 'free'),
        // Free users (users who are not subscribed and have used questions)
        supabase.from('subscribers').select('count', { count: 'exact', head: true }).eq('subscription_tier', 'free'),
        // New signups in time range
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', startDate).lte('created_at', endDate),
        // Conversion data (users who became paying customers)
        supabase.from('subscribers').select('count', { count: 'exact', head: true }).not('subscription_tier', 'eq', 'free')
      ]);

      // Extract results with fallbacks
      const totalUsers = totalUsersResult.status === 'fulfilled' ? totalUsersResult.value.count || 0 : 0;
      const activeSubscribers = activeSubscribersResult.status === 'fulfilled' ? activeSubscribersResult.value.count || 0 : 0;
      const freeUsers = totalUsers - activeSubscribers;
      const newSignups = newSignupsResult.status === 'fulfilled' ? newSignupsResult.value.count || 0 : 0;
      const conversions = conversionsResult.status === 'fulfilled' ? conversionsResult.value.count || 0 : 0;

      // Calculate conversion rate
      const conversionRate = freeUsers > 0 ? Math.round((conversions / (freeUsers + activeSubscribers)) * 100) : 0;

      // Log any errors
      [totalUsersResult, activeSubscribersResult, freeUsersResult, newSignupsResult, conversionsResult].forEach((result, index) => {
        if (result.status === 'rejected') {
          const queryNames = ['totalUsers', 'activeSubscribers', 'freeUsers', 'newSignups', 'conversions'];
          console.error(`Error fetching ${queryNames[index]}:`, result.reason);
        }
      });

      return {
        totalUsers,
        activeSubscribers,
        freeUsers,
        newSignups,
        conversionRate
      };
    },
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Force refresh by invalidating and refetching all queries
      // This will trigger a re-render of all components with fresh data
      window.location.reload();
    } catch (error) {
      console.error('Error refreshing analytics:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (overviewLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">{t('adminAnalytics.loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold">{t('adminAnalytics.title')}</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            {t('adminAnalytics.description')}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
          <TimeRangeFilter value={timeRange} onChange={setTimeRange} />
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 hover:bg-primary/5 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? t('adminAnalytics.refreshing') : t('adminAnalytics.refresh')}
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title={t('adminAnalytics.metrics.totalUsers')}
          value={overviewStats?.totalUsers || 0}
          icon={Users}
          description={t('adminAnalytics.metrics.registeredProfiles')}
        />
        <MetricCard
          title={t('adminAnalytics.metrics.activeSubscriptions')}
          value={overviewStats?.activeSubscribers || 0}
          icon={DollarSign}
          description={t('adminAnalytics.metrics.payingCustomers')}
        />
        <MetricCard
          title={t('adminAnalytics.metrics.freeUsers')}
          value={overviewStats?.freeUsers || 0}
          icon={UserPlus}
          description={t('adminAnalytics.metrics.freeUsersDescription')}
        />
        <MetricCard
          title={t('adminAnalytics.metrics.conversionRate')}
          value={`${overviewStats?.conversionRate || 0}%`}
          icon={TrendingUp}
          description={t('adminAnalytics.metrics.freeToPaying')}
        />
        <MetricCard
          title={t('adminAnalytics.metrics.newSignups')}
          value={overviewStats?.newSignups || 0}
          icon={TrendingUp}
          description={t('adminAnalytics.metrics.lastDays', { days: timeRange })}
        />
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="traffic" className="space-y-4">

          <TabsList className="grid w-full h-full grid-cols-2 sm:grid-cols-5">
            <TabsTrigger value="traffic" className="text-xs sm:text-sm">{t('adminAnalytics.tabs.traffic')}</TabsTrigger>
            <TabsTrigger value="conversion" className="text-xs sm:text-sm">{t('adminAnalytics.tabs.conversion')}</TabsTrigger>
            <TabsTrigger value="subscribers" className="text-xs sm:text-sm">{t('adminAnalytics.tabs.subscribers')}</TabsTrigger>
            <TabsTrigger value="support" className="text-xs sm:text-sm">{t('adminAnalytics.tabs.support')}</TabsTrigger>
            <TabsTrigger value="debug" className="text-xs sm:text-sm">{t('adminAnalytics.tabs.testTraffic')}</TabsTrigger>
          </TabsList>

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

          <TabsContent value="debug">
            <AnalyticsDebug />
          </TabsContent>
      </Tabs>
    </div>
  );
};