
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Loader2, Eye, Users, Home, Globe } from 'lucide-react';
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
            mainPageViews: 0,
            homePageViews: 0,
            otherPageViews: 0,
            uniqueUsers: 0
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
            mainPageViews: 0,
            homePageViews: 0,
            otherPageViews: 0,
            uniqueUsers: new Set()
          };
        }

        if (event.event_type === 'mainpage_view') {
          dailyStats[date].mainPageViews++;
        }
        if (event.event_type === 'homepage_view') {
          dailyStats[date].homePageViews++;
        }
        if (event.event_type === 'page_view') {
          dailyStats[date].otherPageViews++;
        }
        
        if (event.user_id) {
          dailyStats[date].uniqueUsers.add(event.user_id);
        }
      });

      // Convert to array and format
      const chartData = Object.values(dailyStats).map(day => {
        // Create date in local timezone to avoid UTC conversion issues
        const [year, month, dayOfMonth] = day.date.split('-').map(Number);
        const localDate = new Date(year, month - 1, dayOfMonth); // month is 0-indexed
        const formattedDate = localDate.toLocaleDateString('de-DE', { month: 'short', day: 'numeric' });
        
        return {
          date: formattedDate,
          mainPageViews: day.mainPageViews,
          homePageViews: day.homePageViews,
          otherPageViews: day.otherPageViews,
          uniqueUsers: day.uniqueUsers.size
        };
      });

      // Calculate totals
      const totalMainPageViews = events?.filter(e => e.event_type === 'mainpage_view').length || 0;
      const totalHomePageViews = events?.filter(e => e.event_type === 'homepage_view').length || 0;
      const totalOtherPageViews = events?.filter(e => e.event_type === 'page_view').length || 0;
      const uniqueUsersCount = new Set(events?.map(e => e.user_id).filter(Boolean)).size;

      return {
        chartData,
        totals: {
          mainPageViews: totalMainPageViews,
          homePageViews: totalHomePageViews,
          otherPageViews: totalOtherPageViews,
          uniqueUsers: uniqueUsersCount
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
    mainPageViews: {
      label: t('adminAnalytics.traffic.mainPageViews'),
      color: resolvedTheme === 'dark' ? "hsl(250, 95%, 60%)" : "hsl(var(--chart-1))",
    },
    homePageViews: {
      label: t('adminAnalytics.traffic.homePageViews'),
      color: resolvedTheme === 'dark' ? "hsl(142, 76%, 36%)" : "hsl(var(--chart-2))",
    },
    otherPageViews: {
      label: t('adminAnalytics.traffic.otherPageViews'),
      color: resolvedTheme === 'dark' ? "hsl(59, 93%, 58%)" : "hsl(var(--chart-3))",
    },
    uniqueUsers: {
      label: t('adminAnalytics.traffic.uniqueUsers'),
      color: resolvedTheme === 'dark' ? "hsl(15, 100%, 50%)" : "hsl(var(--chart-4))",
    },
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">{t('adminAnalytics.traffic.mainPageViews')}</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{trafficData?.totals.mainPageViews || 0}</div>
            <p className="text-xs text-blue-600 dark:text-blue-400">{t('adminAnalytics.traffic.mainPageVisits')}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">{t('adminAnalytics.traffic.homePageViews')}</CardTitle>
            <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Home className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">{trafficData?.totals.homePageViews || 0}</div>
            <p className="text-xs text-green-600 dark:text-green-400">{t('adminAnalytics.traffic.homePageVisits')}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300">{t('adminAnalytics.traffic.otherPageViews')}</CardTitle>
            <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Globe className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">{trafficData?.totals.otherPageViews || 0}</div>
            <p className="text-xs text-amber-600 dark:text-amber-400">{t('adminAnalytics.traffic.otherPageVisits')}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">{t('adminAnalytics.traffic.uniqueUsers')}</CardTitle>
            <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{trafficData?.totals.uniqueUsers || 0}</div>
            <p className="text-xs text-purple-600 dark:text-purple-400">{t('adminAnalytics.traffic.differentVisitors')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Page Views Bar Chart */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-t-lg">
            <CardTitle className="text-blue-900 dark:text-blue-100">{t('adminAnalytics.traffic.pageViewsOverview')}</CardTitle>
            <CardDescription className="text-blue-600 dark:text-blue-400">{t('adminAnalytics.traffic.pageViewsByType')}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ChartContainer config={chartConfig}>
              <BarChart data={trafficData?.chartData || []}>
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
                <Bar 
                  dataKey="mainPageViews" 
                  fill={resolvedTheme === 'dark' ? '#8b5cf6' : '#8884d8'}
                  name={t('adminAnalytics.traffic.mainPageViews')}
                />
                <Bar 
                  dataKey="homePageViews" 
                  fill={resolvedTheme === 'dark' ? '#10b981' : '#82ca9d'}
                  name={t('adminAnalytics.traffic.homePageViews')}
                />
                <Bar 
                  dataKey="otherPageViews" 
                  fill={resolvedTheme === 'dark' ? '#fbbf24' : '#fbbf24'}
                  name={t('adminAnalytics.traffic.otherPageViews')}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Unique Users Line Chart */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-t-lg">
            <CardTitle className="text-green-900 dark:text-green-100">{t('adminAnalytics.traffic.uniqueUsersTrend')}</CardTitle>
            <CardDescription className="text-green-600 dark:text-green-400">{t('adminAnalytics.traffic.uniqueUsersOverTime')}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ChartContainer config={chartConfig}>
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
                  dataKey="uniqueUsers" 
                  stroke={resolvedTheme === 'dark' ? '#f97316' : '#f97316'} 
                  strokeWidth={2}
                  name={t('adminAnalytics.traffic.uniqueUsers')}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
