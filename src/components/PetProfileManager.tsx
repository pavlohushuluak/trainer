
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { useOptimisticPetActions } from "@/components/pet/hooks/useOptimisticPetActions";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import { usePetLimitChecker } from "@/components/subscription/PetLimitChecker";
import { devLog } from "@/utils/performance";
import { PetProfileHeader } from "./pet/PetProfileHeader";
import { PetProfileAlerts } from "./pet/PetProfileAlerts";
import { PetProfileContent } from "./pet/PetProfileContent";
import { UpgradeModal } from "./subscription/UpgradeModal";
import { usePetProfiles } from "@/hooks/usePetProfiles";
import { PetProfile } from "@/store/slices/petProfilesSlice";

interface PetProfileManagerProps {
  shouldOpenPetModal?: boolean;
}

const PetProfileManager = React.memo(({ shouldOpenPetModal = false }: PetProfileManagerProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<PetProfile | null>(null);

  // Use Redux for pet profiles data
  const { pets, createPet, updatePet, removePet } = usePetProfiles();

  const { hasActiveSubscription } = useSubscriptionStatus();
  const { optimisticDelete, isPending } = useOptimisticPetActions();
  const { startMetric, endMetric } = usePerformanceMonitor('PetProfileManager');
  
  const { 
    currentPetCount, 
    maxPetsAllowed, 
    canAddMore, 
    subscriptionTier
  } = usePetLimitChecker();

  devLog('🐾 PetProfileManager - Using Redux pets:', pets.length);

  // Auto-open pet modal if requested via URL parameter
  useEffect(() => {
    if (shouldOpenPetModal) {
      // Scroll to pet section first
      const petSection = document.getElementById('pet-section');
      if (petSection) {
        petSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Wait a bit for scroll to complete, then handle modal
        setTimeout(() => {
          if (canAddMore) {
            setIsDialogOpen(true);
          } else {
            // If user can't add more pets, scroll to subscription management
            const subscriptionSection = document.querySelector('.subscription-management-section');
            if (subscriptionSection) {
              subscriptionSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
              // Activate the "Pakete" tab
              setTimeout(() => {
                const paketeTab = document.querySelector('[data-value="plans"]') as HTMLElement;
                if (paketeTab) {
                  paketeTab.click();
                }
              }, 500);
            }
          }
        }, 500);
      } else {
        if (canAddMore) {
          setIsDialogOpen(true);
        }
      }
      
      // Clear the URL parameter after handling
      const url = new URL(window.location.href);
      url.searchParams.delete('openPetModal');
      window.history.replaceState({}, '', url.toString());
    }
  }, [shouldOpenPetModal, canAddMore]);

  const handleEdit = (pet: PetProfile) => {
    const metricKey = startMetric('edit-pet', 'user-action');
    devLog('🐾 PetProfileManager: Starting edit for pet:', pet.name);
    
    // Allow free users to edit their pet profiles (they can have 1 pet)
    setEditingPet(pet);
    setIsDialogOpen(true);
    endMetric(metricKey, 'edit-pet');
  };

  const handleDelete = async (petId: string, petName: string) => {
    const metricKey = startMetric('delete-pet', 'user-action');
    devLog('🐾 PetProfileManager: Starting delete for pet:', petName);
    
    try {
      // Use Redux action for deletion
      await removePet(petId);
      devLog('🐾 PetProfileManager: Pet deleted successfully');
    } catch (error) {
      devLog('❌ PetProfileManager: Error deleting pet:', error);
    } finally {
      endMetric(metricKey, 'delete-pet');
    }
  };

  // Optimized callback function - no full invalidation needed
  const handlePetSaved = () => {
    devLog('🚀 PetProfileManager: Pet saved - closing dialog immediately (no refresh needed)');
    setIsDialogOpen(false);
    setEditingPet(null);
    // No query invalidation needed - Redux handles the state updates
  };

  return (
    <div className="space-y-6">
      <PetProfileHeader
        currentPetCount={pets.length}
        maxPetsAllowed={maxPetsAllowed || 1}
        subscriptionTier={subscriptionTier || 'free'}
        canAddMore={canAddMore}
        pets={pets}
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        setIsUpgradeModalOpen={setIsUpgradeModalOpen}
        editingPet={editingPet}
        onPetSaved={handlePetSaved}
      />

      <PetProfileAlerts
        petsLength={pets.length}
      />

      <PetProfileContent
        pets={pets}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isPending={isPending}
      />

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        currentPlan={subscriptionTier || 'free'}
        currentPetCount={pets.length}
        maxPetsAllowed={maxPetsAllowed || 1}
      />
    </div>
  );
});

PetProfileManager.displayName = 'PetProfileManager';

export default PetProfileManager;
