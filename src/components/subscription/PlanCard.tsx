
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Crown, ArrowUp } from "lucide-react";
import { CheckoutButton } from "@/components/pricing/CheckoutButton";
import type { PricingPlan } from "../pricing/planData";
import { useTranslation } from "react-i18next";

interface PlanCardProps {
  plan: PricingPlan;
  isCurrentPlan: boolean;
  checkingOut: boolean;
  onCheckout: (priceType: string) => void;
  isSubscribed: boolean;
  showUpgradeBadge?: boolean;
}

export const PlanCard = ({ 
  plan, 
  isCurrentPlan, 
  checkingOut, 
  onCheckout, 
  isSubscribed,
  showUpgradeBadge = false
}: PlanCardProps) => {
  const { t } = useTranslation();
  
  const handleAction = () => {
    if (isCurrentPlan) return;
    onCheckout(plan.id);
  };

  const getButtonText = () => {
    if (isCurrentPlan) return t('training.planCard.currentPlan');
    if (isSubscribed && showUpgradeBadge) return t('training.planCard.upgrade');
    return t('training.planCard.select');
  };

  const getButtonVariant = () => {
    if (isCurrentPlan) return "outline";
    return "default";
  };

  return (
    <Card className={`relative ${plan.isPopular ? 'border-2 border-primary shadow-lg' : ''} ${isCurrentPlan ? 'bg-blue-50 border-blue-200' : ''}`}>
      {plan.isPopular && !isCurrentPlan && (
        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
          {t('training.planCard.popular')}
        </Badge>
      )}
      
      {isCurrentPlan && (
        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white">
          {t('training.planCard.currentPlan')}
        </Badge>
      )}

      {showUpgradeBadge && !isCurrentPlan && (
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <ArrowUp className="h-3 w-3 mr-1" />
            {t('training.planCard.upgrade')}
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-4">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
          <Crown className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <CardDescription className="text-sm">
          {t('training.planCard.upTo')} {plan.maxPets === 999 ? t('training.planCard.unlimited') : plan.maxPets} {t('training.planCard.animals')}
        </CardDescription>
        <div className="text-3xl font-bold text-primary">
          {plan.price} <span className="text-sm font-normal text-gray-500">{plan.period}</span>
        </div>
        {plan.originalPrice && (
          <div className="text-sm text-gray-500 line-through">
            {t('training.planCard.insteadOf')} {plan.originalPrice}
          </div>
        )}
        {plan.savings && (
          <Badge variant="outline" className="text-green-600 border-green-200">
            {plan.savings} {t('training.planCard.save')}
          </Badge>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <ul className="space-y-2 text-sm">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
        
        {isCurrentPlan ? (
          <Button variant={getButtonVariant()} className="w-full" disabled>
            {getButtonText()}
          </Button>
        ) : (
          <CheckoutButton
            priceType={plan.id}
            className="w-full"
          >
            {getButtonText()}
          </CheckoutButton>
        )}
      </CardContent>
    </Card>
  );
};
