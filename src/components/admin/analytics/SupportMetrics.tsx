
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Loader2, HeadphonesIcon, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { useThemeContext } from '@/hooks/ThemeProvider';
import { useTranslation } from 'react-i18next';

interface SupportMetricsProps {
  timeRange: string;
}

export const SupportMetrics = ({ timeRange }: SupportMetricsProps) => {
  const { t } = useTranslation();
  const { resolvedTheme } = useThemeContext();
  const { data: supportData, isLoading } = useQuery({
    queryKey: ['support-metrics', timeRange],
    queryFn: async () => {
      const days = parseInt(timeRange);
      const now = new Date();
      const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

      // Get system notifications (as proxy for support tickets)
      const { data: notifications } = await supabase
        .from('system_notifications')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      // Get user notes (as support interactions)
      const { data: userNotes } = await supabase
        .from('user_notes')
        .select('*')
        .gte('created_at', startDate.toISOString());

      // Categorize notifications by type
      const notificationsByType: { [type: string]: number } = {};
      notifications?.forEach(notif => {
        notificationsByType[notif.type] = (notificationsByType[notif.type] || 0) + 1;
      });

      // Group by week for trend analysis
      const weeklySupport: { [week: string]: any } = {};
      
      notifications?.forEach(notif => {
        const date = new Date(notif.created_at);
        const weekStart = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
        const weekKey = weekStart.toISOString().split('T')[0];
        
        if (!weeklySupport[weekKey]) {
          weeklySupport[weekKey] = {
            week: weekStart.toLocaleDateString('de-DE', { month: 'short', day: 'numeric' }),
            totalTickets: 0,
            resolvedTickets: 0,
            responseTime: 0
          };
        }

        weeklySupport[weekKey].totalTickets++;
        if (notif.status === 'resolved') {
          weeklySupport[weekKey].resolvedTickets++;
        }
      });

      const chartData = Object.values(weeklySupport);

      // Support categories for pie chart with theme-aware colors
      const supportCategories = Object.entries(notificationsByType).map(([type, count]) => ({
        name: type === 'technical' ? t('adminAnalytics.support.technicalIssues') :
              type === 'billing' ? t('adminAnalytics.support.billingIssues') :
              type === 'content' ? t('adminAnalytics.support.contentQuestions') :
              type === 'cancellation' ? t('adminAnalytics.support.cancellations') : type,
        value: count,
        fill: type === 'technical' ? (resolvedTheme === 'dark' ? '#8b5cf6' : '#8884d8') :
              type === 'billing' ? (resolvedTheme === 'dark' ? '#10b981' : '#82ca9d') :
              type === 'content' ? (resolvedTheme === 'dark' ? '#f59e0b' : '#ffc658') :
              type === 'cancellation' ? (resolvedTheme === 'dark' ? '#ef4444' : '#ff7c7c') : 
              (resolvedTheme === 'dark' ? '#06b6d4' : '#8dd1e1')
      }));

      // Calculate metrics
      const totalTickets = notifications?.length || 0;
      const resolvedTickets = notifications?.filter(n => n.status === 'resolved').length || 0;
      const pendingTickets = notifications?.filter(n => n.status === 'unread').length || 0;
      const resolutionRate = totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 0;

      return {
        chartData,
        supportCategories,
        totals: {
          totalTickets,
          resolvedTickets,
          pendingTickets,
          resolutionRate,
          totalNotes: userNotes?.length || 0
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
    totalTickets: {
      label: t('adminAnalytics.support.totalTickets'),
      color: resolvedTheme === 'dark' ? "hsl(250, 95%, 60%)" : "hsl(var(--chart-1))",
    },
    resolvedTickets: {
      label: t('adminAnalytics.support.resolvedTickets'),
      color: resolvedTheme === 'dark' ? "hsl(142, 76%, 36%)" : "hsl(var(--chart-2))",
    },
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('adminAnalytics.support.totalTickets')}</CardTitle>
            <HeadphonesIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supportData?.totals.totalTickets || 0}</div>
            <p className="text-xs text-muted-foreground">Gesamte Anfragen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('adminAnalytics.support.resolvedTickets')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supportData?.totals.resolvedTickets || 0}</div>
            <p className="text-xs text-muted-foreground">{t('adminAnalytics.support.completedCases')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('adminAnalytics.support.pendingTickets')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supportData?.totals.pendingTickets || 0}</div>
            <p className="text-xs text-muted-foreground">{t('adminAnalytics.support.openTickets')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('adminAnalytics.support.resolutionRate')}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supportData?.totals.resolutionRate || 0}%</div>
            <p className="text-xs text-muted-foreground">{t('adminAnalytics.support.successRate')}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Support Trend */}
        <Card>
          <CardHeader>
            <CardTitle>{t('adminAnalytics.support.weeklySupportTrend')}</CardTitle>
            <CardDescription>{t('adminAnalytics.support.ticketVolumeAndResolution')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-80">
              <BarChart data={supportData?.chartData || []}>
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
                <Bar dataKey="totalTickets" fill={resolvedTheme === 'dark' ? '#8b5cf6' : '#8884d8'} name={t('adminAnalytics.support.totalTickets')} />
                <Bar dataKey="resolvedTickets" fill={resolvedTheme === 'dark' ? '#10b981' : '#82ca9d'} name={t('adminAnalytics.support.resolvedTickets')} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Support Categories */}
        <Card>
          <CardHeader>
            <CardTitle>{t('adminAnalytics.support.supportCategories')}</CardTitle>
            <CardDescription>{t('adminAnalytics.support.requestTypeDistribution')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={supportData?.supportCategories || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {supportData?.supportCategories?.map((entry, index) => (
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
