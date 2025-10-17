
import { Badge } from "@/components/ui/badge";
import { Crown } from "lucide-react";
import { SubscriptionModeDisplay } from "../subscription/SubscriptionModeDisplay";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { useTranslations } from "@/hooks/useTranslations";

interface PetLimitDisplayProps {
  currentPetCount: number;
  maxPetsAllowed: number;
  subscriptionTier: string;
}

export const PetLimitDisplay = ({ currentPetCount, maxPetsAllowed, subscriptionTier }: PetLimitDisplayProps) => {
  const { t } = useTranslations();
  const { subscriptionMode, subscription } = useSubscriptionStatus();
  const isUnlimited = maxPetsAllowed >= 999;
  
  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
      <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600 dark:text-gray-400">
        <Crown className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
        <span className="whitespace-nowrap">
          {currentPetCount} {t('common.of')} {isUnlimited ? '♾️' : maxPetsAllowed} {t('pets.pets')}
        </span>
      </div>
      
      <SubscriptionModeDisplay 
        mode={subscriptionMode}
        subscriptionTier={subscription?.subscription_tier}
        trialStart={subscription?.trial_start}
      />
    </div>
  );
};
