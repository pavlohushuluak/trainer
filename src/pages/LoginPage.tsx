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
import { getCurrentLanguage } from '@/utils/languageSupport';

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
      const { data, error } = await signIn(email, password);
      if (error) {
        setError(error.message || t('auth.signInError'));
      } else if (data?.user) {
        setMessage(t('auth.signInSuccess'));
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || t('auth.signInError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignUpValid) return;

    setLoading(true);
    setError('');
    
    try {
      const { data, error } = await signUp(email, password, firstName, lastName, language);
      
      if (error) {
        setError(error.message || t('auth.signUpError'));
      } else if (data?.user) {
        setMessage(t('auth.signUpSuccess'));
        localStorage.setItem('alreadySignedUp', 'true');
        setTimeout(() => {
          setActiveTab('signin');
          clearForm();
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || t('auth.signUpError'));
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

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    clearForm();
  };

  const switchToSignIn = () => {
    setActiveTab('signin');
    clearForm();
  };

  // Redirect if already authenticated
  if (user) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <ThemeLogo className="h-12 w-auto" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {t('auth.welcomeBack')}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {t('auth.welcomeDescription')}
          </p>
        </div>

        {/* Main Card */}
        <Card className="shadow-xl border-border/50">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin" className="text-sm sm:text-base">
                  {t('auth.signIn')}
                </TabsTrigger>
                <TabsTrigger value="signup" className="text-sm sm:text-base">
                  {t('auth.signUp')}
                </TabsTrigger>
              </TabsList>

              {/* Sign In Tab */}
              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
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
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base" 
                    disabled={loading || !isSignInValid}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('auth.signingIn')}
                      </>
                    ) : (
                      <>
                        <Shield className="mr-2 h-4 w-4" />
                        {t('auth.signIn')}
                      </>
                    )}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      {t('auth.orContinueWith')}
                    </span>
                  </div>
                </div>

                <OAuthButton provider="google" />
              </TabsContent>

              {/* Sign Up Tab */}
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="first-name" className="text-sm font-medium">
                        {t('auth.firstName')}
                      </Label>
                      <Input
                        id="first-name"
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="bg-background border-border focus:border-primary focus:ring-primary"
                      />
                    </div>
                    <div>
                      <Label htmlFor="last-name" className="text-sm font-medium">
                        {t('auth.lastName')}
                      </Label>
                      <Input
                        id="last-name"
                        type="text"
                        required
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
              onClick={switchToSignIn}
              className="text-primary hover:underline font-medium"
            >
              {t('auth.loginNow')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;