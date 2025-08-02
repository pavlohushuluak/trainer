
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AuthForm } from "./AuthForm";
import { useEmailNotifications } from "@/hooks/useEmailNotifications";
import { useTranslations } from "@/hooks/useTranslations";

interface SmartLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
  title?: string;
  description?: string;
}

export const SmartLoginModal = ({ 
  isOpen, 
  onClose, 
  onLoginSuccess, 
  title,
  description
}: SmartLoginModalProps) => {
  const { sendWelcomeEmail } = useEmailNotifications();
  const { t } = useTranslations();
  
  const defaultTitle = t('hero.smartLogin.defaultTitle');
  const defaultDescription = t('hero.smartLogin.defaultDescription');

  const handleAuthSuccess = async (user?: any, isNewUser?: boolean) => {
    // Send welcome email for new users
    if (user?.email) {
      try {
        await sendWelcomeEmail(
          user.email,
          user.user_metadata?.full_name || user.email.split('@')[0],
          "TierTrainer"
        );
      } catch (error) {
        console.error('Error sending welcome email:', error);
        // Don't block the flow if email fails
      }
    }
    
    // Nach erfolgreichem Login/Signup immer zur Smart Login Logik weiterleiten
    onLoginSuccess();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-gray-900">{title || defaultTitle}</DialogTitle>
          <DialogDescription className="text-center text-gray-600 mt-2">
            {description || defaultDescription}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-6">
          {/* Nur eine AuthForm - diese enthält bereits den Google Button */}
          <AuthForm onAuthSuccess={handleAuthSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
