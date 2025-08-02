
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Heart, Crown, Lock } from "lucide-react";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { useTranslation } from "react-i18next";

interface PetProfileAlertsProps {
  petsLength: number;
}

export const PetProfileAlerts = ({
  petsLength
}: PetProfileAlertsProps) => {
  const { t } = useTranslation();
  const { hasActiveSubscription, subscriptionTierName } = useSubscriptionStatus();
  
  // Check if user has a valid plan (plan1-plan5)
  const hasValidPlan = hasActiveSubscription && subscriptionTierName && 
    ['1 Tier', '2 Tiere', '3-4 Tiere', '5-8 Tiere', 'Unbegrenzt'].includes(subscriptionTierName);

  return (
    <>

      {/* Success message for new users with valid plan */}
      {petsLength === 0 && hasValidPlan && (
        <Alert className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
          <Heart className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            <strong>{t('pets.welcome.title')}</strong> {t('pets.welcome.description')}
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};
