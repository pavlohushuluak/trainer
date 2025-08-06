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
import { useStickyHeader } from '@/hooks/useStickyHeader';
import { cn } from '@/lib/utils';
import { ThemeLogo } from '@/components/ui/theme-logo';
import { useTranslations } from '@/hooks/useTranslations';
import { supabase } from '@/integrations/supabase/client';

const LoginPage = () => {
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { isScrolled } = useStickyHeader();
  const { t } = useTranslations();
  
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

  // Check localStorage for alreadySignedUp value on component mount
  useEffect(() => {
    const alreadySignedUp = localStorage.getItem('alreadySignedUp') === 'true';
    setActiveTab(alreadySignedUp ? 'signin' : 'signup');
  }, []);

  // Password strength validation
  const isPasswordStrong = useMemo(() => {
    if (!password) return false;
    const requirements = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    return Object.values(requirements).every(Boolean);
  }, [password]);

  // Form validation
  const isSignUpValid = useMemo(() => {
    return email && 
           password && 
           confirmPassword && 
           password === confirmPassword && 
           isPasswordStrong &&
           firstName.trim() && 
           lastName.trim();
  }, [email, password, confirmPassword, isPasswordStrong, firstName, lastName]);

  const isSignInValid = useMemo(() => {
    return email && password;
  }, [email, password]);

  const language = localStorage.getItem('i18nextLng') || 'de';

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
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message === 'Invalid login credentials' 
          ? t('auth.invalidCredentials')
          : error.message);
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
      const { error } = await signUp(email, password, firstName.trim(), lastName.trim(), language);
      if (error) {
        if (error.message.includes('already registered')) {
          setError(t('auth.emailAlreadyRegistered'));
        } else {
          setError(error.message);
        }
      } else {
        setMessage(t('auth.registrationSuccess'));
        // Set localStorage to indicate user has signed up
        localStorage.setItem('alreadySignedUp', 'true');
        // Clear form after successful registration
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setFirstName('');
        setLastName('');
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">

      {/* Auth Error Display */}
      <AuthErrorDisplay />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md sm:max-w-lg space-y-4 sm:space-y-6">

        {/* Main Card */}
        <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4 sm:pb-6">
            <div className="mx-auto w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">
              {t('auth.welcome')}
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2 text-sm">
              {t('auth.secureLogin')}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-4 sm:pb-6">
            {/* OAuth Section */}
            <div className="space-y-3 sm:space-y-4">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-primary">
                  <Sparkles className="h-4 w-4" />
                  <h3 className="text-sm font-semibold">{t('auth.fastestLogin')}</h3>
                </div>
                <p className="text-xs text-muted-foreground px-2">
                  {t('auth.oneClickStart')}
                </p>
              </div>
              
              <OAuthButton 
                provider="google"
                onSuccess={() => {
                  setError('');
                  setMessage('');
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
                <span className="bg-card px-3 text-muted-foreground font-medium">{t('auth.or')}</span>
              </div>
            </div>

            {/* Traditional Login */}
            <div className="space-y-3 sm:space-y-4">
              <Tabs value={activeTab} onValueChange={(value) => { setActiveTab(value); clearForm(); }} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-muted p-1 rounded-lg text-xs sm:text-sm">
                  <TabsTrigger 
                    value="signin" 
                    className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground"
                  >
                    <User className="h-4 w-4 mr-2" />
                    {t('auth.login')}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="signup"
                    className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    {t('auth.register')}
                  </TabsTrigger>
                </TabsList>
                
                {/* Sign In Tab */}
                <TabsContent value="signin" className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
                  <form onSubmit={handleSignIn} className="space-y-3 sm:space-y-4">
                    <EmailInput
                      id="signin-email"
                      label={t('auth.email')}
                      value={email}
                      onChange={setEmail}
                      required
                    />
                    
                    <PasswordInput
                      id="signin-password"
                      label={t('auth.password')}
                      value={password}
                      onChange={setPassword}
                      required
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
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base" 
                      disabled={loading || !isSignInValid}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('auth.loggingIn')}
                        </>
                      ) : (
                        <>
                          <User className="mr-2 h-4 w-4" />
                          {t('auth.login')}
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>
                
                {/* Sign Up Tab */}
                <TabsContent value="signup" className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
                  <form onSubmit={handleSignUp} className="space-y-3 sm:space-y-4">
                    {/* Name Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-sm font-medium">
                          {t('auth.firstName')} <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="firstName"
                          type="text"
                          placeholder={t('auth.firstNamePlaceholder')}
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="bg-background border-border focus:border-primary focus:ring-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-sm font-medium">
                          {t('auth.lastName')} <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="lastName"
                          type="text"
                          placeholder={t('auth.lastNamePlaceholder')}
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="bg-background border-border focus:border-primary focus:ring-primary"
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
                      minLength={8}
                      showStrength={true}
                    />
                    
                    <ConfirmPasswordInput
                      id="confirm-password"
                      value={confirmPassword}
                      password={password}
                      onChange={setConfirmPassword}
                      required
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base" 
                      disabled={loading || !isSignUpValid}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('auth.creatingAccount')}
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          {t('auth.createAccount')}
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

        {/* Footer */}
        <div className="text-center text-xs sm:text-sm text-muted-foreground space-y-2 px-2">
          <p>
            {t('auth.termsAgreement')}
          </p>
          <p>
            {t('auth.alreadyHaveAccountText')}{' '}
            <button 
              onClick={() => {
                const signinTab = document.querySelector('[data-value="signin"]') as HTMLElement;
                signinTab?.click();
              }}
              className="text-primary hover:underline font-medium"
            >
              {t('auth.loginNow')}
            </button>
          </p>
        </div>
      </div>
    </div>
  </div>
  );
};

export default LoginPage;