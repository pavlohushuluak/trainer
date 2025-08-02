
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Clock, Gift, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

export const MyTrialStatus = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [trialStatus, setTrialStatus] = useState<any>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const checkMyTrialStatus = async () => {
    if (!user?.email) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-trial', {
        body: {
          action: "check"
        }
      });

      if (error) throw error;
      setTrialStatus(data);
    } catch (error) {
      console.error('Error checking trial status:', error);
      toast({
        title: t('subscription.trialStatus.error'),
        description: t('subscription.trialStatus.couldNotLoad'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      checkMyTrialStatus();
    }
  }, [user?.email]);

  if (!user) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          {t('subscription.trialStatus.myTrialStatus')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {trialStatus ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t('subscription.trialStatus.trialEligibility')}:</span>
                <Badge variant={trialStatus.isEligibleForTrial ? "default" : "secondary"}>
                  {trialStatus.isEligibleForTrial ? t('subscription.trialStatus.eligible') : t('subscription.trialStatus.notEligible')}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t('subscription.trialStatus.trialUsed')}:</span>
                <Badge variant={trialStatus.hasUsedTrial ? "destructive" : "default"}>
                  {trialStatus.hasUsedTrial ? t('subscription.trialStatus.alreadyUsed') : t('subscription.trialStatus.stillAvailable')}
                </Badge>
              </div>
            </div>

            {trialStatus.trialDaysRemaining > 0 && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">{t('subscription.trialStatus.activeTrial')}</span>
                </div>
                <p className="text-sm text-green-700">
                  {t('subscription.trialStatus.daysRemaining', { days: trialStatus.trialDaysRemaining })}
                </p>
                {trialStatus.specialTrialEnd && (
                  <p className="text-xs text-green-600 mt-1">
                    {t('subscription.trialStatus.trialEnd')}: {new Date(trialStatus.specialTrialEnd).toLocaleDateString('de-DE')}
                  </p>
                )}
              </div>
            )}

            {trialStatus.isEligibleForTrial && trialStatus.trialDaysRemaining === 0 && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-800">{t('subscription.trialStatus.trialAvailable')}</span>
                </div>
                <p className="text-sm text-blue-700">
                  {t('subscription.trialStatus.canStartTrial')}
                </p>
              </div>
            )}

            {!trialStatus.isEligibleForTrial && (
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  {t('subscription.trialStatus.trialAlreadyUsed')}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground">{t('subscription.trialStatus.loading')}</p>
          </div>
        )}

        <Button
          onClick={checkMyTrialStatus}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {t('subscription.trialStatus.refreshStatus')}
        </Button>
      </CardContent>
    </Card>
  );
};
