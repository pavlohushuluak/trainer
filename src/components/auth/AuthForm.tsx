
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { LegalCheckbox } from "./LegalCheckbox";
import { OAuthButton } from "./OAuthButton";
import { useTranslation } from "react-i18next";

interface AuthFormProps {
  onAuthSuccess?: (user?: any, isNewUser?: boolean) => void;
}

export const AuthForm = ({ onAuthSuccess }: AuthFormProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

 

    try {
      if (isLogin) {
        const { error, data } = await signIn(email, password);
        if (error) throw error;
        
        toast({
          title: t('auth.form.toasts.loginSuccess'),
          description: t('auth.form.toasts.welcomeBack')
        });
        
        onAuthSuccess?.(data?.user, false);
      } else {
        if (!acceptedTerms) {
          toast({
            title: t('auth.form.toasts.acceptTerms'),
            description: t('auth.form.toasts.acceptTermsDescription'),
            variant: "destructive"
          });
          setLoading(false);
          return;
        }

        
        
        const language = localStorage.getItem('i18nextLng') || 'de';
        const { error, data } = await signUp(email, password, firstName, lastName, language);
        if (error) throw error;
        
        if (data?.user && !data.user.email_confirmed_at) {
          toast({
            title: t('auth.form.toasts.signupSuccess'),
            description: t('auth.form.toasts.signupSuccessDescription'),
            duration: 8000
          });
        } else {
          toast({
            title: t('auth.form.toasts.signupSuccessConfirmed'),
            description: t('auth.form.toasts.signupSuccessConfirmedDescription')
          });
          
          onAuthSuccess?.(data?.user, true);
        }
      }
    } catch (error: any) {
      
      
      let errorMessage = t('auth.form.toasts.unknownError');
      
      if (error.message?.includes("Invalid login credentials")) {
        errorMessage = t('auth.form.toasts.invalidCredentials');
      } else if (error.message?.includes("User already registered")) {
        errorMessage = t('auth.form.toasts.userAlreadyExists');
        setIsLogin(true);
      } else if (error.message?.includes("Password should be")) {
        errorMessage = t('auth.form.toasts.passwordTooShort');
      } else if (error.message?.includes("Email not confirmed")) {
        errorMessage = t('auth.form.toasts.emailNotConfirmed');
      } else if (error.message?.includes("Email link is invalid or has expired")) {
        errorMessage = t('auth.form.toasts.emailLinkExpired');
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: isLogin ? t('auth.form.toasts.loginFailed') : t('auth.form.toasts.signupFailed'),
        description: errorMessage,
        variant: "destructive",
        duration: 8000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Google OAuth Button - Prominent at the top */}
      <div className="space-y-4">
        <div className="text-center">
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
            {t('auth.form.recommended')}
          </span>
        </div>
        <OAuthButton 
          provider="google" 
          onSuccess={(user, isNewUser) => onAuthSuccess?.(user, isNewUser)}
        />
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            {t('auth.form.orWithEmail')}
          </span>
        </div>
      </div>

      {/* Email/Password Forms */}
      <Tabs value={isLogin ? "login" : "signup"} onValueChange={(value) => setIsLogin(value === "login")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">{t('auth.form.tabs.login')}</TabsTrigger>
          <TabsTrigger value="signup">{t('auth.form.tabs.signup')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>{t('auth.form.login.title')}</CardTitle>
              <CardDescription>
                {t('auth.form.login.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('auth.form.login.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t('auth.form.login.password')}</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('auth.form.login.loginButton')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle>{t('auth.form.signup.title')}</CardTitle>
              <CardDescription>
                {t('auth.form.signup.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{t('auth.form.signup.firstName')}</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{t('auth.form.signup.lastName')}</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t('auth.form.signup.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t('auth.form.signup.password')}</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <LegalCheckbox 
                  checked={acceptedTerms}
                  onCheckedChange={setAcceptedTerms}
                />
                
                <Button type="submit" className="w-full" disabled={loading || !acceptedTerms}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('auth.form.signup.signupButton')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
