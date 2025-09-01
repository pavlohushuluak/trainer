
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('adminAnalytics.traffic.mainPageViews')}</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trafficData?.totals.mainPageViews || 0}</div>
            <p className="text-xs text-muted-foreground">{t('adminAnalytics.traffic.mainPageVisits')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('adminAnalytics.traffic.homePageViews')}</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trafficData?.totals.homePageViews || 0}</div>
            <p className="text-xs text-muted-foreground">{t('adminAnalytics.traffic.homePageVisits')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('adminAnalytics.traffic.otherPageViews')}</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trafficData?.totals.otherPageViews || 0}</div>
            <p className="text-xs text-muted-foreground">{t('adminAnalytics.traffic.otherPageVisits')}</p>
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
      </div>

      {/* Traffic Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Page Views Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t('adminAnalytics.traffic.pageViewsOverview')}</CardTitle>
            <CardDescription>{t('adminAnalytics.traffic.pageViewsByType')}</CardDescription>
          </CardHeader>
          <CardContent>
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
        <Card>
          <CardHeader>
            <CardTitle>{t('adminAnalytics.traffic.uniqueUsersTrend')}</CardTitle>
            <CardDescription>{t('adminAnalytics.traffic.uniqueUsersOverTime')}</CardDescription>
          </CardHeader>
          <CardContent>
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
