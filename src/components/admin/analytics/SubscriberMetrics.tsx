
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, BarChart, Bar } from 'recharts';
import { Loader2, DollarSign, Users, TrendingDown, TrendingUp } from 'lucide-react';
import { useThemeContext } from '@/hooks/ThemeProvider';
import { useTranslation } from 'react-i18next';

interface SubscriberMetricsProps {
  timeRange: string;
}

export const SubscriberMetrics = ({ timeRange }: SubscriberMetricsProps) => {
  const { t } = useTranslation();
  const { resolvedTheme } = useThemeContext();
  const { data: subscriberData, isLoading } = useQuery({
    queryKey: ['subscriber-metrics', timeRange],
    queryFn: async () => {
      const days = parseInt(timeRange);
      const now = new Date();
      const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

      // Get all subscribers
      const { data: subscribers } = await supabase
        .from('subscribers')
        .select('*')
        .order('created_at', { ascending: true });

      // Active subscribers
      const activeSubscribers = subscribers?.filter(s => s.subscribed) || [];
      
      // Monthly vs Yearly plans
      const monthlySubscribers = activeSubscribers.filter(s => s.billing_cycle === 'monthly');
      const yearlySubscribers = activeSubscribers.filter(s => s.billing_cycle === 'yearly');

      // Calculate churn (subscribers who were active but now inactive)
      const churnedSubscribers = subscribers?.filter(s => 
        !s.subscribed && s.subscription_end && new Date(s.subscription_end) >= startDate
      ) || [];

      // Group by month for growth chart
      const monthlyGrowth: { [month: string]: any } = {};
      
      subscribers?.forEach(sub => {
        const date = new Date(sub.created_at);
        const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        
        if (!monthlyGrowth[monthKey]) {
          monthlyGrowth[monthKey] = {
            month: date.toLocaleDateString('de-DE', { year: 'numeric', month: 'short' }),
            newSubs: 0,
            churned: 0,
            netGrowth: 0,
            totalActive: 0
          };
        }

        if (sub.subscribed) {
          monthlyGrowth[monthKey].newSubs++;
        }
      });

      // Add churn data
      churnedSubscribers.forEach(sub => {
        if (sub.subscription_end) {
          const date = new Date(sub.subscription_end);
          const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
          
          if (monthlyGrowth[monthKey]) {
            monthlyGrowth[monthKey].churned++;
          }
        }
      });

      // Calculate net growth and running total
      let runningTotal = 0;
      Object.values(monthlyGrowth).forEach((month: any) => {
        month.netGrowth = month.newSubs - month.churned;
        runningTotal += month.netGrowth;
        month.totalActive = runningTotal;
      });

      const chartData = Object.values(monthlyGrowth);

      // Plan distribution with theme-aware colors
      const planDistribution = [
        { name: t('adminAnalytics.subscribers.monthly'), value: monthlySubscribers.length, fill: resolvedTheme === 'dark' ? '#8b5cf6' : '#8884d8' },
        { name: t('adminAnalytics.subscribers.yearly'), value: yearlySubscribers.length, fill: resolvedTheme === 'dark' ? '#10b981' : '#82ca9d' }
      ];

      // Calculate churn rate
      const churnRate = activeSubscribers.length > 0 ? 
        Math.round((churnedSubscribers.length / (activeSubscribers.length + churnedSubscribers.length)) * 100) : 0;

      return {
        chartData,
        planDistribution,
        totals: {
          activeSubscribers: activeSubscribers.length,
          monthlySubscribers: monthlySubscribers.length,
          yearlySubscribers: yearlySubscribers.length,
          churnedSubscribers: churnedSubscribers.length,
          churnRate,
          netGrowth: activeSubscribers.length - churnedSubscribers.length
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
    newSubs: {
      label: t('adminAnalytics.subscribers.growth'),
      color: resolvedTheme === 'dark' ? "hsl(250, 95%, 60%)" : "hsl(var(--chart-1))",
    },
    churned: {
      label: t('adminAnalytics.subscribers.churn'),
      color: resolvedTheme === 'dark' ? "hsl(0, 84%, 60%)" : "hsl(var(--chart-2))",
    },
    totalActive: {
      label: t('adminAnalytics.subscribers.activeSubscribers'),
      color: resolvedTheme === 'dark' ? "hsl(142, 76%, 36%)" : "hsl(var(--chart-3))",
    },
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('adminAnalytics.subscribers.activeSubscribers')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriberData?.totals.activeSubscribers || 0}</div>
            <p className="text-xs text-muted-foreground">{t('adminAnalytics.metrics.payingCustomers')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('adminAnalytics.subscribers.churnRate')}</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriberData?.totals.churnRate || 0}%</div>
            <p className="text-xs text-muted-foreground">{t('adminAnalytics.subscribers.churnRate')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('adminAnalytics.subscribers.monthlySubscribers')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriberData?.totals.monthlySubscribers || 0}</div>
            <p className="text-xs text-muted-foreground">{t('adminAnalytics.subscribers.monthly')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('adminAnalytics.subscribers.yearlySubscribers')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriberData?.totals.yearlySubscribers || 0}</div>
            <p className="text-xs text-muted-foreground">{t('adminAnalytics.subscribers.yearly')}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscriber Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t('adminAnalytics.subscribers.growth')}</CardTitle>
            <CardDescription>{t('adminAnalytics.subscribers.growth')}, {t('adminAnalytics.subscribers.churn')} und Netto-Wachstum</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart data={subscriberData?.chartData || []}>
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: resolvedTheme === 'dark' ? '#e5e7eb' : '#374151' }}
                  axisLine={{ stroke: resolvedTheme === 'dark' ? '#374151' : '#d1d5db' }}
                />
                <YAxis 
                  tick={{ fill: resolvedTheme === 'dark' ? '#e5e7eb' : '#374151' }}
                  axisLine={{ stroke: resolvedTheme === 'dark' ? '#374151' : '#d1d5db' }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="newSubs" fill={resolvedTheme === 'dark' ? '#8b5cf6' : '#8884d8'} name={t('adminAnalytics.subscribers.growth')} />
                <Bar dataKey="churned" fill={resolvedTheme === 'dark' ? '#ef4444' : '#82ca9d'} name={t('adminAnalytics.subscribers.churn')} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Active Subscribers Trend */}
        <Card>
          <CardHeader>
            <CardTitle>{t('adminAnalytics.subscribers.activeSubscribers')} Trend</CardTitle>
            <CardDescription>Entwicklung der aktiven Abonnenten über Zeit</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <LineChart data={subscriberData?.chartData || []}>
                <XAxis 
                  dataKey="month" 
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
                  dataKey="totalActive" 
                  stroke={resolvedTheme === 'dark' ? '#10b981' : '#82ca9d'} 
                  strokeWidth={3}
                  name={t('adminAnalytics.subscribers.activeSubscribers')}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
