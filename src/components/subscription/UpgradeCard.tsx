import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, ArrowRight } from "lucide-react";
import { CheckoutButton } from "@/components/pricing/CheckoutButton";
import { useTranslation } from "react-i18next";

interface UpgradeCardProps {
  className?: string;
}

export const UpgradeCard = ({ className = "" }: UpgradeCardProps) => {
  const { t } = useTranslation();
  
  return (
    <Card className={`bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Crown className="h-5 w-5" />
          {t('training.upgradeCard.title')}
        </CardTitle>
        <CardDescription>
          {t('training.upgradeCard.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              {t('training.upgradeCard.premiumFeatures')}
            </h4>
            <ul className="text-sm space-y-1">
              <li>• {t('training.upgradeCard.features.unlimitedProfiles')}</li>
              <li>• {t('training.upgradeCard.features.imageAnalysis')}</li>
              <li>• {t('training.upgradeCard.features.trainingPlans')}</li>
              <li>• {t('training.upgradeCard.features.premiumSupport')}</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">{t('training.upgradeCard.immediatelyAvailable')}</h4>
            <p className="text-sm text-muted-foreground">
              {t('training.upgradeCard.immediatelyDescription')}
            </p>
          </div>
        </div>
        
        <div className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <CheckoutButton
              priceType="monthly-basic"
              className="w-full bg-primary hover:bg-primary/90"
            >
              {t('training.upgradeCard.monthlyPlan')}
              <ArrowRight className="h-4 w-4 ml-2" />
            </CheckoutButton>
            <CheckoutButton
              priceType="6month-basic"
              className="w-full variant-outline border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              {t('training.upgradeCard.sixMonthPlan')}
              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">{t('training.upgradeCard.discount')}</span>
            </CheckoutButton>
          </div>
          <p className="text-xs text-center text-muted-foreground mt-2">
            {t('training.upgradeCard.trialInfo')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};