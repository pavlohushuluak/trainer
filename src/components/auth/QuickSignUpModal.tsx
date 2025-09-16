
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { QuickSignUpHeader } from './quick-signup/QuickSignUpHeader';
import { GoogleSignUpTab } from './quick-signup/GoogleSignUpTab';
import { EmailSignUpTab } from './quick-signup/EmailSignUpTab';
import { QuickSignUpFooter } from './quick-signup/QuickSignUpFooter';
import { Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface QuickSignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignUpSuccess?: () => void;
}

export const QuickSignUpModal = ({ isOpen, onClose, onSignUpSuccess }: QuickSignUpModalProps) => {
  const { toast } = useToast();
  const { t } = useTranslation();

  if (!isOpen) return null;

  const handleGoogleSignInSuccess = () => {
    toast({
      title: t('auth.quickSignup.toasts.googleSuccess.title'),
      description: t('auth.quickSignup.toasts.googleSuccess.description')
    });
    
    // Direkt zum Tierbereich weiterleiten nach Google-Anmeldung
    setTimeout(() => {
      window.location.href = '/mein-tiertraining';
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <QuickSignUpHeader onClose={onClose} />

        <div className="p-6">
          <Tabs defaultValue="google" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="google" className="flex items-center gap-2">
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                </svg>
                {t('auth.quickSignup.tabs.google')}
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {t('auth.quickSignup.tabs.email')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="google" className="mt-0">
              <GoogleSignUpTab onSuccess={handleGoogleSignInSuccess} />
            </TabsContent>

            <TabsContent value="email" className="mt-0">
              <EmailSignUpTab onClose={onClose} />
            </TabsContent>
          </Tabs>

          <QuickSignUpFooter />
        </div>
      </div>
    </div>
  );
};
