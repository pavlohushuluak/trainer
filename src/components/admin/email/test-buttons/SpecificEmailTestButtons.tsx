
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTranslations } from '@/hooks/useTranslations';

export const SpecificEmailTestButtons = () => {
  const { toast } = useToast();
  const { t } = useTranslations();

  const handleEmailError = (error: any, actionType: string) => {
    console.error(`${actionType} error:`, error);
    
    let errorMessage = t('adminEmail.testButtons.connectionTest.errorDescriptions.unknown');
    if (error?.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    toast({
      title: t('adminEmail.testButtons.specificTests.error'),
      description: t('adminEmail.testButtons.specificTests.errorDescription', { errorMessage }),
      variant: "destructive",
      duration: 8000
    });
  };

  const handleEmailSuccess = (data: any, emailType: string) => {
    toast({
      title: t('adminEmail.testButtons.specificTests.success'),
      description: t('adminEmail.testButtons.specificTests.successDescription', { recipient: data?.finalRecipient || 'owydwaldt12@gmail.com' }),
      duration: 4000
    });
  };

  const testWelcomeEmail = async () => {
    try {
      
      const { data, error } = await supabase.functions.invoke('send-welcome-email', {
        body: {
          emailType: 'welcome',
          userEmail: 'test@example.com',
          userName: 'Test User',
          planName: 'Premium Plan',
          trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
        }
      });

      if (error) {
        console.error('Function invoke error:', error);
        throw error;
      }

      if (data?.error) {
        console.error('Function returned error:', data.error);
        throw new Error(data.error);
      }
      
      handleEmailSuccess(data, 'welcome');
    } catch (error) {
      handleEmailError(error, 'Test welcome email');
    }
  };

  const testCheckoutEmail = async () => {
    try {
      
      const { data, error } = await supabase.functions.invoke('send-welcome-email', {
        body: {
          emailType: 'checkout-confirmation',
          userEmail: 'test@example.com',
          userName: 'Test User',
          planName: 'Premium Plan',
          amount: '19.99',
          interval: 'Monat',
          trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
        }
      });


      if (error) {
        console.error('Function invoke error:', error);
        throw error;
      }

      if (data?.error) {
        console.error('Function returned error:', data.error);
        throw new Error(data.error);
      }
      
      handleEmailSuccess(data, 'checkout');
    } catch (error) {
      handleEmailError(error, 'Test checkout email');
    }
  };

  const testMagicLinkEmail = async () => {
    try {
      
      const { data, error } = await supabase.functions.invoke('send-welcome-email', {
        body: {
          emailType: 'magic-link',
          userEmail: 'test@example.com',
          userName: 'Test User',
          magicLink: 'https://tiertrainer24.com/auth/confirm?token=test-token'
        }
      });

      if (error) {
        console.error('Function invoke error:', error);
        throw error;
      }

      if (data?.error) {
        console.error('Function returned error:', data.error);
        throw new Error(data.error);
      }
      
      handleEmailSuccess(data, 'magic-link');
    } catch (error) {
      handleEmailError(error, 'Test magic link email');
    }
  };

  const testTestUserWelcomeEmail = async () => {
    try {
      
      const { data, error } = await supabase.functions.invoke('send-welcome-email', {
        body: {
          emailType: 'test-user-welcome',
          userEmail: 'test@example.com',
          userName: 'Test User',
          testAccessCode: 'TEST123',
          testExpiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString()
        }
      });

      if (error) {
        console.error('Function invoke error:', error);
        throw error;
      }

      if (data?.error) {
        console.error('Function returned error:', data.error);
        throw new Error(data.error);
      }
      
      handleEmailSuccess(data, 'test-user-welcome');
    } catch (error) {
      handleEmailError(error, 'Test test user welcome email');
    }
  };

  const testConfirmSignupEmail = async () => {
    try {
      
      const { data, error } = await supabase.functions.invoke('send-welcome-email', {
        body: {
          emailType: 'confirm-signup',
          userEmail: 'test@example.com',
          userName: 'Test User',
          confirmLink: 'https://tiertrainer24.com/auth/confirm?token=test-token'
        }
      });

      if (error) {
        console.error('Function invoke error:', error);
        throw error;
      }

      if (data?.error) {
        console.error('Function returned error:', data.error);
        throw new Error(data.error);
      }
      
      handleEmailSuccess(data, 'confirm-signup');
    } catch (error) {
      handleEmailError(error, 'Test confirm signup email');
    }
  };

  const testInviteUserEmail = async () => {
    try {
      
      const { data, error } = await supabase.functions.invoke('send-welcome-email', {
        body: {
          emailType: 'invite-user',
          userEmail: 'test@example.com',
          inviterName: 'Admin User',
          inviteLink: 'https://tiertrainer24.com/auth/invite?token=test-token'
        }
      });

      if (error) {
        console.error('Function invoke error:', error);
        throw error;
      }

      if (data?.error) {
        console.error('Function returned error:', data.error);
        throw new Error(data.error);
      }
      
      handleEmailSuccess(data, 'invite-user');
    } catch (error) {
      handleEmailError(error, 'Test invite user email');
    }
  };

  const testTestUserActivationEmail = async () => {
    try {
      
      const { data, error } = await supabase.functions.invoke('send-welcome-email', {
        body: {
          emailType: 'test-user-activation',
          userEmail: 'test@example.com',
          userName: 'Test User',
          activationCode: 'ACTIVATE123',
          activationLink: 'https://tiertrainer24.com/auth/activate?token=test-token'
        }
      });

      if (error) {
        console.error('Function invoke error:', error);
        throw error;
      }

      if (data?.error) {
        console.error('Function returned error:', data.error);
        throw new Error(data.error);
      }
      
      handleEmailSuccess(data, 'test-user-activation');
    } catch (error) {
      handleEmailError(error, 'Test test user activation email');
    }
  };

  const testSupportEmail = async () => {
    try {
      
      const { data, error } = await supabase.functions.invoke('send-welcome-email', {
        body: {
          emailType: 'support-notification',
          userEmail: 'test@example.com',
          userName: 'Test User',
          ticketId: 'TICKET123',
          issueDescription: 'Test support issue',
          priority: 'medium'
        }
      });

      if (error) {
        console.error('Function invoke error:', error);
        throw error;
      }

      if (data?.error) {
        console.error('Function returned error:', data.error);
        throw new Error(data.error);
      }
      
      handleEmailSuccess(data, 'support-notification');
    } catch (error) {
      handleEmailError(error, 'Test support email');
    }
  };

  const testCancellationEmail = async () => {
    try {
      
      const { data, error } = await supabase.functions.invoke('send-welcome-email', {
        body: {
          emailType: 'cancellation-confirmation',
          userEmail: 'test@example.com',
          userName: 'Test User',
          planName: 'Premium Plan',
          cancellationDate: new Date().toLocaleDateString(),
          reactivationLink: 'https://tiertrainer24.com/reactivate?token=test-token'
        }
      });

      if (error) {
        console.error('Function invoke error:', error);
        throw error;
      }

      if (data?.error) {
        console.error('Function returned error:', data.error);
        throw new Error(data.error);
      }
      
      handleEmailSuccess(data, 'cancellation');
    } catch (error) {
      handleEmailError(error, 'Test cancellation email');
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('adminEmail.testButtons.specificTests.title')}</div>
      
      {/* Basic Emails - Mobile Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        <Button 
          variant="outline" 
          size="sm"
          onClick={testWelcomeEmail}
          className="text-xs sm:text-sm"
        >
          {t('adminEmail.testButtons.specificTests.buttons.welcome')}
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={testCheckoutEmail}
          className="text-xs sm:text-sm"
        >
          {t('adminEmail.testButtons.specificTests.buttons.checkout')}
        </Button>
      </div>

      {/* Auth Emails - Mobile Responsive */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">{t('adminEmail.testButtons.specificTests.authEmails')}</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={testMagicLinkEmail}
            className="text-xs sm:text-sm"
          >
            {t('adminEmail.testButtons.specificTests.buttons.magicLink')}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={testConfirmSignupEmail}
            className="text-xs sm:text-sm"
          >
            {t('adminEmail.testButtons.specificTests.buttons.confirmSignup')}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={testInviteUserEmail}
            className="text-xs sm:text-sm"
          >
            {t('adminEmail.testButtons.specificTests.buttons.inviteUser')}
          </Button>
        </div>
      </div>

      {/* Test-User Emails - Mobile Responsive */}
      <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
        <div className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">{t('adminEmail.testButtons.specificTests.testUserEmails')}</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={testTestUserWelcomeEmail}
            className="text-xs sm:text-sm"
          >
            {t('adminEmail.testButtons.specificTests.buttons.testUserWelcome')}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={testTestUserActivationEmail}
            className="text-xs sm:text-sm"
          >
            {t('adminEmail.testButtons.specificTests.buttons.testUserActivation')}
          </Button>
        </div>
      </div>

      {/* System Emails - Mobile Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        <Button 
          variant="outline" 
          size="sm"
          onClick={testSupportEmail}
          className="text-xs sm:text-sm"
        >
          {t('adminEmail.testButtons.specificTests.buttons.support')}
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={testCancellationEmail}
          className="text-xs sm:text-sm"
        >
          {t('adminEmail.testButtons.specificTests.buttons.cancellation')}
        </Button>
      </div>
    </div>
  );
};
