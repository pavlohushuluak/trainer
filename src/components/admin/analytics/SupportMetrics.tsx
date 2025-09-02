
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
  const { t, i18n } = useTranslation();
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
            week: weekStart.toLocaleDateString(i18n.language === 'de' ? 'de-DE' : 'en-US', { month: 'short', day: 'numeric' }),
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

      // Support categories for pie chart with distinct, professional colors for each type
      const supportCategories = Object.entries(notificationsByType).map(([type, count]) => {
        // Define professional color palette for each notification type
        const getColorForType = (type: string) => {
          switch (type) {
            case 'cancellation_email':
              return resolvedTheme === 'dark' ? '#dc2626' : '#ef4444'; // Red
            case 'welcome':
              return resolvedTheme === 'dark' ? '#059669' : '#10b981'; // Emerald
            case 'checkout-confirmation':
              return resolvedTheme === 'dark' ? '#7c3aed' : '#8b5cf6'; // Violet
            case 'support_notification':
              return resolvedTheme === 'dark' ? '#0891b2' : '#06b6d4'; // Cyan
            case 'email_config':
              return resolvedTheme === 'dark' ? '#d97706' : '#f59e0b'; // Amber
            case 'email_config_change':
              return resolvedTheme === 'dark' ? '#1d4ed8' : '#3b82f6'; // Blue
            case 'cancellation_successful':
              return resolvedTheme === 'dark' ? '#be185d' : '#ec4899'; // Pink
            case 'premium_deactivation':
              return resolvedTheme === 'dark' ? '#92400e' : '#d97706'; // Orange
            case 'test-user-welcome':
              return resolvedTheme === 'dark' ? '#059669' : '#10b981'; // Green
            case 'system_test':
              return resolvedTheme === 'dark' ? '#7c2d12' : '#ea580c'; // Dark Orange
            case 'confirm-signup':
              return resolvedTheme === 'dark' ? '#6b21a8' : '#a855f7'; // Purple
            case 'magic-link':
              return resolvedTheme === 'dark' ? '#0f766e' : '#14b8a6'; // Teal
            default:
              return resolvedTheme === 'dark' ? '#6b7280' : '#9ca3af'; // Gray
          }
        };

        // Create user-friendly names for each type
        const getDisplayName = (type: string) => {
          switch (type) {
            case 'cancellation_email':
              return t('adminAnalytics.support.cancellationEmail') || 'Cancellation Email';
            case 'welcome':
              return t('adminAnalytics.support.welcomeEmail') || 'Welcome Email';
            case 'checkout-confirmation':
              return t('adminAnalytics.support.checkoutConfirmation') || 'Checkout Confirmation';
            case 'support_notification':
              return t('adminAnalytics.support.supportNotification') || 'Support Notification';
            case 'email_config':
              return t('adminAnalytics.support.emailConfig') || 'Email Configuration';
            case 'email_config_change':
              return t('adminAnalytics.support.emailConfigChange') || 'Email Config Change';
            case 'cancellation_successful':
              return t('adminAnalytics.support.cancellationSuccessful') || 'Cancellation Successful';
            case 'premium_deactivation':
              return t('adminAnalytics.support.premiumDeactivation') || 'Premium Deactivation';
            case 'test-user-welcome':
              return t('adminAnalytics.support.testUserWelcome') || 'Test User Welcome';
            case 'system_test':
              return t('adminAnalytics.support.systemTest') || 'System Test';
            case 'confirm-signup':
              return t('adminAnalytics.support.confirmSignup') || 'Confirm Signup';
            case 'magic-link':
              return t('adminAnalytics.support.magicLink') || 'Magic Link';
            default:
              return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
          }
        };

        return {
          name: getDisplayName(type),
          value: count,
          fill: getColorForType(type),
          originalType: type // Keep original type for reference
        };
      });

             // Calculate metrics
       const totalTickets = notifications?.length || 0;
       const resolvedTickets = notifications?.filter(n => n.status === 'resolved').length || 0;
       const pendingTickets = totalTickets - resolvedTickets; // Calculate as difference
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
        <Card className="hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">{t('adminAnalytics.support.totalTickets')}</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <HeadphonesIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{supportData?.totals.totalTickets || 0}</div>
            <p className="text-xs text-blue-500 dark:text-blue-300">{t('adminAnalytics.support.totalRequests')}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">{t('adminAnalytics.support.resolvedTickets')}</CardTitle>
            <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{supportData?.totals.resolvedTickets || 0}</div>
            <p className="text-xs text-green-500 dark:text-green-300">{t('adminAnalytics.support.completedCases')}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-400">{t('adminAnalytics.support.pendingTickets')}</CardTitle>
            <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{supportData?.totals.pendingTickets || 0}</div>
            <p className="text-xs text-amber-500 dark:text-amber-300">{t('adminAnalytics.support.openTickets')}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-600 dark:text-purple-400">{t('adminAnalytics.support.resolutionRate')}</CardTitle>
            <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{supportData?.totals.resolutionRate || 0}%</div>
            <p className="text-xs text-purple-500 dark:text-purple-300">{t('adminAnalytics.support.successRate')}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Support Trend */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-t-lg">
            <CardTitle className="text-green-700 dark:text-green-300">{t('adminAnalytics.support.weeklySupportTrend')}</CardTitle>
            <CardDescription className="text-green-600 dark:text-green-400">{t('adminAnalytics.support.ticketVolumeAndResolution')}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ChartContainer config={chartConfig}>
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
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-t-lg">
            <CardTitle className="text-purple-700 dark:text-purple-300">{t('adminAnalytics.support.supportCategories')}</CardTitle>
            <CardDescription className="text-purple-600 dark:text-purple-400">{t('adminAnalytics.support.requestTypeDistribution')}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-80 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={supportData?.supportCategories || []}
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
                    {supportData?.supportCategories?.map((entry, index) => (
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
                    {supportData?.totals.totalTickets || 0}
                  </div>
                  <div className="text-xs text-purple-600 dark:text-purple-400">
                    Total Tickets
                  </div>
                </div>
              </div>
            </div>
            
            {/* Legend */}
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              {supportData?.supportCategories?.map((entry, index) => (
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
