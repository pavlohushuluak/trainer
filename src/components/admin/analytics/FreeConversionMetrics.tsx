
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
        <Card className="hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">{t('adminAnalytics.freeConversion.newFreeUsers')}</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <UserPlus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{conversionData?.totals.newFreeUsers || 0}</div>
            <p className="text-xs text-blue-500 dark:text-blue-300">{t('adminAnalytics.freeConversion.usingFreeTier')}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">{t('adminAnalytics.freeConversion.conversions')}</CardTitle>
            <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{conversionData?.totals.conversions || 0}</div>
            <p className="text-xs text-green-500 dark:text-green-300">{t('adminAnalytics.freeConversion.freeToPaying')}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-600 dark:text-purple-400">{t('adminAnalytics.freeConversion.conversionRate')}</CardTitle>
            <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{conversionData?.totals.conversionRate || 0}%</div>
            <p className="text-xs text-purple-500 dark:text-purple-300">{t('adminAnalytics.freeConversion.successRate')}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-400">{t('adminAnalytics.freeConversion.limitReached')}</CardTitle>
            <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <UserPlus className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{conversionData?.totals.limitReachedUsers || 0}</div>
            <p className="text-xs text-amber-500 dark:text-amber-300">{t('adminAnalytics.freeConversion.notConverted')}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Conversion Chart */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-t-lg">
            <CardTitle className="text-green-700 dark:text-green-300">{t('adminAnalytics.freeConversion.weeklyConversion')}</CardTitle>
            <CardDescription className="text-green-600 dark:text-green-400">{t('adminAnalytics.freeConversion.newFreeUsersAndConversions')}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
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
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-t-lg">
            <CardTitle className="text-purple-700 dark:text-purple-300">{t('adminAnalytics.freeConversion.conversionFunnel')}</CardTitle>
            <CardDescription className="text-purple-600 dark:text-purple-400">{t('adminAnalytics.freeConversion.userStatusDistribution')}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-80 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={conversionData?.funnelData || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => {
                      // Only show label if percentage is significant (>5%)
                      if (percent > 0.05) {
                        return `${name}\n${(percent * 100).toFixed(0)}%`;
                      }
                      return '';
                    }}
                    outerRadius={90}
                    innerRadius={30}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={2}
                    stroke={resolvedTheme === 'dark' ? '#1f2937' : '#ffffff'}
                    strokeWidth={2}
                  >
                    {conversionData?.funnelData?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    contentStyle={{
                      backgroundColor: resolvedTheme === 'dark' ? '#1f2937' : '#ffffff',
                      border: resolvedTheme === 'dark' ? '1px solid #374151' : '1px solid #d1d5db',
                      color: resolvedTheme === 'dark' ? '#e5e7eb' : '#374151',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Center summary */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    {conversionData?.totals.newFreeUsers || 0}
                  </div>
                  <div className="text-xs text-purple-600 dark:text-purple-400">
                    Total Users
                  </div>
                </div>
              </div>
            </div>
            
            {/* Legend */}
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              {conversionData?.funnelData?.map((entry, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.fill }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {entry.name}: {entry.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
