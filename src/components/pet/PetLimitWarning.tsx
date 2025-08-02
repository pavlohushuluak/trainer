
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Crown, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PetLimitWarningProps {
  currentPetCount: number;
  maxPetsAllowed: number;
  onUpgradeClick: () => void;
}

const scrollToSubscriptionManagement = () => {
  const subscriptionSection = document.querySelector('.subscription-management-section');
  if (subscriptionSection) {
    subscriptionSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Nach dem Scrollen den "Pakete" Tab aktivieren
    setTimeout(() => {
      const paketeTab = document.querySelector('[data-value="plans"]') as HTMLElement;
      if (paketeTab) {
        paketeTab.click();
      }
    }, 500);
  }
};

export const PetLimitWarning = ({ currentPetCount, maxPetsAllowed, onUpgradeClick }: PetLimitWarningProps) => {
  const { t } = useTranslation();
  const isAtLimit = currentPetCount >= maxPetsAllowed;
  const isNearLimit = currentPetCount >= maxPetsAllowed - 1 && maxPetsAllowed > 1;

  if (!isAtLimit && !isNearLimit) return null;

  return (
    <Alert className={`mb-4 ${isAtLimit ? 'border-orange-200 bg-orange-50' : 'border-blue-200 bg-blue-50'}`}>
      <AlertTriangle className={`h-4 w-4 ${isAtLimit ? 'text-orange-600' : 'text-blue-600'}`} />
      <AlertDescription className="space-y-3">
        <div>
          {isAtLimit ? (
            <span className="text-orange-800">
              {t('pets.limit.reached', { max: maxPetsAllowed })}
            </span>
          ) : (
            <span className="text-blue-800">
              {t('pets.limit.near', { current: currentPetCount, max: maxPetsAllowed })}
            </span>
          )}
        </div>
        {isAtLimit && (
          <div className="flex">
            <Button 
              onClick={scrollToSubscriptionManagement} 
              size="sm" 
              className="w-full sm:w-auto min-h-[44px]"
            >
              <Crown className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="sm:inline hidden">{t('pets.limit.upgrade')}</span>
              <span className="sm:hidden">{t('common.upgrade')}</span>
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};
