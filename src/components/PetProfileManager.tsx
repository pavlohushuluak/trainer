
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { UpgradeModal } from "./subscription/UpgradeModal";
import { usePetLimitChecker } from "./subscription/PetLimitChecker";
import { PetProfileHeader } from "./pet/PetProfileHeader";
import { PetProfileAlerts } from "./pet/PetProfileAlerts";
import { PetProfileContent } from "./pet/PetProfileContent";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { useQueryClient } from "@tanstack/react-query";
import { useOptimisticPetActions } from "./pet/hooks/useOptimisticPetActions";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import { devLog } from "@/utils/performance";

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
  updated_at: string;
  user_id: string;
}

interface PetProfileManagerProps {
  pets?: PetProfile[];
}

const PetProfileManager = React.memo(({ pets = [] }: PetProfileManagerProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<PetProfile | null>(null);

  const { hasActiveSubscription } = useSubscriptionStatus();
  const { optimisticDelete, isPending } = useOptimisticPetActions();
  const { startMetric, endMetric } = usePerformanceMonitor('PetProfileManager');
  
  const { 
    currentPetCount, 
    maxPetsAllowed, 
    canAddMore, 
    subscriptionTier
  } = usePetLimitChecker();

  devLog('🐾 PetProfileManager - Using passed pets:', pets.length);

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
      await optimisticDelete(petId, petName);
      devLog('🐾 PetProfileManager: Pet deleted successfully');
    } catch (error) {
      devLog('❌ PetProfileManager: Error deleting pet:', error);
    } finally {
      endMetric(metricKey, 'delete-pet');
    }
  };

  // Optimierte Callback-Funktion - keine vollständige Invalidierung
  const handlePetSaved = () => {
    devLog('🚀 PetProfileManager: Pet saved - closing dialog immediately (no refresh needed)');
    setIsDialogOpen(false);
    setEditingPet(null);
    // Keine Query-Invalidierung - optimistische Updates handhaben das bereits
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
