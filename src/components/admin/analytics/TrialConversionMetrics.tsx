
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Loader2, UserPlus, TrendingUp, Target } from 'lucide-react';
import { useThemeContext } from '@/hooks/ThemeProvider';
import { useTranslation } from 'react-i18next';

interface TrialConversionMetricsProps {
  timeRange: string;
}

export const TrialConversionMetrics = ({ timeRange }: TrialConversionMetricsProps) => {
  const { t } = useTranslation();
  const { resolvedTheme } = useThemeContext();
  const { data: conversionData, isLoading } = useQuery({
    queryKey: ['conversion-metrics', timeRange],
    queryFn: async () => {
      const days = parseInt(timeRange);
      const now = new Date();
      const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

      // Get trial users and their conversion status
      const { data: subscribers } = await supabase
        .from('subscribers')
        .select('subscription_status, created_at, trial_end, subscribed')
        .gte('created_at', startDate.toISOString());

      const trialUsers = subscribers?.filter(s => s.subscription_status === 'trialing') || [];
      const convertedUsers = subscribers?.filter(s => s.subscribed === true) || [];
      const expiredTrials = subscribers?.filter(s => 
        s.trial_end && new Date(s.trial_end) < now && !s.subscribed
      ) || [];

      // Group by week for chart
      const weeklyData: { [week: string]: any } = {};
      
      subscribers?.forEach(sub => {
        const date = new Date(sub.created_at);
        const weekStart = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
        const weekKey = weekStart.toISOString().split('T')[0];
        
        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = {
            week: weekStart.toLocaleDateString('de-DE', { month: 'short', day: 'numeric' }),
            newTrials: 0,
            conversions: 0,
            conversionRate: 0
          };
        }

        if (sub.subscription_status === 'trialing') {
          weeklyData[weekKey].newTrials++;
        }
        if (sub.subscribed) {
          weeklyData[weekKey].conversions++;
        }
      });

      // Calculate conversion rates
      Object.values(weeklyData).forEach((week: any) => {
        week.conversionRate = week.newTrials > 0 ? 
          Math.round((week.conversions / week.newTrials) * 100) : 0;
      });

      const chartData = Object.values(weeklyData);

      // Pie chart data for conversion funnel with theme-aware colors
      const funnelData = [
        { name: t('adminAnalytics.trialConversion.activeTrialUsers'), value: trialUsers.length, fill: resolvedTheme === 'dark' ? '#8b5cf6' : '#8884d8' },
        { name: t('adminAnalytics.trialConversion.converted'), value: convertedUsers.length, fill: resolvedTheme === 'dark' ? '#10b981' : '#82ca9d' },
        { name: t('adminAnalytics.trialConversion.trialExpired'), value: expiredTrials.length, fill: resolvedTheme === 'dark' ? '#f59e0b' : '#ffc658' }
      ];

      const totalConversionRate = trialUsers.length > 0 ? 
        Math.round((convertedUsers.length / (trialUsers.length + convertedUsers.length + expiredTrials.length)) * 100) : 0;

      return {
        chartData,
        funnelData,
        totals: {
          newTrials: trialUsers.length,
          conversions: convertedUsers.length,
          conversionRate: totalConversionRate,
          expiredTrials: expiredTrials.length
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
    newTrials: {
      label: t('adminAnalytics.trialConversion.newTrials'),
      color: resolvedTheme === 'dark' ? "hsl(250, 95%, 60%)" : "hsl(var(--chart-1))",
    },
    conversions: {
      label: t('adminAnalytics.trialConversion.conversions'),
      color: resolvedTheme === 'dark' ? "hsl(142, 76%, 36%)" : "hsl(var(--chart-2))",
    },
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('adminAnalytics.trialConversion.newTrialUsers')}</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionData?.totals.newTrials || 0}</div>
            <p className="text-xs text-muted-foreground">{t('adminAnalytics.trialConversion.inTrial')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('adminAnalytics.trialConversion.conversions')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionData?.totals.conversions || 0}</div>
            <p className="text-xs text-muted-foreground">{t('adminAnalytics.trialConversion.trialToPaying')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('adminAnalytics.trialConversion.conversionRate')}</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionData?.totals.conversionRate || 0}%</div>
            <p className="text-xs text-muted-foreground">{t('adminAnalytics.trialConversion.successRate')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('adminAnalytics.trialConversion.expiredTrials')}</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionData?.totals.expiredTrials || 0}</div>
            <p className="text-xs text-muted-foreground">{t('adminAnalytics.trialConversion.notConverted')}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Conversion Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t('adminAnalytics.trialConversion.weeklyConversion')}</CardTitle>
            <CardDescription>{t('adminAnalytics.trialConversion.newTrialsAndConversions')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-80">
              <BarChart data={conversionData?.chartData || []}>
                <XAxis 
                  dataKey="week" 
                  tick={{ fill: resolvedTheme === 'dark' ? '#e5e7eb' : '#374151' }}
                  axisLine={{ stroke: resolvedTheme === 'dark' ? '#374151' : '#d1d5db' }}
                />
                <YAxis 
                  tick={{ fill: resolvedTheme === 'dark' ? '#e5e7eb' : '#374151' }}
                  axisLine={{ stroke: resolvedTheme === 'dark' ? '#374151' : '#d1d5db' }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="newTrials" fill={resolvedTheme === 'dark' ? '#8b5cf6' : '#8884d8'} name={t('adminAnalytics.trialConversion.newTrials')} />
                <Bar dataKey="conversions" fill={resolvedTheme === 'dark' ? '#10b981' : '#82ca9d'} name={t('adminAnalytics.trialConversion.conversions')} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>{t('adminAnalytics.trialConversion.conversionFunnel')}</CardTitle>
            <CardDescription>{t('adminAnalytics.trialConversion.userStatusDistribution')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={conversionData?.funnelData || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {conversionData?.funnelData?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    contentStyle={{
                      backgroundColor: resolvedTheme === 'dark' ? '#1f2937' : '#ffffff',
                      border: resolvedTheme === 'dark' ? '1px solid #374151' : '1px solid #d1d5db',
                      color: resolvedTheme === 'dark' ? '#e5e7eb' : '#374151'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
