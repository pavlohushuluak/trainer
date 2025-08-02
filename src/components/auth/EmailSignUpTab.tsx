
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthOperations } from "@/hooks/auth/useAuthOperations";
import { Loader2, User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {

      // Check for pending checkout - CRITICAL: Don't navigate if checkout is pending
      const pendingCheckout = sessionStorage.getItem('pendingCheckout');
      const pendingPriceType = sessionStorage.getItem('pendingCheckoutPriceType');
      

      // Use unified language detection
      const detectedLanguage = detectBrowserLanguage();
      console.log('🔐 EmailSignUpTab - detected language:', detectedLanguage);
      
      const { data, error } = await signUp(email, password, firstName, lastName, detectedLanguage);
      
      if (error) {
        
        // Handle specific error cases
        if (error.message?.includes('User already registered')) {
          toast({
            title: "Account bereits vorhanden",
            description: "Ein Account mit dieser E-Mail-Adresse existiert bereits. Bitte melden Sie sich an.",
            variant: "destructive",
          });
        } else if (error.message?.includes('Password should be at least 6 characters')) {
          toast({
            title: "Passwort zu kurz",
            description: "Das Passwort muss mindestens 6 Zeichen lang sein.",
            variant: "destructive",
          });
        } else if (error.message?.includes('Invalid email')) {
          toast({
            title: "Ungültige E-Mail",
            description: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Registrierung fehlgeschlagen",
            description: error.message || "Ein unbekannter Fehler ist aufgetreten",
            variant: "destructive",
          });
        }
        return;
      }


      if (!data.session) {
        // Email confirmation required
        toast({
          title: "🎉 Registrierung erfolgreich!",
          description: "Bitte überprüfen Sie Ihr E-Mail-Postfach und bestätigen Sie Ihre E-Mail-Adresse.",
          duration: 6000,
        });
      } else {
        // Direct login (no email confirmation needed)
        toast({
          title: "🎉 Willkommen!",
          description: "Ihr Account wurde erfolgreich erstellt.",
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
        title: "Registrierung fehlgeschlagen",
        description: "Ein unbekannter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
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
            Vorname
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="firstName"
              type="text"
              placeholder="Max"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
            Nachname
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="lastName"
              type="text"
              placeholder="Mustermann"
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
          E-Mail-Adresse
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="email"
            type="email"
            placeholder="max@beispiel.de"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium text-gray-700">
          Passwort
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Mindestens 6 Zeichen"
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
            Registrierung läuft...
          </>
        ) : (
          "Jetzt kostenlos registrieren"
        )}
      </Button>
      
      <p className="text-xs text-gray-500 text-center">
        Mit der Registrierung stimmen Sie unseren{" "}
        <a href="/datenschutz" className="text-primary hover:underline">
          Datenschutzbestimmungen
        </a>{" "}
        und{" "}
        <a href="/agb" className="text-primary hover:underline">
          AGB
        </a>{" "}
        zu.
      </p>
    </form>
  );
};
