
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
  Loader2
} from 'lucide-react';
import { TrafficMetrics } from './analytics/TrafficMetrics';
import { TrialConversionMetrics } from './analytics/TrialConversionMetrics';
import { SubscriberMetrics } from './analytics/SubscriberMetrics';
import { SupportMetrics } from './analytics/SupportMetrics';
import { MetricCard } from './analytics/MetricCard';
import { TimeRangeFilter } from './analytics/TimeRangeFilter';
import { useTranslation } from 'react-i18next';

export const AnalyticsDashboard = () => {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState('30');
  const [comparison, setComparison] = useState('previous_period');

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
        trialUsersResult,
        newSignupsResult,
        conversionsResult
      ] = await Promise.allSettled([
        // Total users
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        // Active subscribers
        supabase.from('subscribers').select('*', { count: 'exact', head: true }).eq('subscribed', true),
        // Trial users
        supabase.from('subscribers').select('*', { count: 'exact', head: true }).eq('subscription_status', 'trialing'),
        // New signups in time range
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', startDate).lte('created_at', endDate),
        // Conversion data
        supabase.from('subscribers').select('subscription_status, created_at').gte('created_at', startDate).lte('created_at', endDate)
      ]);

      // Extract results with fallbacks
      const totalUsers = totalUsersResult.status === 'fulfilled' ? totalUsersResult.value.count || 0 : 0;
      const activeSubscribers = activeSubscribersResult.status === 'fulfilled' ? activeSubscribersResult.value.count || 0 : 0;
      const trialUsers = trialUsersResult.status === 'fulfilled' ? trialUsersResult.value.count || 0 : 0;
      const newSignups = newSignupsResult.status === 'fulfilled' ? newSignupsResult.value.count || 0 : 0;

      // Calculate conversion rate with error handling
      let conversionRate = 0;
      if (conversionsResult.status === 'fulfilled' && conversionsResult.value.data) {
        const conversions = conversionsResult.value.data;
        const trialToActiveConversions = conversions.filter(s => s.subscription_status === 'active').length;
        const totalTrials = conversions.filter(s => s.subscription_status === 'trialing').length;
        conversionRate = totalTrials > 0 ? (trialToActiveConversions / totalTrials) * 100 : 0;
      }

      // Log any failures
      [totalUsersResult, activeSubscribersResult, trialUsersResult, newSignupsResult, conversionsResult].forEach((result, index) => {
        if (result.status === 'rejected') {
          const queryNames = ['totalUsers', 'activeSubscribers', 'trialUsers', 'newSignups', 'conversions'];
          console.warn(`❌ Failed to load ${queryNames[index]}:`, result.reason);
        }
      });

      return {
        totalUsers,
        activeSubscribers,
        trialUsers,
        newSignups,
        conversionRate: Math.round(conversionRate * 100) / 100
      };
    },
  });

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('adminAnalytics.title')}</h1>
          <p className="text-muted-foreground">
            {t('adminAnalytics.description')}
          </p>
        </div>
        <div className="flex gap-4">
          <TimeRangeFilter value={timeRange} onChange={setTimeRange} />
          <Select value={comparison} onValueChange={setComparison}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="previous_period">{t('adminAnalytics.comparison.previousPeriod')}</SelectItem>
              <SelectItem value="previous_year">{t('adminAnalytics.comparison.previousYear')}</SelectItem>
              <SelectItem value="no_comparison">{t('adminAnalytics.comparison.noComparison')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
          title={t('adminAnalytics.metrics.trialUsers')}
          value={overviewStats?.trialUsers || 0}
          icon={UserPlus}
          description={t('adminAnalytics.metrics.inTrial')}
        />
        <MetricCard
          title={t('adminAnalytics.metrics.newSignups')}
          value={overviewStats?.newSignups || 0}
          icon={TrendingUp}
          description={t('adminAnalytics.metrics.lastDays', { days: timeRange })}
        />
        <MetricCard
          title={t('adminAnalytics.metrics.conversionRate')}
          value={`${overviewStats?.conversionRate || 0}%`}
          icon={TrendingUp}
          description={t('adminAnalytics.metrics.trialToPaying')}
        />
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="traffic" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="traffic">{t('adminAnalytics.tabs.traffic')}</TabsTrigger>
          <TabsTrigger value="conversion">{t('adminAnalytics.tabs.conversion')}</TabsTrigger>
          <TabsTrigger value="subscribers">{t('adminAnalytics.tabs.subscribers')}</TabsTrigger>
          <TabsTrigger value="support">{t('adminAnalytics.tabs.support')}</TabsTrigger>
        </TabsList>

        <TabsContent value="traffic">
          <TrafficMetrics timeRange={timeRange} />
        </TabsContent>

        <TabsContent value="conversion">
          <TrialConversionMetrics timeRange={timeRange} />
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
