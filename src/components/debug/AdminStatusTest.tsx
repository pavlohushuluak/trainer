import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Shield, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export const AdminStatusTest = () => {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<any>(null);

  // Test admin detection using the same logic as MainLayout
  const { data: isAdmin, isLoading: checkingAdmin, error: adminError } = useQuery({
    queryKey: ['admin-check', user?.id],
    queryFn: async () => {
      if (!user) {
        console.log('🔐 Admin check: No user, returning false');
        return false;
      }
      
      console.log('🔐 Admin check: Checking admin status for user:', user.id);
      
      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('role, is_active')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();

        if (error) {
          console.log('🔐 Admin check: Error or no admin record found:', error.message);
          return false;
        }

        if (!data) {
          console.log('🔐 Admin check: No admin data found');
          return false;
        }

        const isUserAdmin = data.role === 'admin' || data.role === 'support';
        console.log('🔐 Admin check: Result:', { 
          userId: user.id, 
          role: data.role, 
          isActive: data.is_active, 
          isAdmin: isUserAdmin 
        });
        
        return isUserAdmin;
      } catch (error) {
        console.error('🔐 Admin check: Unexpected error:', error);
        return false;
      }
    },
    enabled: !!user,
    staleTime: 300000, // Cache for 5 minutes
    gcTime: 600000, // Keep in cache for 10 minutes
    retry: 3, // Increased retries
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on mount if we have cached data
  });

  const runManualTest = async () => {
    if (!user) {
      setTestResults({ error: 'No user authenticated' });
      return;
    }

    try {
      console.log('🧪 Running manual admin test for user:', user.id);
      
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', user.id);

      setTestResults({
        userId: user.id,
        userEmail: user.email,
        queryResult: data,
        error: error?.message,
        timestamp: new Date().toISOString()
      });

      console.log('🧪 Manual test results:', { data, error });
    } catch (error: any) {
      setTestResults({
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  };

  const getStatusIcon = (status: boolean | null, loading: boolean) => {
    if (loading) return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    if (status === null) return <XCircle className="h-4 w-4 text-gray-500" />;
    return status ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <XCircle className="h-4 w-4 text-red-500" />;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Admin Status Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span>User Authenticated:</span>
            <div className="flex items-center gap-2">
              {getStatusIcon(!!user, false)}
              <span className="text-sm">{user ? user.email : 'Not authenticated'}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span>Admin Status:</span>
            <div className="flex items-center gap-2">
              {getStatusIcon(isAdmin, checkingAdmin)}
              <span className="text-sm">
                {checkingAdmin ? 'Checking...' : isAdmin ? 'Admin' : 'Not Admin'}
              </span>
            </div>
          </div>

          {adminError && (
            <div className="flex justify-between items-center">
              <span>Error:</span>
              <span className="text-sm text-red-500">{adminError.message}</span>
            </div>
          )}
        </div>

        {/* Test Actions */}
        <div className="border-t pt-4">
          <Button onClick={runManualTest} className="w-full">
            Run Manual Admin Test
          </Button>
        </div>

        {/* Test Results */}
        {testResults && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Manual Test Results:</h4>
            <div className="bg-gray-50 p-3 rounded text-sm">
              <pre className="whitespace-pre-wrap text-xs">
                {JSON.stringify(testResults, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Expected Behavior */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Expected Behavior:</h4>
          <ul className="text-sm space-y-1 text-gray-600">
            <li>• Admin users should see the admin button in the header</li>
            <li>• Non-admin users should not see the admin button</li>
            <li>• Admin status is cached for 1 minute</li>
            <li>• Admin button should navigate to /admin when clicked</li>
          </ul>
        </div>

        {/* Debug Info */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Debug Info:</h4>
          <div className="text-xs text-gray-500 space-y-1">
            <div>User ID: {user?.id || 'None'}</div>
            <div>Query Key: ['admin-check', {user?.id || 'null'}]</div>
            <div>Query Enabled: {!!user ? 'true' : 'false'}</div>
            <div>Stale Time: 60 seconds</div>
            <div>Cache Time: 5 minutes</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 