import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Mail, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { CheckoutButton } from "@/components/pricing/CheckoutButton";

interface CheckoutRecoveryProps {
  userEmail?: string;
  className?: string;
}

export const CheckoutRecovery = ({ userEmail, className = "" }: CheckoutRecoveryProps) => {
  const [reportEmail, setReportEmail] = useState(userEmail || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleReportIssue = async () => {
    if (!reportEmail) {
      toast({
        title: "E-Mail erforderlich",
        description: "Bitte geben Sie Ihre E-Mail-Adresse ein.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    // Here you could implement issue reporting to support
    // For now, we'll just show a success message
    setTimeout(() => {
      toast({
        title: "Problem gemeldet",
        description: "Wir haben Ihr Problem erhalten und werden uns umgehend darum kümmern.",
      });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <Card className={`border-orange-200 bg-orange-50/50 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <AlertTriangle className="h-5 w-5" />
          Checkout-Problem?
        </CardTitle>
        <CardDescription className="text-orange-700">
          Falls der Checkout nicht funktioniert hat, können Sie es hier erneut versuchen oder uns das Problem melden.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-semibold text-orange-800">Erneut versuchen</h4>
            <div className="space-y-2">
              <CheckoutButton
                priceType="monthly-basic"
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Premium Monatsabo
              </CheckoutButton>
              <CheckoutButton
                priceType="6month-basic"
                className="w-full variant-outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                6-Monats-Paket
              </CheckoutButton>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-orange-800">Problem melden</h4>
            <div className="space-y-2">
              <Label htmlFor="report-email">E-Mail-Adresse</Label>
              <Input
                id="report-email"
                type="email"
                value={reportEmail}
                onChange={(e) => setReportEmail(e.target.value)}
                placeholder="ihre@email.de"
                className="bg-white"
              />
              <Button
                onClick={handleReportIssue}
                disabled={isSubmitting}
                variant="outline"
                className="w-full border-orange-300 text-orange-800 hover:bg-orange-100"
              >
                {isSubmitting ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4 mr-2" />
                )}
                Problem melden
              </Button>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-orange-600 bg-orange-100 p-2 rounded">
          💡 <strong>Tipp:</strong> Überprüfen Sie auch Ihren Spam-Ordner für E-Mails von Stripe oder uns.
        </div>
      </CardContent>
    </Card>
  );
};