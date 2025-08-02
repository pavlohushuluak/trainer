
import { RewardsDisplay } from "./RewardsDisplay";
import { EmptyPlansState } from "./EmptyPlansState";
import { PetFilter } from "./PetFilter";
import { CreatePlanModal } from "./CreatePlanModal";
import { TemplateSelectionModal } from "./TemplateSelectionModal";
import { PlansHeader } from "./components/PlansHeader";
import { PlansList, ViewMode } from "./components/PlansList";
import { ViewSwitcher } from "./components/ViewSwitcher";
import { DeletePlanDialog } from "./components/DeletePlanDialog";
import { LoadingStateManager } from "./LoadingStateManager";
import { usePlansWithSteps } from "./hooks/usePlansWithSteps";
import { usePlanActions } from "./hooks/usePlanActions";
import { useState, useMemo, useEffect } from "react";
import { SubscriptionGuard } from "../auth/SubscriptionGuard";
import { Pet } from './types';
import { useTranslation } from 'react-i18next';

interface PlansSectionProps {
  pets?: Pet[];
}

export const PlansSection = ({ pets = [] }: PlansSectionProps) => {
  const { t } = useTranslation();
  const [selectedPetFilter, setSelectedPetFilter] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('training-plans-view');
    return (saved as ViewMode) || 'list';
  });

  // Debug pets data when component mounts or pets change
  useEffect(() => {
    // Validate that the currently selected pet still exists
    if (selectedPetFilter !== "all" && selectedPetFilter !== "none") {
      const selectedPetExists = pets.some(pet => pet.id === selectedPetFilter);
      if (!selectedPetExists && pets.length > 0) {
        setSelectedPetFilter(pets[0].id);
      } else if (!selectedPetExists && pets.length === 0) {
        setSelectedPetFilter("all");
      }
    }
  }, [pets, selectedPetFilter]);

  const { data: plansWithSteps, isLoading: plansLoading, error: plansError, refetch } = usePlansWithSteps(selectedPetFilter);
  const { handleTemplateSelect, handleDeletePlan } = usePlanActions(refetch);

  // Query state debug info

  const handleConfirmDelete = async () => {
    if (planToDelete) {
      await handleDeletePlan(planToDelete);
      setPlanToDelete(null);
    }
  };

  const handleViewChange = (newView: ViewMode) => {
    setViewMode(newView);
    localStorage.setItem('training-plans-view', newView);
  };

  const selectedPet = useMemo(() => {
    const pet = selectedPetFilter !== "all" 
      ? pets.find(pet => pet.id === selectedPetFilter)
      : pets[0];
    
    return pet;
  }, [selectedPetFilter, pets]);

  // Show error state if there's an error
  if (plansError) {
    console.error('🎯 PlansSection - Rendering error state:', plansError);
  }

  return (
    <div className="space-y-6">
      {/* Header Section - Always visible */}
      <SubscriptionGuard 
        fallbackMessage={t('training.subscriptionGuard.premiumFeatures')}
        showUpgradeButton={true}
      >
        <div className="space-y-6">
          <PlansHeader 
            onCreateClick={() => setIsCreateModalOpen(true)}
            onTemplateClick={() => setIsTemplateModalOpen(true)}
          />
          <RewardsDisplay />
        </div>
      </SubscriptionGuard>

      {/* Pet Filter & View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PetFilter 
          pets={pets}
          selectedPetFilter={selectedPetFilter}
          onPetFilterChange={setSelectedPetFilter}
          plansCount={plansWithSteps?.length || 0}
        />
        
        {(plansWithSteps || []).length > 0 && (
          <ViewSwitcher
            view={viewMode}
            onViewChange={handleViewChange}
          />
        )}
      </div>

      {/* Training Plans List */}
      <LoadingStateManager
        isLoading={plansLoading}
        loadingMessage={t('training.plans.loadingMessage')}
        hasError={!!plansError}
        errorMessage={plansError?.message || t('training.plans.loadingError')}
      >
        {(plansWithSteps || []).length === 0 ? (
          <EmptyPlansState />
        ) : (
          <SubscriptionGuard 
            fallbackMessage={t('training.subscriptionGuard.savedPlans')}
            showUpgradeButton={true}
          >
            <PlansList 
              plans={plansWithSteps || []}
              onStepComplete={refetch}
              onDeletePlan={setPlanToDelete}
              viewMode={viewMode}
            />
          </SubscriptionGuard>
        )}
      </LoadingStateManager>

      {/* Modals */}
      <CreatePlanModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPlanCreated={refetch}
        pets={pets}
      />

      <TemplateSelectionModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={(template, petId) => handleTemplateSelect(template, petId)}
        pets={pets}
      />

      <DeletePlanDialog
        isOpen={!!planToDelete}
        onClose={() => setPlanToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
