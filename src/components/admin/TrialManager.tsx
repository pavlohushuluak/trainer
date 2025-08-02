
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Gift, RotateCcw, Search } from "lucide-react";

export const TrialManager = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [trialDays, setTrialDays] = useState("7");
  const [trialStatus, setTrialStatus] = useState<any>(null);
  const { toast } = useToast();

  const handleTrialAction = async (action: string) => {
    if (!email.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie eine E-Mail-Adresse ein",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-trial', {
        body: {
          action,
          targetEmail: email,
          trialDays: parseInt(trialDays)
        }
      });

      if (error) throw error;

      if (action === "check") {
        setTrialStatus(data);
        toast({
          title: "Status geladen",
          description: `Trial-Status für ${email} wurde abgerufen`
        });
      } else {
        toast({
          title: "Erfolgreich",
          description: data.message || "Aktion erfolgreich durchgeführt"
        });
        // Automatisch Status neu laden
        await handleTrialAction("check");
      }
    } catch (error) {
      console.error('Error managing trial:', error);
      toast({
        title: "Fehler",
        description: error instanceof Error ? error.message : "Unbekannter Fehler",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Trial-Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* E-Mail Eingabe */}
        <div className="space-y-2">
          <Label htmlFor="email">Benutzer E-Mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="benutzer@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Trial-Tage Auswahl */}
        <div className="space-y-2">
          <Label htmlFor="trialDays">Trial-Dauer (Tage)</Label>
          <Select value={trialDays} onValueChange={setTrialDays}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 Tage</SelectItem>
              <SelectItem value="7">7 Tage</SelectItem>
              <SelectItem value="14">14 Tage</SelectItem>
              <SelectItem value="30">30 Tage</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Aktionen */}
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => handleTrialAction("check")}
            disabled={loading}
            variant="outline"
          >
            <Search className="h-4 w-4 mr-2" />
            Status prüfen
          </Button>
          
          <Button
            onClick={() => handleTrialAction("reset")}
            disabled={loading}
            variant="outline"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Trial zurücksetzen
          </Button>
          
          <Button
            onClick={() => handleTrialAction("grant")}
            disabled={loading}
          >
            <Gift className="h-4 w-4 mr-2" />
            {trialDays} Tage Trial gewähren
          </Button>
        </div>

        {/* Status Anzeige */}
        {trialStatus && (
          <div className="mt-6 p-4 bg-muted rounded-lg space-y-3">
            <h3 className="font-semibold">Trial-Status für {email}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Trial verwendet:</span>
                <Badge variant={trialStatus.hasUsedTrial ? "destructive" : "default"}>
                  {trialStatus.hasUsedTrial ? "Ja" : "Nein"}
                </Badge>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Trial berechtigt:</span>
                <Badge variant={trialStatus.isEligibleForTrial ? "default" : "secondary"}>
                  {trialStatus.isEligibleForTrial ? "Ja" : "Nein"}
                </Badge>
              </div>
              {trialStatus.trialDaysRemaining > 0 && (
                <div>
                  <span className="text-sm text-muted-foreground">Verbleibende Tage:</span>
                  <Badge variant="outline">
                    {trialStatus.trialDaysRemaining} Tage
                  </Badge>
                </div>
              )}
              {trialStatus.specialTrialEnd && (
                <div>
                  <span className="text-sm text-muted-foreground">Spezial-Trial bis:</span>
                  <Badge variant="outline">
                    {new Date(trialStatus.specialTrialEnd).toLocaleDateString('de-DE')}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info Text */}
        <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded">
          <p><strong>Hinweise:</strong></p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Status prüfen: Zeigt den aktuellen Trial-Status an</li>
            <li>Trial zurücksetzen: Setzt den Trial-Status zurück (als hätte der Benutzer noch nie einen Trial genutzt)</li>
            <li>Trial gewähren: Gewährt eine spezielle Trial-Periode mit der gewählten Anzahl Tage</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
