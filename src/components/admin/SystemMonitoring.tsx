
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
      <div className="space-y-6">
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
      <div className="space-y-6">
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">{t('adminSystemMonitoring.checkingPermissions')}</span>
        </div>
      </div>
    );
  }

  if (adminError) {
    return (
      <div className="space-y-6">
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
      <div className="space-y-6">
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('adminSystemMonitoring.title')}</h1>
        <p className="text-gray-600 mt-2">
          {t('adminSystemMonitoring.description')}
        </p>
      </div>
      
      <Tabs defaultValue="comprehensive" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="comprehensive">{t('adminSystemMonitoring.tabs.comprehensive')}</TabsTrigger>
          <TabsTrigger value="network">{t('adminSystemMonitoring.tabs.network')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="comprehensive" className="space-y-4">
          <ComprehensiveSystemMonitor />
        </TabsContent>
        
        <TabsContent value="network" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('adminSystemMonitoring.advancedNetworkDiagnostics')}</CardTitle>
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
