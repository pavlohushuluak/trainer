
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

      // Get all subscribers for comprehensive analysis
      const { data: allSubscribers } = await supabase
        .from('subscribers')
        .select('*')
        .order('created_at', { ascending: true });

      // Get subscribers within the selected time range (for summary metrics)
      const { data: subscribersInRange } = await supabase
        .from('subscribers')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

            // Get historical subscribers for chart data - filtered by selected time range (no future dates)
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      
      const { data: historicalSubscribers } = await supabase
        .from('subscribers')
        .select('*')
        .gte('created_at', startDate.toISOString()) // Filter by selected time range
        .lte('created_at', today.toISOString()) // Only up to today
        .order('created_at', { ascending: true });

      // Active subscribers within time range (this is the total for selected duration)
      const activeSubscribersInRange = subscribersInRange?.filter(s => s.subscription_status === 'active') || [];
      
      // Plan-specific subscribers within time range
      const plan1Subscribers = activeSubscribersInRange.filter(s => s.subscription_tier === 'plan1');
      const plan2Subscribers = activeSubscribersInRange.filter(s => s.subscription_tier === 'plan2');
      const plan3Subscribers = activeSubscribersInRange.filter(s => s.subscription_tier === 'plan3');
      const plan4Subscribers = activeSubscribersInRange.filter(s => s.subscription_tier === 'plan4');
      const plan5Subscribers = activeSubscribersInRange.filter(s => s.subscription_tier === 'plan5');
      
      // Monthly vs Yearly billing cycles within time range
      const monthlySubscribers = activeSubscribersInRange.filter(s => s.billing_cycle === 'monthly');
      const yearlySubscribers = activeSubscribersInRange.filter(s => s.billing_cycle === 'halfyearly');

              // Calculate churn within time range (subscribers whose current_period_end is within the selected time range and before today)
        const churnedSubscribers = subscribersInRange?.filter(s => 
          s.current_period_end && 
          new Date(s.current_period_end) >= startDate && 
          new Date(s.current_period_end) < today
        ) || [];

        // Get historical churn data for chart data - filtered by selected time range (no future dates)
        const { data: historicalChurned } = await supabase
          .from('subscribers')
          .select('*')
          .not('current_period_end', 'is', null)
          .gte('current_period_end', startDate.toISOString()) // Filter by selected time range
          .lte('current_period_end', today.toISOString()) // Only up to today
          .order('current_period_end', { ascending: true });

      // Dynamic graph granularity based on time range
      let timeGrouping: { [key: string]: any } = {};
      let timeKey: string;
      let displayLabel: string;

      if (days <= 7) {
        // Daily grouping for 7 days or less - use historical data up to today
        historicalSubscribers?.forEach(sub => {
          const date = new Date(sub.created_at);
          
          // Skip future dates
          if (date > today) return;
          
          timeKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
          displayLabel = date.toLocaleDateString(t('i18n.locale') === 'de' ? 'de-DE' : 'en-US', { month: 'short', day: 'numeric' });

          if (!timeGrouping[timeKey]) {
            timeGrouping[timeKey] = {
              period: displayLabel,
              timeKey: timeKey,
              newSubs: 0,
              churned: 0,
              netGrowth: 0,
              totalActive: 0,
              plan1: 0,
              plan2: 0,
              plan3: 0,
              plan4: 0,
              plan5: 0,
              total: 0
            };
          }

          if (sub.subscription_status === 'active') {
            timeGrouping[timeKey].newSubs++;

            // Track plan-specific growth
            if (sub.subscription_tier === 'plan1') timeGrouping[timeKey].plan1++;
            if (sub.subscription_tier === 'plan2') timeGrouping[timeKey].plan2++;
            if (sub.subscription_tier === 'plan3') timeGrouping[timeKey].plan3++;
            if (sub.subscription_tier === 'plan4') timeGrouping[timeKey].plan4++;
            if (sub.subscription_tier === 'plan5') timeGrouping[timeKey].plan5++;
          }
        });
      } else if (days <= 30) {
        // Weekly grouping for 30 days or less - use historical data up to today
        historicalSubscribers?.forEach(sub => {
          const date = new Date(sub.created_at);
          
          // Skip future dates
          if (date > today) return;
          
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
          timeKey = `${weekStart.getFullYear()}-${(weekStart.getMonth() + 1).toString().padStart(2, '0')}-${weekStart.getDate().toString().padStart(2, '0')}`;
          displayLabel = `Week ${weekStart.toLocaleDateString(t('i18n.locale') === 'de' ? 'de-DE' : 'en-US', { month: 'short', day: 'numeric' })}`;

          if (!timeGrouping[timeKey]) {
            timeGrouping[timeKey] = {
              period: displayLabel,
              timeKey: timeKey,
              newSubs: 0,
              churned: 0,
              netGrowth: 0,
              totalActive: 0,
              plan1: 0,
              plan2: 0,
              plan3: 0,
              plan4: 0,
              plan5: 0,
              total: 0
            };
          }

          if (sub.subscription_status === 'active') {
            timeGrouping[timeKey].newSubs++;

            // Track plan-specific growth
            if (sub.subscription_tier === 'plan1') timeGrouping[timeKey].plan1++;
            if (sub.subscription_tier === 'plan2') timeGrouping[timeKey].plan2++;
            if (sub.subscription_tier === 'plan3') timeGrouping[timeKey].plan3++;
            if (sub.subscription_tier === 'plan4') timeGrouping[timeKey].plan4++;
            if (sub.subscription_tier === 'plan5') timeGrouping[timeKey].plan5++;
          }
        });
      } else {
        // Monthly grouping for longer periods - use historical data up to today
        historicalSubscribers?.forEach(sub => {
          const date = new Date(sub.created_at);
          
          // Skip future dates
          if (date > today) return;
          
          timeKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
          displayLabel = date.toLocaleDateString(t('i18n.locale') === 'de' ? 'de-DE' : 'en-US', { year: 'numeric', month: 'short' });

          if (!timeGrouping[timeKey]) {
            timeGrouping[timeKey] = {
              period: displayLabel,
              timeKey: timeKey,
              newSubs: 0,
              churned: 0,
              netGrowth: 0,
              totalActive: 0,
              plan1: 0,
              plan2: 0,
              plan3: 0,
              plan4: 0,
              plan5: 0,
              total: 0
            };
          }

          if (sub.subscription_status === 'active') {
            timeGrouping[timeKey].newSubs++;

            // Track plan-specific growth
            if (sub.subscription_tier === 'plan1') timeGrouping[timeKey].plan1++;
            if (sub.subscription_tier === 'plan2') timeGrouping[timeKey].plan2++;
            if (sub.subscription_tier === 'plan3') timeGrouping[timeKey].plan3++;
            if (sub.subscription_tier === 'plan4') timeGrouping[timeKey].plan4++;
            if (sub.subscription_tier === 'plan5') timeGrouping[timeKey].plan5++;
          }
        });
      }

              // Add churn data - ensure time grouping exists for churn dates
        // Use historical churn data up to today for complete chart representation
        historicalChurned?.forEach(sub => {
          if (sub.current_period_end) {
            const date = new Date(sub.current_period_end);
            
            // Skip future churn dates
            if (date > today) return;
            
            let churnTimeKey: string;
            let churnDisplayLabel: string;

            if (days <= 7) {
              churnTimeKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
              churnDisplayLabel = date.toLocaleDateString(t('i18n.locale') === 'de' ? 'de-DE' : 'en-US', { month: 'short', day: 'numeric' });
            } else if (days <= 30) {
              const weekStart = new Date(date);
              weekStart.setDate(date.getDate() - date.getDay());
              churnTimeKey = `${weekStart.getFullYear()}-${(weekStart.getMonth() + 1).toString().padStart(2, '0')}-${weekStart.getDate().toString().padStart(2, '0')}`;
              churnDisplayLabel = `Week ${weekStart.toLocaleDateString(t('i18n.locale') === 'de' ? 'de-DE' : 'en-US', { month: 'short', day: 'numeric' })}`;
            } else {
              churnTimeKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
              churnDisplayLabel = date.toLocaleDateString(t('i18n.locale') === 'de' ? 'de-DE' : 'en-US', { year: 'numeric', month: 'short' });
            }

            // Create time grouping entry if it doesn't exist for churn dates
            if (!timeGrouping[churnTimeKey]) {
              timeGrouping[churnTimeKey] = {
                period: churnDisplayLabel,
                timeKey: churnTimeKey,
                newSubs: 0,
                churned: 0,
                netGrowth: 0,
                totalActive: 0,
                plan1: 0,
                plan2: 0,
                plan3: 0,
                plan4: 0,
                plan5: 0,
                total: 0
              };
            }

            timeGrouping[churnTimeKey].churned++;
          }
        });

              // Debug logging to check churn data
        console.log('Time grouping after churn processing:', timeGrouping);
        console.log('Historical churned data (using current_period_end):', historicalChurned);
        console.log('Churned subscribers count:', churnedSubscribers.length);
        
        // Debug: Log churned subscriber details
        console.log('Churned subscribers details:', churnedSubscribers.map(s => ({
          id: s.id,
          current_period_end: s.current_period_end,
          subscription_status: s.subscription_status,
          subscription_tier: s.subscription_tier
        })));
        
        // Debug: Verify data source consistency
        console.log('Data source verification:', {
          subscribersInRangeCount: subscribersInRange?.length || 0,
          historicalSubscribersCount: historicalSubscribers?.length || 0,
          historicalChurnedCount: historicalChurned?.length || 0,
          startDate: startDate.toISOString(),
          today: today.toISOString(),
          selectedDays: days
        });

      // Calculate net growth, running total, and update total field
      let runningTotal = 0;
      let cumulativeTotal = 0; // Separate counter for total that doesn't subtract churn
      Object.values(timeGrouping).forEach((period: any) => {
        period.netGrowth = period.newSubs - period.churned;
        runningTotal += period.netGrowth;
        period.totalActive = runningTotal;
        
        // For Plan Subscription Trends graph: total should be cumulative active subscribers without churn reduction
        cumulativeTotal += period.newSubs; // Only add new subscribers, don't subtract churn
        period.total = cumulativeTotal;
        
        // Debug logging for each period
        if (period.churned > 0) {
          console.log(`Period ${period.period} has churned: ${period.churned}`);
        }
        
        // Debug: Log total calculation for verification
        console.log(`Period ${period.period}: newSubs=${period.newSubs}, churned=${period.churned}, netGrowth=${period.netGrowth}, totalActive=${period.totalActive}, total=${period.total}`);
      });

      // Sort chart data by time key for proper chronological order
      const chartData = Object.values(timeGrouping).sort((a, b) => {
        return a.timeKey.localeCompare(b.timeKey);
      });

      // Debug logging to check final chart data
      console.log('Final chart data:', chartData);
      console.log('Churn values in chart data:', chartData.map(item => ({ period: item.period, churned: item.churned })));
      
      // Summary of churn data
      const totalChurnedInChart = chartData.reduce((sum, item) => sum + (item.churned || 0), 0);
      console.log(`Total churned in chart data: ${totalChurnedInChart}`);
      console.log(`Total churned from summary: ${churnedSubscribers.length}`);

      // Plan distribution with theme-aware colors
      const planDistribution = [
        { name: t('adminAnalytics.subscribers.plan1'), value: plan1Subscribers.length, fill: resolvedTheme === 'dark' ? '#8b5cf6' : '#8884d8' },
        { name: t('adminAnalytics.subscribers.plan2'), value: plan2Subscribers.length, fill: resolvedTheme === 'dark' ? '#10b981' : '#82ca9d' },
        { name: t('adminAnalytics.subscribers.plan3'), value: plan3Subscribers.length, fill: resolvedTheme === 'dark' ? '#f59e0b' : '#ffc658' },
        { name: t('adminAnalytics.subscribers.plan4'), value: plan4Subscribers.length, fill: resolvedTheme === 'dark' ? '#ef4444' : '#ff7c7c' },
        { name: t('adminAnalytics.subscribers.plan5'), value: plan5Subscribers.length, fill: resolvedTheme === 'dark' ? '#06b6d4' : '#8dd1e1' }
      ];

      // Calculate churn rate
      const churnRate = activeSubscribersInRange.length > 0 ?
        Math.round((churnedSubscribers.length / (activeSubscribersInRange.length + churnedSubscribers.length)) * 100) : 0;

      return {
        chartData,
        planDistribution,
        totals: {
          activeSubscribers: activeSubscribersInRange.length,
          plan1Subscribers: plan1Subscribers.length,
          plan2Subscribers: plan2Subscribers.length,
          plan3Subscribers: plan3Subscribers.length,
          plan4Subscribers: plan4Subscribers.length,
          plan5Subscribers: plan5Subscribers.length,
          monthlySubscribers: monthlySubscribers.length,
          yearlySubscribers: yearlySubscribers.length,
          churnedSubscribers: churnedSubscribers.length,
          churnRate,
          netGrowth: activeSubscribersInRange.length - churnedSubscribers.length
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-600 dark:text-purple-400">{t('adminAnalytics.subscribers.plan1')}</CardTitle>
            <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{subscriberData?.totals.plan1Subscribers || 0}</div>
            <p className="text-xs text-muted-foreground">{t('adminAnalytics.subscribers.plan1Limit')}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">{t('adminAnalytics.subscribers.plan2')}</CardTitle>
            <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{subscriberData?.totals.plan2Subscribers || 0}</div>
            <p className="text-xs text-muted-foreground">{t('adminAnalytics.subscribers.plan2Limit')}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-400">{t('adminAnalytics.subscribers.plan3')}</CardTitle>
            <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{subscriberData?.totals.plan3Subscribers || 0}</div>
            <p className="text-xs text-muted-foreground">{t('adminAnalytics.subscribers.plan3Limit')}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">{t('adminAnalytics.subscribers.plan4')}</CardTitle>
            <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{subscriberData?.totals.plan4Subscribers || 0}</div>
            <p className="text-xs text-muted-foreground">{t('adminAnalytics.subscribers.plan4Limit')}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-cyan-600 dark:text-cyan-400">{t('adminAnalytics.subscribers.plan5')}</CardTitle>
            <div className="h-8 w-8 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{subscriberData?.totals.plan5Subscribers || 0}</div>
            <p className="text-xs text-muted-foreground">{t('adminAnalytics.subscribers.plan5Limit')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Plan 5 and Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <Card className="hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">{t('adminAnalytics.subscribers.totalSubscribers')}</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{subscriberData?.totals.activeSubscribers || 0}</div>
            <p className="text-xs text-muted-foreground">{t('adminAnalytics.subscribers.activePayingCustomers')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('adminAnalytics.subscribers.churnRate')}</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriberData?.totals.churnRate || 0}%</div>
            <p className="text-xs text-muted-foreground">{t('adminAnalytics.subscribers.totalChurned', { count: subscriberData?.totals.churnedSubscribers || 0 })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('adminAnalytics.subscribers.monthlyBilling')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriberData?.totals.monthlySubscribers || 0}</div>
            <p className="text-xs text-muted-foreground">{t('adminAnalytics.subscribers.monthlySubscribers')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('adminAnalytics.subscribers.sixMonthBilling')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriberData?.totals.yearlySubscribers || 0}</div>
            <p className="text-xs text-muted-foreground">{t('adminAnalytics.subscribers.sixMonthSubscribers')}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscriber Growth Chart */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-t-lg">
            <CardTitle className="text-purple-700 dark:text-purple-300">{t('adminAnalytics.subscribers.subscriberGrowthAndChurn')}</CardTitle>
            <CardDescription className="text-purple-600 dark:text-purple-400">{t('adminAnalytics.subscribers.monthlyGrowthChurnNetChanges')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart data={subscriberData?.chartData || []}>
                <XAxis
                  dataKey="period"
                  tick={{ fill: resolvedTheme === 'dark' ? '#e5e7eb' : '#374151' }}
                  axisLine={{ stroke: resolvedTheme === 'dark' ? '#374151' : '#d1d5db' }}
                />
                <YAxis
                  tick={{ fill: resolvedTheme === 'dark' ? '#e5e7eb' : '#374151' }}
                  axisLine={{ stroke: resolvedTheme === 'dark' ? '#374151' : '#d1d5db' }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="newSubs" fill={resolvedTheme === 'dark' ? '#8b5cf6' : '#8884d8'} name={t('adminAnalytics.subscribers.newSubscribers')} />
                <Bar dataKey="churned" fill={resolvedTheme === 'dark' ? '#ef4444' : '#ff7c7c'} name={t('adminAnalytics.subscribers.churned')} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Active Subscribers Trend */}
        {/* <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-t-lg">
            <CardTitle className="text-green-700 dark:text-green-300">{t('adminAnalytics.subscribers.totalActiveSubscribersTrend')}</CardTitle>
            <CardDescription className="text-green-600 dark:text-green-400">{t('adminAnalytics.subscribers.growthOfActiveSubscribersOverTime')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <LineChart data={subscriberData?.chartData || []}>
                <XAxis 
                  dataKey="period" 
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
                  name={t('adminAnalytics.subscribers.totalActive')}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card> */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-t-lg">
            <CardTitle className="text-amber-700 dark:text-amber-300">{t('adminAnalytics.subscribers.planSubscriptionTrends')}</CardTitle>
            <CardDescription className="text-amber-600 dark:text-amber-400">{t('adminAnalytics.subscribers.growthOfEachSubscriptionPlanOverTime')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <LineChart data={subscriberData?.chartData || []}>
                <XAxis
                  dataKey="period"
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
                  dataKey="plan1"
                  stroke={resolvedTheme === 'dark' ? '#8b5cf6' : '#8884d8'}
                  strokeWidth={2}
                  name={t('adminAnalytics.subscribers.plan1')}
                />
                <Line
                  type="monotone"
                  dataKey="plan2"
                  stroke={resolvedTheme === 'dark' ? '#10b981' : '#82ca9d'}
                  strokeWidth={2}
                  name={t('adminAnalytics.subscribers.plan2')}
                />
                <Line
                  type="monotone"
                  dataKey="plan3"
                  stroke={resolvedTheme === 'dark' ? '#f59e0b' : '#ff7c7c'}
                  strokeWidth={2}
                  name={t('adminAnalytics.subscribers.plan3')}
                />
                <Line
                  type="monotone"
                  dataKey="plan4"
                  stroke={resolvedTheme === 'dark' ? '#ef4444' : '#ff7c7c'}
                  strokeWidth={2}
                  name={t('adminAnalytics.subscribers.plan4')}
                />
                <Line
                  type="monotone"
                  dataKey="plan5"
                  stroke={resolvedTheme === 'dark' ? '#06b6d4' : '#8dd1e1'}
                  strokeWidth={2}
                  name={t('adminAnalytics.subscribers.plan5')}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke={resolvedTheme === 'dark' ? '#fbbf24' : '#f59e0b'}
                  strokeWidth={4}
                  strokeDasharray="8 4"
                  dot={{ fill: resolvedTheme === 'dark' ? '#fbbf24' : '#f59e0b', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: resolvedTheme === 'dark' ? '#fbbf24' : '#f59e0b', strokeWidth: 2 }}
                  name={t('adminAnalytics.subscribers.totalAllPlans')}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
