
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AuthLoadingScreenProps {
  message?: string;
}

export const AuthLoadingScreen = ({ 
  message 
}: AuthLoadingScreenProps) => {
  const { t } = useTranslation();
  const defaultMessage = t('auth.loadingScreen.defaultMessage');
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">{message || defaultMessage}</h2>
        <p className="text-gray-600">{t('auth.loadingScreen.pleaseWait')}</p>
      </div>
    </div>
  );
};
