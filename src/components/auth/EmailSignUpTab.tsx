
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthOperations } from "@/hooks/auth/useAuthOperations";
import { Loader2, User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/hooks/useTranslations";
import { detectBrowserLanguage } from "@/utils/languageSupport";

interface EmailSignUpTabProps {
  onAuthSuccess: (user?: any, isNewUser?: boolean) => void;
}

export const EmailSignUpTab = ({ onAuthSuccess }: EmailSignUpTabProps) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signUp } = useAuthOperations();
  const { toast } = useToast();
  const { t } = useTranslations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {

      // Check for pending checkout - CRITICAL: Don't navigate if checkout is pending
      const pendingCheckout = sessionStorage.getItem('pendingCheckout');
      const pendingPriceType = sessionStorage.getItem('pendingCheckoutPriceType');
      

      // Use unified language detection
      const detectedLanguage = detectBrowserLanguage() || 'de';
      console.log('🔐 EmailSignUpTab - detected language:', detectedLanguage);
      
      const { data, error } = await signUp(email, password, firstName, lastName, detectedLanguage);
      
      if (error) {
        
        // Handle specific error cases
        if (error.message?.includes('User already registered')) {
          toast({
            title: t('auth.emailSignUpTab.errors.accountAlreadyExists.title'),
            description: t('auth.emailSignUpTab.errors.accountAlreadyExists.description'),
            variant: "destructive",
          });
        } else if (error.message?.includes('Password should be at least 6 characters')) {
          toast({
            title: t('auth.emailSignUpTab.errors.passwordTooShort.title'),
            description: t('auth.emailSignUpTab.errors.passwordTooShort.description'),
            variant: "destructive",
          });
        } else if (error.message?.includes('Invalid email')) {
          toast({
            title: t('auth.emailSignUpTab.errors.invalidEmail.title'),
            description: t('auth.emailSignUpTab.errors.invalidEmail.description'),
            variant: "destructive",
          });
        } else {
          toast({
            title: t('auth.emailSignUpTab.errors.registrationFailed.title'),
            description: error.message || t('auth.emailSignUpTab.errors.registrationFailed.description'),
            variant: "destructive",
          });
        }
        return;
      }


      if (!data.session) {
        // Email confirmation required
        toast({
          title: t('auth.emailSignUpTab.success.registrationSuccessful.title'),
          description: t('auth.emailSignUpTab.success.registrationSuccessful.description'),
          duration: 6000,
        });
      } else {
        // Direct login (no email confirmation needed)
        toast({
          title: t('auth.emailSignUpTab.success.welcome.title'),
          description: t('auth.emailSignUpTab.success.welcome.description'),
          duration: 3000,
        });

        // CRITICAL: If there's a pending checkout, DON'T navigate away
        // Let the auth handler manage the DIRECT Stripe redirect
        if (pendingCheckout === 'true' && pendingPriceType) {
          // Call onAuthSuccess but DO NOT navigate - auth handler will handle direct Stripe redirect
          onAuthSuccess(data.user, true);
          return;
        }

        // Normal signup without pending checkout - proceed with normal flow
        onAuthSuccess(data.user, true);
      }

    } catch (error: any) {
      toast({
        title: t('auth.emailSignUpTab.errors.generalError.title'),
        description: t('auth.emailSignUpTab.errors.generalError.description'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
            {t('auth.emailSignUpTab.form.firstName')}
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="firstName"
              type="text"
              placeholder={t('auth.emailSignUpTab.form.firstNamePlaceholder')}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
            {t('auth.emailSignUpTab.form.lastName')}
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="lastName"
              type="text"
              placeholder={t('auth.emailSignUpTab.form.lastNamePlaceholder')}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
          {t('auth.emailSignUpTab.form.email')}
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="email"
            type="email"
            placeholder={t('auth.emailSignUpTab.form.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium text-gray-700">
          {t('auth.emailSignUpTab.form.password')}
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder={t('auth.emailSignUpTab.form.passwordPlaceholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-10"
            required
            minLength={6}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            aria-label={showPassword ? t('auth.emailSignUpTab.form.hidePassword') : t('auth.emailSignUpTab.form.showPassword')}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      
      <Button
        type="submit"
        className="w-full bg-primary hover:bg-primary/90"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('auth.emailSignUpTab.form.registering')}
          </>
        ) : (
          t('auth.emailSignUpTab.form.registerButton')
        )}
      </Button>
      
      <p className="text-xs text-gray-500 text-center">
        {t('auth.emailSignUpTab.form.termsAgreement')}{" "}
        <a href="/datenschutz" className="text-primary hover:underline">
          {t('auth.emailSignUpTab.form.privacyPolicy')}
        </a>{" "}
        {t('auth.or')}{" "}
        <a href="/agb" className="text-primary hover:underline">
          {t('auth.emailSignUpTab.form.termsOfService')}
        </a>{" "}
        .
      </p>
    </form>
  );
};
