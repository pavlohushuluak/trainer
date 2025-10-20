
import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Loader2, ArrowLeft, Shield, Lock, User, Mail, Sparkles, Home, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { OAuthButton } from '@/components/auth/OAuthButton';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { ConfirmPasswordInput } from '@/components/auth/ConfirmPasswordInput';
import { EmailInput } from '@/components/auth/EmailInput';
import { AuthErrorDisplay } from '@/components/auth/AuthErrorDisplay';
import { getCheckoutFlags, clearCheckoutFlags } from '@/utils/checkoutStorage';
import { getCheckoutInformation } from '@/utils/checkoutSessionStorage';
import { useTranslations } from '@/hooks/useTranslations';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentLanguage } from '@/utils/languageSupport';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { AGBModal } from '@/components/legal/AGBModal';
import { ImpressumModal } from '@/components/legal/ImpressumModal';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEmailNotifications } from "@/hooks/useEmailNotifications";
import { useGTM } from '@/hooks/useGTM';
import { useDeviceBinding } from '@/hooks/useDeviceBinding';
import { AutoLoginOverlay } from '@/components/auth/AutoLoginOverlay';

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
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { sendWelcomeEmail } = useEmailNotifications();
  const { t } = useTranslations();
  const { toast } = useToast();
  const { trackLogin, trackSignUp } = useGTM();
  const { checkDeviceBinding, removeDeviceBinding, deviceFingerprint } = useDeviceBinding();
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('signin');
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(true);
  const [isDeviceLocked, setIsDeviceLocked] = useState(false);
  const [lockedEmail, setLockedEmail] = useState('');
  const [isAutoLoggingIn, setIsAutoLoggingIn] = useState(false);
  const [autoLoginMode, setAutoLoginMode] = useState<'checking' | 'logging-in'>('checking');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [showModalContent, setShowModalContent] = useState(false);

  // Check for device binding BEFORE opening modal
  useEffect(() => {
    if (!isOpen || !deviceFingerprint) return;

    const checkForAutoLogin = async () => {
      console.log('🔍 SmartLoginModal: Checking for device binding auto-login...');
      
      // Call the auto-login edge function - Start with "checking" mode
      setIsAutoLoggingIn(true);
      setAutoLoginMode('checking');
      setShowModalContent(false); // Hide modal content during check
      
      try {
        const { data: autoLoginData, error: autoLoginError } = await supabase.functions.invoke('auto-login-device', {
          body: { deviceFingerprint }
        });

        console.log('🔐 SmartLoginModal auto-login response:', autoLoginData);

        if (autoLoginError) {
          console.error('❌ SmartLoginModal auto-login function error:', autoLoginError);
          setIsAutoLoggingIn(false);
          setShowModalContent(true); // Show modal for manual login
          return;
        }
        
        // Check if binding was cleared (orphaned user)
        if (autoLoginData?.error && autoLoginData?.message) {
          console.log('⚠️ SmartLoginModal auto-login returned error:', autoLoginData.error);
          toast({
            title: t('auth.deviceLock.accountNotFound', 'Account Not Found'),
            description: autoLoginData.message,
            variant: 'default'
          });
          setIsAutoLoggingIn(false);
          setShowModalContent(true); // Show modal for manual login
          return;
        }

        if (autoLoginData?.hasBinding && autoLoginData?.actionLink) {
          console.log('✅ SmartLoginModal: Device binding found! Auto-logging in user:', autoLoginData.email);
          setEmail(autoLoginData.email);
          setLockedEmail(autoLoginData.email);
          setIsDeviceLocked(true);
          
          // Switch to "logging-in" mode - Now show "Welcome Back!"
          setAutoLoginMode('logging-in');
          
          // DON'T show modal - keep full-screen overlay visible
          setShowModalContent(false);
          
          // Redirect to action link for automatic login
          setTimeout(() => {
            console.log('🚀 SmartLoginModal: Redirecting to auto-login link...');
            window.location.href = autoLoginData.actionLink;
          }, 1500);
          
        } else if (autoLoginData?.hasBinding && autoLoginData?.email) {
          // Binding exists but no action link - show modal for manual login
          console.log('⚠️ SmartLoginModal: Device binding found but no action link, showing modal for manual login');
          setEmail(autoLoginData.email);
          setLockedEmail(autoLoginData.email);
          setIsDeviceLocked(true);
          setActiveTab('signin');
          setIsAutoLoggingIn(false);
          setShowModalContent(true);
        } else {
          // No device binding - show modal for normal flow
          console.log('ℹ️ SmartLoginModal: No device binding found, showing modal');
          setIsAutoLoggingIn(false);
          setShowModalContent(true);
        }
      } catch (error) {
        console.error('❌ SmartLoginModal auto-login exception:', error);
        setIsAutoLoggingIn(false);
        setShowModalContent(true);
      }
    };

    checkForAutoLogin();
  }, [isOpen, deviceFingerprint, checkDeviceBinding, t, toast]);

  // Check localStorage for alreadySignedUp value on component mount (only if device not locked)
  useEffect(() => {
    if (!isDeviceLocked) {
      const alreadySignedUp = localStorage.getItem('alreadySignedUp') === 'true';
      setActiveTab(alreadySignedUp ? 'signin' : 'signup');
    }
  }, [isDeviceLocked]);

  // Form validation
  const isSignUpValid = useMemo(() => {
    return email && 
           password && 
           confirmPassword && 
           password === confirmPassword && 
           firstName.trim() && 
           lastName.trim() &&
           termsAgreed;
  }, [email, password, confirmPassword, firstName, lastName, termsAgreed]);

  const isSignInValid = useMemo(() => {
    return email && password;
  }, [email, password]);

  const language = getCurrentLanguage();


  const upsertLanguageSupport = async (email: string, language: string) => {
    try {
      const { error } = await supabase.rpc('upsert_language_support', {
        user_email: email,
        user_language: language
      });
    } catch (error) {
      console.error('Error upserting language support:', error);
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignInValid) return;

    setTimeout(async () => {
      await upsertLanguageSupport(email, language);
    }, 1000);
    
    setLoading(true);
    setError('');
    
    try {
      console.log('🔐 [SmartLoginModal] Attempting sign in for:', email);
      const { error, data } = await signIn(email, password);
      
      console.log('🔐 [SmartLoginModal] Sign in response:', {
        hasError: !!error,
        hasData: !!data,
        hasUser: !!data?.user,
        userId: data?.user?.id,
        userEmail: data?.user?.email,
        error: error?.message
      });
      
      if (error) {
        console.error('❌ [SmartLoginModal] Login failed:', error.message);
        setError(error.message === 'Invalid login credentials' 
          ? t('auth.invalidCredentials')
          : error.message);
      } else {
        console.log('✅ [SmartLoginModal] Login successful!');
        // Device binding will be saved on dashboard page (/mein-tiertraining)
        
        // Send welcome email for returning users
        if (data?.user?.email) {
      try {
        await sendWelcomeEmail(
              data.user.email,
              data.user.user_metadata?.full_name || data.user.email.split('@')[0],
          "TierTrainer"
        );
      } catch (error) {
        console.error('Error sending welcome email:', error);
          }
        }
        
        // Track successful login
        trackLogin('email');
        
        // Show login success toast
        toast({
          title: t('auth.smartLogin.welcomeToast.title'),
          description: t('auth.smartLogin.welcomeToast.description'),
          duration: 3000
        });
        
        // Simple login success - let the parent handle checkout logic
        onLoginSuccess();
        onClose();
      }
    } catch (err) {
      setError(t('auth.generalError'));
    } finally {
      localStorage.setItem('alreadySignedUp', 'true');
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignUpValid) return;

    console.log(language);
    await upsertLanguageSupport(email, language);

    setTimeout(async () => {
      console.log(language);
      await upsertLanguageSupport(email, language);
    }, 3000);
    
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const { error, data } = await signUp(email, password, firstName.trim(), lastName.trim(), language, true);
      if (error) {
        if (error.message.includes('already registered')) {
          setError(t('auth.emailAlreadyRegistered'));
        } else {
          setError(error.message);
        }
      } else {
        // Track successful signup
        trackSignUp('email');
        
        // Save device binding after successful signup
        console.log('✅ SmartLoginModal: Signup successful, saving device binding...');
        // Note: Will save after auto-confirm creates session
        
        // Set localStorage to indicate user has signed up
        localStorage.setItem('alreadySignedUp', 'true');
        
        // CRITICAL FIX: Auto-confirm user email and create session immediately
        if (data?.user) {
          console.log('User created successfully, auto-confirming email and creating session:', data.user.email);
          
          try {
            // Call the auto-confirm function to confirm email and create session
            const { data: confirmData, error: confirmError } = await supabase.functions.invoke('auto-confirm-user', {
              body: {
                userEmail: data.user.email
              }
            });

            if (confirmError) {
              console.error('Auto-confirm failed:', confirmError);
              // Fallback to original behavior
              toast({
                title: t('auth.smartLogin.signupSuccess'),
                description: t('auth.smartLogin.proceedingToCheckout'),
                duration: 3000
              });
              
              // Store user data for checkout processing
              sessionStorage.setItem('tempUserData', JSON.stringify({
                email: data.user.email,
                id: data.user.id,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                timestamp: Date.now(),
                needsEmailConfirmation: true
              }));
              
              onLoginSuccess();
              onClose();
              return;
            }

            if (confirmData?.success && confirmData?.action_link) {
              console.log('Auto-confirm successful, redirecting to action link:', confirmData.action_link);
              
              // Device binding will be saved on dashboard page (/mein-tiertraining)
              
              // Store user data for after login
              sessionStorage.setItem('tempUserData', JSON.stringify({
                email: data.user.email,
                id: data.user.id,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                timestamp: Date.now(),
                emailConfirmed: true
              }));
              
              // Show success message
              toast({
                title: t('auth.smartLogin.signupSuccess'),
                description: "Account created successfully! Redirecting to checkout...",
                duration: 3000
              });
              
              // Close modal and redirect to action link for automatic login
              onClose();
              window.location.href = confirmData.action_link;
              return;
            }
          } catch (error) {
            console.error('Error calling auto-confirm function:', error);
          }
        }
        
        // Fallback: Original behavior if auto-confirm fails
        toast({
          title: t('auth.smartLogin.signupSuccess'),
          description: t('auth.smartLogin.proceedingToCheckout'),
          duration: 3000
        });
        
        // Store user data temporarily for checkout processing
        if (data?.user) {
          sessionStorage.setItem('tempUserData', JSON.stringify({
            email: data.user.email,
            id: data.user.id,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            timestamp: Date.now(),
            needsEmailConfirmation: true
          }));
          
          // Trigger checkout processing immediately after storing user data
          setTimeout(() => {
            const checkoutInfo = getCheckoutInformation();
            if (checkoutInfo) {
              console.log('Triggering checkout processing from SmartLoginModal:', checkoutInfo);
              window.dispatchEvent(new CustomEvent('checkoutRequested', { 
                detail: { checkoutInfo, tempUserData: JSON.parse(sessionStorage.getItem('tempUserData') || '{}') }
              }));
            }
          }, 100);
        }
        
        // Proceed to checkout immediately
        onLoginSuccess();
        onClose();
      }
    } catch (err) {
      setError(t('auth.generalError'));
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFirstName('');
    setLastName('');
    setError('');
    setMessage('');
    setTermsAgreed(true);
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsAutoLoggingIn(false);
      setShowModalContent(false);
      setIsDeviceLocked(false);
      setLockedEmail('');
    }
  }, [isOpen]);

  const defaultTitle = title || t('hero.smartLogin.defaultTitle');
  const defaultDescription = description || t('hero.smartLogin.defaultDescription');

  return (
    <>
      {/* Auto-Login Full Screen Overlay - Shows instead of modal when device is recognized */}
      <AutoLoginOverlay 
        email={lockedEmail} 
        isVisible={isAutoLoggingIn} 
        mode={autoLoginMode}
      />
      
      {/* Only show modal if not auto-logging in and modal content should be visible */}
      <Dialog open={isOpen && showModalContent && !isAutoLoggingIn} onOpenChange={onClose}>
        <DialogContent className="max-w-xl max-h-[95vh] overflow-y-auto p-0">
          <div className="p-6">
            {/* Auth Error Display */}
            <AuthErrorDisplay />

            {/* Main Content */}
            <div className="space-y-4">
              {/* Main Card */}
              <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-3 sm:pb-4 lg:pb-6 px-4 sm:px-6">
                  <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                    <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
                    {defaultTitle}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground mt-2 text-xs sm:text-sm">
                    {defaultDescription}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-3 sm:space-y-4 lg:space-y-6 px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4 lg:pb-6">
                  {/* OAuth Section */}
                  <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                    <div className="text-center space-y-1 sm:space-y-2">
                      <div className="flex items-center justify-center gap-1 sm:gap-2 text-primary">
                        <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                        <h3 className="text-xs sm:text-sm font-semibold">{t('auth.fastestLogin')}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground px-1 sm:px-2">
                        {t('auth.oneClickStart')}
                      </p>
                    </div>
                    
                    <OAuthButton 
                      provider="google"
                      source="smartlogin"
                      onSuccess={(user, isNewUser) => {
                        setError('');
                        setMessage('');
                        
                        // Show appropriate toast based on whether it's a new user or returning user
                        if (isNewUser) {
                          toast({
                            title: t('auth.smartLogin.signupSuccess'),
                            description: t('auth.smartLogin.signupSuccessDescription'),
                            duration: 5000
                          });
                        } else {
                          toast({
                            title: t('auth.smartLogin.welcomeToast.title'),
                            description: t('auth.smartLogin.welcomeToast.description'),
                            duration: 3000
                          });
                        }
                        
                        // Simple OAuth success - let the parent handle checkout logic
                        onLoginSuccess();
                        onClose();
                      }}
                    />
                    
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">
                        {t('auth.secureGoogle')}
                      </p>
                    </div>
                  </div>

                  {/* Separator */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 sm:px-3 text-muted-foreground font-medium">{t('auth.or')}</span>
                    </div>
                  </div>

                  {/* Traditional Login */}
                  <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                    <Tabs value={activeTab} onValueChange={(value) => { 
                      if (!isDeviceLocked) {
                        setActiveTab(value); 
                        clearForm(); 
                      }
                    }} className="w-full">
                      {/* Device Lock Notice */}
                      {isDeviceLocked && (
                        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 border-2 border-blue-200 dark:border-blue-800 rounded-xl shadow-lg">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                              <Shield className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                                {t('auth.deviceLock.title', 'Recognized Device')}
                              </h4>
                              <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                                {t('auth.deviceLock.description', `This device is registered to ${lockedEmail}. For security, only this account can be used on this device.`)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Show tabs only if device not locked */}
                      {!isDeviceLocked && (
                        <TabsList className="grid w-full grid-cols-2 bg-muted p-1 rounded-lg text-xs sm:text-sm">
                          <TabsTrigger 
                            value="signin" 
                            className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground py-2 sm:py-1.5"
                          >
                            <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            <span className="hidden xs:inline">{t('auth.login')}</span>
                            <span className="xs:hidden">{t('auth.login')}</span>
                          </TabsTrigger>
                          <TabsTrigger 
                            value="signup"
                            className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground py-2 sm:py-1.5"
                          >
                            <Lock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            <span className="hidden xs:inline">{t('auth.register')}</span>
                            <span className="xs:hidden">{t('auth.register')}</span>
                          </TabsTrigger>
                        </TabsList>
                      )}
                      
                      {/* If device locked, show locked header */}
                      {isDeviceLocked && (
                        <div className="text-center mb-4">
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                            <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                              {t('auth.deviceLock.loginOnly', 'Login Required')}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {/* Sign In Tab */}
                      <TabsContent value="signin" className="space-y-2 sm:space-y-3 lg:space-y-4 mt-3 sm:mt-4 lg:mt-6">
                        <form onSubmit={handleSignIn} className="space-y-2 sm:space-y-3 lg:space-y-4">
                          <EmailInput
                            id="signin-email"
                            label={t('auth.email')}
                            value={email}
                            onChange={(value) => {
                              if (!isDeviceLocked) {
                                setEmail(value);
                              }
                            }}
                            required
                            disabled={isDeviceLocked}
                          />
                          {isDeviceLocked && (
                            <div className="space-y-2 -mt-1">
                              <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                                <Lock className="h-3 w-3" />
                                <span>{t('auth.deviceLock.emailLocked', 'Email locked to this device for security')}</span>
                              </div>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (window.confirm(t('auth.deviceLock.clearConfirm', `Are you sure you want to remove ${lockedEmail} from this device? You will be able to use a different account.`))) {
                                    await removeDeviceBinding(lockedEmail);
                                    setIsDeviceLocked(false);
                                    setLockedEmail('');
                                    setEmail('');
                                    onClose(); // Close modal after clearing
                                    toast({
                                      title: t('auth.deviceLock.cleared', 'Device Lock Removed'),
                                      description: t('auth.deviceLock.clearedDesc', 'You can now login or signup with any email.'),
                                    });
                                  }
                                }}
                                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline hover:underline"
                              >
                                {t('auth.deviceLock.useAnotherAccount', 'Use a different account on this device')}
                              </button>
                            </div>
                          )}
                          
                          <PasswordInput
                            id="signin-password"
                            label={t('auth.password')}
                            value={password}
                            onChange={setPassword}
                            required
                            showHint={false}
                          />
                          
                          <div className="text-right">
                            <Link 
                              to="/password-reset" 
                              className="text-xs text-primary hover:text-primary/80 hover:underline"
                            >
                              {t('auth.forgotPassword')}
                            </Link>
                          </div>
                          
                          <Button 
                            type="submit" 
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 text-xs sm:text-sm lg:text-base py-2 sm:py-2.5" 
                            disabled={loading || !isSignInValid}
                          >
                            {loading ? (
                              <>
                                <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                                <span className="hidden xs:inline">{t('auth.loggingIn')}</span>
                                <span className="xs:hidden">{t('auth.loggingIn')}</span>
                              </>
                            ) : (
                              <>
                                <User className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="hidden xs:inline">{t('auth.login')}</span>
                                <span className="xs:hidden">{t('auth.login')}</span>
                              </>
                            )}
                          </Button>
                        </form>
                      </TabsContent>
                      
                      {/* Sign Up Tab */}
                      <TabsContent value="signup" className="space-y-2 sm:space-y-3 lg:space-y-4 mt-3 sm:mt-4 lg:mt-6">
                        <form onSubmit={handleSignUp} className="space-y-2 sm:space-y-3 lg:space-y-4">
                          {/* Name Fields */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
                            <div className="space-y-1 sm:space-y-2">
                              <Label htmlFor="firstName" className="text-xs sm:text-sm font-medium">
                                {t('auth.firstName')} <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="firstName"
                                type="text"
                                placeholder={t('auth.firstNamePlaceholder')}
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="bg-background border-border focus:border-primary focus:ring-primary text-xs sm:text-sm py-2 sm:py-2.5"
                              />
                            </div>
                            <div className="space-y-1 sm:space-y-2">
                              <Label htmlFor="lastName" className="text-xs sm:text-sm font-medium">
                                {t('auth.lastName')} <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="lastName"
                                type="text"
                                placeholder={t('auth.lastNamePlaceholder')}
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="bg-background border-border focus:border-primary focus:ring-primary text-xs sm:text-sm py-2 sm:py-2.5"
                              />
                            </div>
                          </div>
                          
                          <EmailInput
                            id="signup-email"
                            label={t('auth.email')}
                            value={email}
                            onChange={setEmail}
                            required
                          />
                          
                          <PasswordInput
                            id="signup-password"
                            label={t('auth.password')}
                            value={password}
                            onChange={setPassword}
                            required
                            minLength={6}
                          />
                          
                          <ConfirmPasswordInput
                            id="confirm-password"
                            value={confirmPassword}
                            password={password}
                            onChange={setConfirmPassword}
                            required
                          />
                          
                          {/* Terms Agreement Checkbox */}
                          <div className="flex items-start space-x-2 p-3 bg-muted/30 rounded-lg border border-border/50">
                            <Checkbox
                              id="terms-agreement-signup"
                              checked={termsAgreed}
                              onCheckedChange={(checked) => setTermsAgreed(checked as boolean)}
                              className="mt-0.5"
                            />
                            <label htmlFor="terms-agreement-signup" className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                              {t('auth.termsAgreement')}{' '}
                              <button 
                                type="button"
                                onClick={() => navigate('/agb')}
                                className="min-h-0 text-primary hover:underline font-medium transition-colors"
                              >
                                {t('auth.legal.terms')}
                              </button>
                              {' '}{t('auth.legal.and')}{' '}
                              <button 
                                type="button"
                                onClick={() => navigate('/datenschutz')}
                                className="min-h-0 text-primary hover:underline font-medium transition-colors"
                              >
                                {t('auth.legal.privacy')}
                              </button>
                            </label>
                          </div>
                          
                          <Button 
                            type="submit" 
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 text-xs sm:text-sm lg:text-base py-2 sm:py-2.5" 
                            disabled={loading || !isSignUpValid}
                          >
                            {loading ? (
                              <>
                                <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                                <span className="hidden xs:inline">{t('auth.creatingAccount')}</span>
                                <span className="xs:hidden">{t('auth.creatingAccount')}</span>
                              </>
                            ) : (
                              <>
                                <Lock className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="hidden xs:inline">{t('auth.createAccount')}</span>
                                <span className="xs:hidden">{t('auth.register')}</span>
                              </>
                            )}
                          </Button>
                        </form>
                      </TabsContent>
                    </Tabs>
                  </div>
                  
                  {/* Error Messages */}
                  {error && (
                    <Alert className="border-destructive/20 bg-destructive/5">
                      <AlertDescription className="text-destructive">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {/* Success Messages */}
                  {message && (
                    <Alert className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                      <AlertDescription className="text-green-700 dark:text-green-300">
                        {message}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

            </div>
        </div>
      </DialogContent>
    </Dialog>
      
      {/* Legal Modals */}
      <AGBModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
      <ImpressumModal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />
    </>
  );
};
