
import { CheckoutButton } from "./CheckoutButton";
import { AmazonPayButton } from "./AmazonPayButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Star } from "lucide-react";
import { PricingPlan } from "./planData";
import { useTranslations } from "@/hooks/useTranslations";

interface PricingPlanCardProps {
  plan: PricingPlan;
}

export const PricingPlanCard = ({ plan }: PricingPlanCardProps) => {
  const { t } = useTranslations();
  const isUnlimited = plan.maxPets >= 900;
  const isSixMonth = 'savings' in plan && plan.savings;
  
  return (
    <Card 
      className={`relative ${plan.isPopular ? "border-2 border-primary bg-gradient-to-br from-primary/5 to-primary/10" : "border-border"} transition-all duration-300 hover:shadow-lg`}
    >
      {plan.isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground px-3 py-1">
            <Star className="h-3 w-3 mr-1" />
            {t('pricing.planCard.popular')}
          </Badge>
        </div>
      )}
      
      <CardHeader className="text-center p-2 pt-6">
        <CardTitle className="flex items-center justify-center gap-2 text-lg">
          <Crown className="h-5 w-5 text-primary" />
          {plan.name}
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          {isUnlimited ? t('pricing.planCard.unlimited') : `${t('pricing.planCard.upTo')} ${plan.maxPets}`} {t('pricing.planCard.pets')}
        </div>
      </CardHeader>
      
      <CardContent className="text-center space-y-4 p-4 pb-2">
        <div>
          <div className="text-2xl font-bold text-primary">
            {plan.price}
          </div>
          <div className="text-sm text-muted-foreground">
            {plan.period}
          </div>
          {isSixMonth && plan.savings && plan.savings !== "0€" && (
            <div className="text-sm text-green-600 font-medium mt-1">
              {t('pricing.planCard.save')} {plan.savings}
            </div>
          )}
        </div>
        
        <ul className="space-y-2 text-xs">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-left leading-tight">{feature}</span>
            </li>
          ))}
        </ul>
        
        <div className="space-y-2">
          <CheckoutButton 
            priceType={plan.id}
            className={`w-full ${plan.isPopular ? "bg-primary hover:bg-primary/90 text-primary-foreground" : ""}`}
          >
            {t('pricing.planCard.startNow')}
          </CheckoutButton>
        </div>
      </CardContent>
    </Card>
  );
};
