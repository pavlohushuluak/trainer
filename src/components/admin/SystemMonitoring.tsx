
import { ComprehensiveSystemMonitor } from "./system/ComprehensiveSystemMonitor";
import { NetworkDiagnosticPanel } from "@/components/NetworkDiagnosticPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { useTranslations } from '@/hooks/useTranslations';

export const SystemMonitoring = () => {
  const { t } = useTranslations();
  const { user } = useAuth();

  // Check admin permissions
  const { data: isAdmin, isLoading: checkingAdmin, error: adminError } = useQuery({
    queryKey: ['admin-check', user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .from('admin_users')
        .select('role, is_active')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('❌ Admin check error:', error);
        throw error;
      }

      const hasAdminAccess = data && (data.role === 'admin' || data.role === 'support');
      return hasAdminAccess;
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t('adminSystemMonitoring.authenticationRequired')}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (checkingAdmin) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-center p-6 sm:p-8">
          <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin" />
          <span className="ml-2 text-sm sm:text-base">{t('adminSystemMonitoring.checkingPermissions')}</span>
        </div>
      </div>
    );
  }

  if (adminError) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t('adminSystemMonitoring.permissionError', { message: adminError.message })}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t('adminSystemMonitoring.accessDenied', { email: user.email })}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Section - Mobile Responsive */}
      <div className="space-y-2 sm:space-y-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('adminSystemMonitoring.title')}</h1>
        <p className="text-sm sm:text-base text-gray-600">
          {t('adminSystemMonitoring.description')}
        </p>
      </div>
      
      {/* Tabs Section - Mobile Responsive */}
      <Tabs defaultValue="comprehensive" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 h-auto sm:h-10">
          <TabsTrigger value="comprehensive" className="text-xs sm:text-sm py-2 sm:py-1.5">
            {t('adminSystemMonitoring.tabs.comprehensive')}
          </TabsTrigger>
          <TabsTrigger value="network" className="text-xs sm:text-sm py-2 sm:py-1.5">
            {t('adminSystemMonitoring.tabs.network')}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="comprehensive" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
          <ComprehensiveSystemMonitor />
        </TabsContent>
        
        <TabsContent value="network" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">{t('adminSystemMonitoring.advancedNetworkDiagnostics')}</CardTitle>
            </CardHeader>
            <CardContent>
              <NetworkDiagnosticPanel />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
