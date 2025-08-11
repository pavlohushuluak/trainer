
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/hooks/useTranslations";
import { RefreshCw, Gift, RotateCcw, Search } from "lucide-react";

export const TrialManager = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [trialDays, setTrialDays] = useState("7");
  const [trialStatus, setTrialStatus] = useState<any>(null);
  const { toast } = useToast();
  const { t, currentLanguage } = useTranslations();

  const handleTrialAction = async (action: string) => {
    if (!email.trim()) {
      toast({
        title: t('trialManager.toasts.emailRequired.title'),
        description: t('trialManager.toasts.emailRequired.description'),
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
          title: t('trialManager.toasts.statusLoaded.title'),
          description: t('trialManager.toasts.statusLoaded.description', { email })
        });
      } else {
        toast({
          title: t('trialManager.toasts.success.title'),
          description: data.message || t('trialManager.toasts.success.description')
        });
        // Automatically reload status
        await handleTrialAction("check");
      }
    } catch (error) {
      console.error('Error managing trial:', error);
      toast({
        title: t('trialManager.toasts.error.title'),
        description: t('trialManager.toasts.error.description', { 
          error: error instanceof Error ? error.message : t('trialManager.toasts.unknownError') 
        }),
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
          {t('trialManager.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email Input */}
        <div className="space-y-2">
          <Label htmlFor="email">{t('trialManager.userEmail')}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t('trialManager.userEmailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Trial Days Selection */}
        <div className="space-y-2">
          <Label htmlFor="trialDays">{t('trialManager.trialDuration')}</Label>
          <Select value={trialDays} onValueChange={setTrialDays}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 {t('trialManager.status.days')}</SelectItem>
              <SelectItem value="7">7 {t('trialManager.status.days')}</SelectItem>
              <SelectItem value="14">14 {t('trialManager.status.days')}</SelectItem>
              <SelectItem value="30">30 {t('trialManager.status.days')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => handleTrialAction("check")}
            disabled={loading}
            variant="outline"
          >
            <Search className="h-4 w-4 mr-2" />
            {t('trialManager.actions.checkStatus')}
          </Button>
          
          <Button
            onClick={() => handleTrialAction("reset")}
            disabled={loading}
            variant="outline"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            {t('trialManager.actions.resetTrial')}
          </Button>
          
          <Button
            onClick={() => handleTrialAction("grant")}
            disabled={loading}
          >
            <Gift className="h-4 w-4 mr-2" />
            {t('trialManager.actions.grantTrial', { days: trialDays })}
          </Button>
        </div>

        {/* Status Display */}
        {trialStatus && (
          <div className="mt-6 p-4 bg-muted rounded-lg space-y-3">
            <h3 className="font-semibold">{t('trialManager.status.title', { email })}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">{t('trialManager.status.trialUsed')}</span>
                <Badge variant={trialStatus.hasUsedTrial ? "destructive" : "default"}>
                  {trialStatus.hasUsedTrial ? t('trialManager.status.yes') : t('trialManager.status.no')}
                </Badge>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">{t('trialManager.status.trialEligible')}</span>
                <Badge variant={trialStatus.isEligibleForTrial ? "default" : "secondary"}>
                  {trialStatus.isEligibleForTrial ? t('trialManager.status.yes') : t('trialManager.status.no')}
                </Badge>
              </div>
              {trialStatus.trialDaysRemaining > 0 && (
                <div>
                  <span className="text-sm text-muted-foreground">{t('trialManager.status.remainingDays')}</span>
                  <Badge variant="outline">
                    {trialStatus.trialDaysRemaining} {t('trialManager.status.days')}
                  </Badge>
                </div>
              )}
              {trialStatus.specialTrialEnd && (
                <div>
                  <span className="text-sm text-muted-foreground">{t('trialManager.status.specialTrialEnd')}</span>
                  <Badge variant="outline">
                    {new Date(trialStatus.specialTrialEnd).toLocaleDateString(currentLanguage === 'de' ? 'de-DE' : 'en-US')}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info Text */}
        <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded">
          <p><strong>{t('trialManager.info.title')}</strong></p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>{t('trialManager.info.checkStatus')}</li>
            <li>{t('trialManager.info.resetTrial')}</li>
            <li>{t('trialManager.info.grantTrial')}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
