
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Loader2, Eye, Users, UserCheck } from 'lucide-react';
import { useThemeContext } from '@/hooks/ThemeProvider';
import { useTranslation } from 'react-i18next';

interface TrafficMetricsProps {
  timeRange: string;
}

export const TrafficMetrics = ({ timeRange }: TrafficMetricsProps) => {
  const { t } = useTranslation();
  const { resolvedTheme } = useThemeContext();
  const { data: trafficData, isLoading } = useQuery({
    queryKey: ['traffic-metrics', timeRange],
    queryFn: async () => {
      const days = parseInt(timeRange);
      const now = new Date();
      const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

      // Get analytics events grouped by day
      const { data: events, error } = await supabase
        .from('analytics_events')
        .select('event_type, created_at, user_id')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) {
        console.warn('Error fetching analytics events:', error);
        return {
          chartData: [],
          totals: {
            pageViews: 0,
            uniqueUsers: 0,
            trialStarts: 0
          }
        };
      }

      // Group by date and calculate metrics
      const dailyStats: { [date: string]: any } = {};
      
      events?.forEach(event => {
        const date = new Date(event.created_at).toISOString().split('T')[0];
        if (!dailyStats[date]) {
          dailyStats[date] = {
            date,
            pageViews: 0,
            uniqueUsers: new Set(),
            trialStarts: 0,
            subscriptionCreated: 0
          };
        }

        if (event.event_type === 'page_view') {
          dailyStats[date].pageViews++;
        }
        if (event.event_type === 'trial_started') {
          dailyStats[date].trialStarts++;
        }
        if (event.event_type === 'subscription_created') {
          dailyStats[date].subscriptionCreated++;
        }
        
        if (event.user_id) {
          dailyStats[date].uniqueUsers.add(event.user_id);
        }
      });

      // Convert to array and format
      const chartData = Object.values(dailyStats).map(day => ({
        date: new Date(day.date).toLocaleDateString('de-DE', { month: 'short', day: 'numeric' }),
        pageViews: day.pageViews,
        uniqueUsers: day.uniqueUsers.size,
        trialStarts: day.trialStarts,
        subscriptionCreated: day.subscriptionCreated
      }));

      // Calculate totals
      const totalPageViews = events?.filter(e => e.event_type === 'page_view').length || 0;
      const uniqueUsersCount = new Set(events?.map(e => e.user_id).filter(Boolean)).size;
      const totalTrialStarts = events?.filter(e => e.event_type === 'trial_started').length || 0;

      return {
        chartData,
        totals: {
          pageViews: totalPageViews,
          uniqueUsers: uniqueUsersCount,
          trialStarts: totalTrialStarts
        }
      };
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const chartConfig = {
    pageViews: {
      label: t('adminAnalytics.traffic.pageViews'),
      color: resolvedTheme === 'dark' ? "hsl(250, 95%, 60%)" : "hsl(var(--chart-1))",
    },
    uniqueUsers: {
      label: t('adminAnalytics.traffic.uniqueUsers'),
      color: resolvedTheme === 'dark' ? "hsl(142, 76%, 36%)" : "hsl(var(--chart-2))",
    },
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('adminAnalytics.traffic.pageViews')}</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trafficData?.totals.pageViews || 0}</div>
            <p className="text-xs text-muted-foreground">{t('adminAnalytics.traffic.totalViews')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('adminAnalytics.traffic.uniqueUsers')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trafficData?.totals.uniqueUsers || 0}</div>
            <p className="text-xs text-muted-foreground">{t('adminAnalytics.traffic.differentVisitors')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('adminAnalytics.traffic.trialStarted')}</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trafficData?.totals.trialStarts || 0}</div>
            <p className="text-xs text-muted-foreground">{t('adminAnalytics.traffic.newTrialUsers')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{t('adminAnalytics.traffic.trafficTrend')}</CardTitle>
          <CardDescription>{t('adminAnalytics.traffic.trafficDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80">
            <LineChart data={trafficData?.chartData || []}>
              <XAxis 
                dataKey="date" 
                tick={{ fill: resolvedTheme === 'dark' ? '#e5e7eb' : '#374151' }}
                axisLine={{ stroke: resolvedTheme === 'dark' ? '#374151' : '#d1d5db' }}
              />
              <YAxis 
                tick={{ fill: resolvedTheme === 'dark' ? '#e5e7eb' : '#374151' }}
                axisLine={{ stroke: resolvedTheme === 'dark' ? '#374151' : '#d1d5db' }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="pageViews" 
                stroke={resolvedTheme === 'dark' ? '#8b5cf6' : '#8884d8'} 
                strokeWidth={2}
                name={t('adminAnalytics.traffic.pageViews')}
              />
              <Line 
                type="monotone" 
                dataKey="uniqueUsers" 
                stroke={resolvedTheme === 'dark' ? '#10b981' : '#82ca9d'} 
                strokeWidth={2}
                name={t('adminAnalytics.traffic.uniqueUsers')}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};
