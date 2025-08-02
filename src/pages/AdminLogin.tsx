
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AdminAuthForm } from '@/components/admin/AdminAuthForm';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const AdminLogin = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const { data: isAdmin, isLoading: checkingAdmin } = useQuery({
    queryKey: ['admin-check', user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .from('admin_users')
        .select('role, is_active')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (error || !data) return false;
      return data.role === 'admin' || data.role === 'support';
    },
    enabled: !!user,
  });

  useEffect(() => {
    // Wenn bereits eingeloggt und Admin-Berechtigung vorhanden, zum Admin-Dashboard weiterleiten
    if (user && isAdmin) {
      navigate('/admin/users', { replace: true });
    }
  }, [user, isAdmin, navigate]);

  if (loading || (user && checkingAdmin)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Wenn bereits eingeloggt aber kein Admin, weiterleiten zur normalen App
  if (user && !checkingAdmin && !isAdmin) {
    navigate('/', { replace: true });
    return null;
  }

  return <AdminAuthForm />;
};

export default AdminLogin;
