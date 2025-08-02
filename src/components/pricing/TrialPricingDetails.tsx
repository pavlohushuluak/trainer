
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckoutButton } from "./CheckoutButton";
import { Shield, Heart, Star } from "lucide-react";
import { useTranslation } from "react-i18next";

interface TrialPricingDetailsProps {
  isYearly: boolean;
  selectedPlan: string;
}

export const TrialPricingDetails = ({ isYearly, selectedPlan }: TrialPricingDetailsProps) => {
  const { t } = useTranslation();
  const planPrices = {
    "1-tier": { monthly: "9,90", sixMonth: "59,40" },
    "2-tier": { monthly: "14,90", sixMonth: "74,50" },
    "3-4-tier": { monthly: "19,90", sixMonth: "99,50" },
    "5-8-tier": { monthly: "29,90", sixMonth: "149,50" },
    "unlimited-tier": { monthly: "49,90", sixMonth: "249,50" }
  };

  const selectedPrice = planPrices[selectedPlan as keyof typeof planPrices];
  
  if (!selectedPrice) return null;

  return (
    <Card className="sticky top-4 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl font-bold flex items-center justify-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          {t('pricing.trialDetails.yourSelection')}
          <Star className="h-5 w-5 text-primary" />
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-center">
          {isYearly ? (
            <>
              <div className="text-3xl font-bold text-primary">
                {selectedPrice.sixMonth}€
                <span className="text-sm text-muted-foreground font-normal">{t('pricing.trialDetails.perSixMonths')}</span>
              </div>
              <div className="text-sm text-primary font-medium">
                {t('pricing.trialDetails.equivalentTo')} {selectedPrice.monthly}€{t('pricing.perMonth')}
              </div>
            </>
          ) : (
            <div className="text-3xl font-bold text-primary">
              {selectedPrice.monthly}€
              <span className="text-sm text-muted-foreground font-normal">{t('pricing.perMonth')}</span>
            </div>
          )}
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-green-600" />
            <div className="text-lg font-bold text-green-600">
              {t('pricing.guarantee')}
            </div>
          </div>
          <div className="text-xs text-green-700">
            {t('pricing.trialDetails.notSatisfied')}
          </div>
        </div>

        <CheckoutButton 
          priceType={isYearly ? `${selectedPlan}-sixmonth` : `${selectedPlan}-monthly`}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {t('pricing.trialDetails.startFreeNow')}
        </CheckoutButton>
        
        <div className="text-xs text-center text-muted-foreground">
          {t('pricing.trialDetails.guaranteeIncluded')}
        </div>

        <div className="bg-blue-50 p-3 rounded text-center border border-blue-200">
          <div className="text-blue-800 font-medium text-sm">
            {t('pricing.trialDetails.cancelFirst14Days')}
          </div>
          <div className="text-xs text-blue-600 mt-1">
            {t('pricing.trialDetails.noQuestions')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
