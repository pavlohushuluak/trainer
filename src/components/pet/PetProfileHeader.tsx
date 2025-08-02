
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { PetLimitDisplay } from "./PetLimitDisplay";
import PetProfileForm from "./PetProfileForm";
import { SubscriptionRequiredWarning } from "../subscription/SubscriptionRequiredWarning";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { useTranslation } from "react-i18next";

interface PetProfile {
  id: string;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  birth_date?: string;
  behavior_focus?: string;
  notes?: string;
  created_at: string;
}

interface PetProfileHeaderProps {
  currentPetCount: number;
  maxPetsAllowed: number;
  subscriptionTier: string;
  canAddMore: boolean;
  pets: PetProfile[];
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  setIsUpgradeModalOpen: (open: boolean) => void;
  editingPet: PetProfile | null;
  onPetSaved: () => void;
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

export const PetProfileHeader = ({
  currentPetCount,
  maxPetsAllowed,
  subscriptionTier,
  canAddMore,
  pets,
  isDialogOpen,
  setIsDialogOpen,
  setIsUpgradeModalOpen,
  editingPet,
  onPetSaved
}: PetProfileHeaderProps) => {
  const { t } = useTranslation();
  const { hasActiveSubscription, subscriptionTierName } = useSubscriptionStatus();
  
  // Check if user has a valid plan (plan1-plan5) OR is a free user who can create their first pet
  const hasValidPlan = hasActiveSubscription && subscriptionTierName && 
    ['1 Tier', '2 Tiere', '3-4 Tiere', '5-8 Tiere', 'Unbegrenzt'].includes(subscriptionTierName);
  
  // Free users can create their first pet profile (maxPetsAllowed = 1 for free users)
  const canCreatePet = hasValidPlan || (maxPetsAllowed > 0 && canAddMore);

  const handleCreateNew = () => {
    if (!canCreatePet) {
      // Show subscription warning instead of redirecting
      return;
    }
    if (!canAddMore) {
      scrollToSubscriptionManagement();
      return;
    }
    setIsDialogOpen(true);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
      <div className="space-y-2 flex-1">
        <PetLimitDisplay 
          currentPetCount={currentPetCount}
          maxPetsAllowed={maxPetsAllowed}
          subscriptionTier={subscriptionTier}
        />
        {pets.length > 0 && (
          <p className="text-sm text-gray-600">
            {t('training.petProfilesSection.description')}
          </p>
        )}
      </div>
      

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={handleCreateNew} 
              size="sm"
              className={`${canAddMore ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-500 hover:bg-orange-600'} text-white w-fit sm:w-auto min-h-[44px] shrink-0`}
              disabled={!canCreatePet}
            >
              <PlusCircle className="mr-2 h-4 w-4 flex-shrink-0" />
              <span>
                {canAddMore ? t('pets.addPet') : t('common.upgrade')}
              </span>
            </Button>
          </DialogTrigger>
          {canAddMore && (
            <PetProfileForm
              editingPet={editingPet}
              onPetSaved={onPetSaved}
              onClose={() => setIsDialogOpen(false)}
            />
          )}
        </Dialog>
    </div>
  );
};
