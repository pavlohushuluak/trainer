
import { PasswordRecoveryForm } from '@/components/auth/PasswordRecoveryForm';
import { AuthLoadingScreen } from '@/components/auth/AuthLoadingScreen';
import { useAuthCallback } from '@/hooks/useAuthCallback';

export default function AuthCallback() {
  const { isRecovery } = useAuthCallback();

  if (isRecovery) {
    return <PasswordRecoveryForm />;
  }

  return <AuthLoadingScreen />;
}
