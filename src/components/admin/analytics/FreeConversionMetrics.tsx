
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Loader2, UserPlus, TrendingUp, Target } from 'lucide-react';
import { useThemeContext } from '@/hooks/ThemeProvider';
import { useTranslation } from 'react-i18next';

interface FreeConversionMetricsProps {
  timeRange: string;
}

export const FreeConversionMetrics = ({ timeRange }: FreeConversionMetricsProps) => {
  const { t } = useTranslation();
  const { resolvedTheme } = useThemeContext();
  const { data: conversionData, isLoading } = useQuery({
    queryKey: ['free-conversion-metrics', timeRange],
    queryFn: async () => {
      const days = parseInt(timeRange);
      const now = new Date();
      const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

      // Get free users and their conversion status
      const { data: subscribers } = await supabase
        .from('subscribers')
        .select('subscription_status, created_at, subscribed, questions_num, subscription_tier')
        .gte('created_at', startDate.toISOString());

      // Free users are those who are not subscribed and have used some questions
      const freeUsers = subscribers?.filter(s => 
        s.subscription_tier === 'free'
      ) || [];
      
      // Converted users are those who became paying customers
      const convertedUsers = subscribers?.filter(s => s.subscription_tier !== 'free') || [];
      
      // Free users who haven't converted (still using free tier)
      const activeFreeUsers = subscribers?.filter(s => 
        s.subscription_tier === 'free'
      ) || [];
      
      // Free users who have reached their limit but haven't converted
      const limitReachedUsers = subscribers?.filter(s => 
        s.subscription_tier === 'free' && s.questions_num && s.questions_num >= 10
      ) || [];

      // Group by week for chart
      const weeklyData: { [week: string]: any } = {};
      
      subscribers?.forEach(sub => {
        const date = new Date(sub.created_at);
        const weekStart = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
        const weekKey = weekStart.toISOString().split('T')[0];
        
        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = {
            week: weekStart.toLocaleDateString(t('i18n.locale') === 'de' ? 'de-DE' : 'en-US', { month: 'short', day: 'numeric' }),
            weekKey: weekKey, // Store the actual week key for sorting
            newFreeUsers: 0,
            conversions: 0,
            conversionRate: 0
          };
        }

        if (sub.subscription_tier === 'free') {
          weeklyData[weekKey].newFreeUsers++;
        }
        if (sub.subscription_tier !== 'free') {
          weeklyData[weekKey].conversions++;
        }
      });

      // Calculate conversion rates
      Object.values(weeklyData).forEach((week: any) => {
        week.conversionRate = week.newFreeUsers > 0 ? 
          Math.round((week.conversions / week.newFreeUsers) * 100) : 0;
      });

      // Convert to array and sort by date (week key)
      const chartData = Object.values(weeklyData).sort((a, b) => {
        // Sort by weekKey which contains the actual date string (YYYY-MM-DD format)
        return a.weekKey.localeCompare(b.weekKey);
      });

      // Pie chart data for conversion funnel with theme-aware colors
      const funnelData = [
        { name: t('adminAnalytics.freeConversion.activeFreeUsers'), value: activeFreeUsers.length, fill: resolvedTheme === 'dark' ? '#8b5cf6' : '#8884d8' },
        { name: t('adminAnalytics.freeConversion.converted'), value: convertedUsers.length, fill: resolvedTheme === 'dark' ? '#10b981' : '#82ca9d' },
        { name: t('adminAnalytics.freeConversion.limitReached'), value: limitReachedUsers.length, fill: resolvedTheme === 'dark' ? '#f59e0b' : '#ffc658' }
      ];

      const totalConversionRate = freeUsers.length > 0 ? 
        Math.round((convertedUsers.length / (freeUsers.length + convertedUsers.length)) * 100) : 0;

      return {
        chartData,
        funnelData,
        totals: {
          newFreeUsers: freeUsers.length,
          conversions: convertedUsers.length,
          conversionRate: totalConversionRate,
          limitReachedUsers: limitReachedUsers.length,
          activeFreeUsers: activeFreeUsers.length
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
    newFreeUsers: {
      label: t('adminAnalytics.freeConversion.newFreeUsers'),
      color: resolvedTheme === 'dark' ? "hsl(250, 95%, 60%)" : "hsl(var(--chart-1))",
    },
    conversions: {
      label: t('adminAnalytics.freeConversion.conversions'),
      color: resolvedTheme === 'dark' ? "hsl(142, 76%, 36%)" : "hsl(var(--chart-2))",
    },
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('adminAnalytics.freeConversion.newFreeUsers')}</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionData?.totals.newFreeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">{t('adminAnalytics.freeConversion.usingFreeTier')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('adminAnalytics.freeConversion.conversions')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionData?.totals.conversions || 0}</div>
            <p className="text-xs text-muted-foreground">{t('adminAnalytics.freeConversion.freeToPaying')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('adminAnalytics.freeConversion.conversionRate')}</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionData?.totals.conversionRate || 0}%</div>
            <p className="text-xs text-muted-foreground">{t('adminAnalytics.freeConversion.successRate')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('adminAnalytics.freeConversion.limitReached')}</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionData?.totals.limitReachedUsers || 0}</div>
            <p className="text-xs text-muted-foreground">{t('adminAnalytics.freeConversion.notConverted')}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Conversion Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t('adminAnalytics.freeConversion.weeklyConversion')}</CardTitle>
            <CardDescription>{t('adminAnalytics.freeConversion.newFreeUsersAndConversions')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
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
                <Bar dataKey="newFreeUsers" fill={resolvedTheme === 'dark' ? '#8b5cf6' : '#8884d8'} name={t('adminAnalytics.freeConversion.newFreeUsers')} />
                <Bar dataKey="conversions" fill={resolvedTheme === 'dark' ? '#10b981' : '#82ca9d'} name={t('adminAnalytics.freeConversion.conversions')} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>{t('adminAnalytics.freeConversion.conversionFunnel')}</CardTitle>
            <CardDescription>{t('adminAnalytics.freeConversion.userStatusDistribution')}</CardDescription>
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
