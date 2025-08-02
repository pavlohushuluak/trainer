
import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from './AuthForm';
import { Loader2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();

  // Allow access to homepage regardless of auth status
  if (location.pathname === '/') {
    return <>{children}</>;
  }

  // IMPROVED loading state - faster feedback
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-blue-700">{t('auth.protectedRoute.checkingAuth')}</p>
        </div>
      </div>
    );
  }

  // ENHANCED auth check - better error handling
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <AuthForm />
      </div>
    );
  }

  return <>{children}</>;
};
