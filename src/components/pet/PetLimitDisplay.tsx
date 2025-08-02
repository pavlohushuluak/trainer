
import { Badge } from "@/components/ui/badge";
import { Crown } from "lucide-react";
import { SubscriptionModeDisplay } from "../subscription/SubscriptionModeDisplay";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { useTranslation } from "react-i18next";

interface PetLimitDisplayProps {
  currentPetCount: number;
  maxPetsAllowed: number;
  subscriptionTier: string;
}

export const PetLimitDisplay = ({ currentPetCount, maxPetsAllowed, subscriptionTier }: PetLimitDisplayProps) => {
  const { t } = useTranslation();
  const { subscriptionMode, subscription } = useSubscriptionStatus();
  const isUnlimited = maxPetsAllowed >= 999;
  
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="flex items-center gap-2 text-gray-600">
        <Crown className="h-4 w-4" />
        <span>
          {currentPetCount} {t('common.of')} {isUnlimited ? '♾️' : maxPetsAllowed} {t('pets.pets')}
        </span>
      </div>
      
      <SubscriptionModeDisplay 
        mode={subscriptionMode}
        subscriptionTier={subscription?.subscription_tier}
        trialEnd={subscription?.trial_end}
      />
    </div>
  );
};
