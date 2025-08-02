
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Heart, CheckCircle, ArrowUp, Loader2 } from "lucide-react";
import { CheckoutButton } from "@/components/pricing/CheckoutButton";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: string;
  currentPetCount: number;
  maxPetsAllowed: number;
}

const plans = [
  {
    id: "1-tier-monthly",
    name: "1 Tier",
    maxPets: 1,
    price: "9,90",
    features: ["1 Tierprofil", "Unbegrenzte Beratung durch deinen TierTrainer", "Trainingspläne"]
  },
  {
    id: "2-tier-monthly", 
    name: "2 Tiere",
    maxPets: 2,
    price: "14,90",
    features: ["2 Tierprofile", "Unbegrenzte Beratung durch deinen TierTrainer", "Trainingspläne", "Priority Support"]
  },
  {
    id: "3-4-tier-monthly",
    name: "3-4 Tiere", 
    maxPets: 4,
    price: "19,90",
    features: ["Bis zu 4 Tierprofile", "Unbegrenzte Beratung durch deinen TierTrainer", "Trainingspläne", "Priority Support"],
    popular: true
  },
  {
    id: "5-8-tier-monthly",
    name: "5-8 Tiere",
    maxPets: 8, 
    price: "29,90",
    features: ["Bis zu 8 Tierprofile", "Unbegrenzte Beratung durch deinen TierTrainer", "Alle Premium-Features"]
  },
  {
    id: "unlimited-tier-monthly",
    name: "Unbegrenzt",
    maxPets: 999,
    price: "49,90", 
    features: ["Unbegrenzte Tierprofile", "Alle Features", "Premium Support", "Früher Zugang zu neuen Features"]
  }
];

export const UpgradeModal = ({ isOpen, onClose, currentPlan, currentPetCount, maxPetsAllowed }: UpgradeModalProps) => {
  const { t } = useTranslation();
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  
  // Filter nur Pakete, die MEHR Tiere erlauben als das aktuelle
  const availableUpgrades = plans.filter(plan => plan.maxPets > maxPetsAllowed);

  // Finde das aktuelle Paket für Display-Zwecke
  const currentPlanData = plans.find(plan => plan.maxPets === maxPetsAllowed);

  const handleUpgradeClick = (planId: string) => {
    setProcessingPlan(planId);
    // Das CheckoutButton übernimmt ab hier
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <ArrowUp className="h-6 w-6 text-primary" />
            {t('subscription.upgradeModal.title')}
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600 mt-2">
            {t('subscription.upgradeModal.description', { current: currentPetCount, max: maxPetsAllowed })}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          {/* Aktuelles Paket anzeigen */}
          {currentPlanData && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">{t('subscription.upgradeModal.currentPlan')}</h3>
                  <p className="text-sm text-blue-800">
                    {currentPlanData.name} - {t('subscription.upgradeModal.upTo')} {currentPlanData.maxPets === 999 ? t('subscription.upgradeModal.unlimited') : currentPlanData.maxPets} {t('subscription.upgradeModal.pets')}
                  </p>
                </div>
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                  {t('subscription.upgradeModal.active')}
                </Badge>
              </div>
            </div>
          )}

          <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-900 mb-2">{t('subscription.upgradeModal.instantUpgrade')}</h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• {t('subscription.upgradeModal.instantActivation')}</li>
              <li>• {t('subscription.upgradeModal.allFeaturesAvailable')}</li>
              <li>• {t('subscription.upgradeModal.securePayment')}</li>
              <li>• {t('subscription.upgradeModal.cancelAnytime')}</li>
            </ul>
          </div>

          {availableUpgrades.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableUpgrades.map((plan) => (
                <Card key={plan.id} className={`relative ${plan.popular ? 'border-2 border-primary shadow-lg' : ''}`}>
                  {plan.popular && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                      {t('subscription.upgradeModal.popular')}
                    </Badge>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <ArrowUp className="h-3 w-3 mr-1" />
                      {t('subscription.upgradeModal.upgrade')}
                    </Badge>
                  </div>
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                      <Crown className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <CardDescription>
                      {t('subscription.upgradeModal.upTo')} {plan.maxPets === 999 ? t('subscription.upgradeModal.unlimited') : plan.maxPets} {t('subscription.upgradeModal.pets')}
                    </CardDescription>
                    <div className="text-2xl font-bold text-primary">
                      {plan.price}€ <span className="text-sm font-normal text-gray-500">{t('subscription.upgradeModal.perMonth')}</span>
                    </div>
                    <div className="text-xs text-green-600 font-medium">
                      +{plan.maxPets === 999 ? t('subscription.upgradeModal.unlimited') : (plan.maxPets - maxPetsAllowed)} {t('subscription.upgradeModal.morePets')}
                    </div>
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
                    <CheckoutButton
                      priceType={plan.id}
                      className="w-full"
                    >
                      {processingPlan === plan.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          {t('subscription.upgradeModal.processing')}
                        </>
                      ) : (
                        t('subscription.upgradeModal.upgradeNow')
                      )}
                    </CheckoutButton>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Crown className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('subscription.upgradeModal.maxPlanReached')}
              </h3>
              <p className="text-gray-600">
                {t('subscription.upgradeModal.maxPlanDescription', { max: maxPetsAllowed === 999 ? t('subscription.upgradeModal.unlimited') : maxPetsAllowed })}
              </p>
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 text-center">
              {t('subscription.upgradeModal.securityInfo')}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
