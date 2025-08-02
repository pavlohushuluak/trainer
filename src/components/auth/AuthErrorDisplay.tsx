import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';

interface AuthErrorDisplayProps {
  onDismiss?: () => void;
}

export const AuthErrorDisplay: React.FC<AuthErrorDisplayProps> = ({ onDismiss }) => {
  const { authError, dismissAuthError } = useAuth();
  const { t } = useTranslation();

  if (!authError) {
    return null;
  }

  const handleDismiss = () => {
    dismissAuthError();
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <Alert className="border-destructive/20 bg-destructive/5 mb-4 mx-4 mt-4">
      <AlertDescription className="text-destructive flex items-center justify-between">
        <span>{authError}</span>
        <button
          onClick={handleDismiss}
          className="ml-2 p-1 hover:bg-destructive/10 rounded-full transition-colors"
          aria-label={t('auth.errorDisplay.closeError')}
        >
          <X className="h-4 w-4" />
        </button>
      </AlertDescription>
    </Alert>
  );
}; 