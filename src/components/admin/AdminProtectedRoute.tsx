
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'support';
}

export const AdminProtectedRoute = ({ children, requiredRole = 'support' }: AdminProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const { data: isAdmin, isLoading: checkingAdmin, error: adminError } = useQuery({
    queryKey: ['admin-check', user?.id],
    queryFn: async () => {
      if (!user) {
        console.log('🔐 AdminProtectedRoute: No user, returning false');
        return false;
      }
      
      console.log('🔐 AdminProtectedRoute: Checking admin status for user:', user.id);
      
      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('role, is_active')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();

        if (error) {
          console.log('🔐 AdminProtectedRoute: Error or no admin record found:', error.message);
          return false;
        }

        if (!data) {
          console.log('🔐 AdminProtectedRoute: No admin data found');
          return false;
        }

        let isUserAdmin = false;
        if (requiredRole === 'admin') {
          isUserAdmin = data.role === 'admin';
        } else {
          isUserAdmin = data.role === 'admin' || data.role === 'support';
        }

        console.log('🔐 AdminProtectedRoute: Result:', { 
          userId: user.id, 
          role: data.role, 
          isActive: data.is_active, 
          requiredRole,
          isAdmin: isUserAdmin 
        });
        
        return isUserAdmin;
      } catch (error) {
        console.error('🔐 AdminProtectedRoute: Unexpected error:', error);
        return false;
      }
    },
    enabled: !!user && !loading, // Only run when user is available and auth is not loading
    staleTime: 300000, // Cache for 5 minutes
    gcTime: 600000, // Keep in cache for 10 minutes
    retry: 3, // Increased retries
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on mount if we have cached data
  });

  // Show loading only when absolutely necessary
  if (loading || (checkingAdmin && isAdmin === undefined)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Checking admin permissions...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    console.log('🔐 AdminProtectedRoute: Access denied', { 
      user: !!user, 
      isAdmin, 
      adminError: adminError?.message 
    });
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <CardTitle>Zugriff verweigert</CardTitle>
            <CardDescription>
              Sie haben keine Berechtigung, auf diesen Bereich zuzugreifen.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={() => navigate('/admin/login')}
              className="w-full"
            >
              Zur Admin-Anmeldung
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('🔐 AdminProtectedRoute: Access granted for user:', user.email);
  return <>{children}</>;
};
