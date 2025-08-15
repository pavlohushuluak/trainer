
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { CompactPlanCard } from "./components/CompactPlanCard";
import { TrainingProgressCard } from "./TrainingProgressCard";

interface PlansSectionProps {
  pets?: Pet[];
}

export const PlansSection = ({ pets = [] }: PlansSectionProps) => {
  const { t } = useTranslation();
  const [selectedPetFilter, setSelectedPetFilter] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);
  const [selectedPlanForModal, setSelectedPlanForModal] = useState<any>(null);
  const [isPlanDetailModalOpen, setIsPlanDetailModalOpen] = useState(false);
  
  // Force grid view only
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

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

  // Keep modal data in sync with parent data
  useEffect(() => {
    if (selectedPlanForModal && plansWithSteps) {
      const updatedPlan = plansWithSteps.find((p: any) => p.id === selectedPlanForModal.id);
      if (updatedPlan) {
        console.log('🔄 Updating modal data with fresh plan data');
        setSelectedPlanForModal(updatedPlan);
      }
    }
  }, [plansWithSteps, selectedPlanForModal?.id]);

  // Query state debug info

  const handleConfirmDelete = async () => {
    if (planToDelete) {
      await handleDeletePlan(planToDelete);
      setPlanToDelete(null);
    }
  };

  const handleViewChange = (newView: ViewMode) => {
    // Force grid view only
    setViewMode('grid');
  };

  const handlePlanCardClick = (plan: any) => {
    setSelectedPlanForModal(plan);
    setIsPlanDetailModalOpen(true);
  };

  // Handle step completion in modal - just refetch the data
  const handleModalStepComplete = async () => {
    console.log('🔄 Modal step completed, refetching data...');
    await refetch();
    console.log('✅ Modal data refetched');
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

      {/* Pet Filter - Only show pet filter, no view switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <PetFilter 
          pets={pets}
          selectedPetFilter={selectedPetFilter}
          onPetFilterChange={setSelectedPetFilter}
          plansCount={plansWithSteps?.length || 0}
        />
      </div>

      {/* Training Plans Grid */}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {plansWithSteps?.map((plan) => (
                <div 
                  key={plan.id} 
                  className="cursor-pointer"
                  onClick={() => handlePlanCardClick(plan)}
                >
                  <CompactPlanCard
                    plan={plan}
                    onStepComplete={refetch}
                    onDeletePlan={setPlanToDelete}
                  />
                </div>
              ))}
            </div>
          </SubscriptionGuard>
        )}
      </LoadingStateManager>

      {/* Plan Detail Modal */}
      <Dialog open={isPlanDetailModalOpen} onOpenChange={setIsPlanDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-6 border-b">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-foreground">
                {selectedPlanForModal?.title}
              </DialogTitle>
              {selectedPlanForModal?.pet_name && (
                <p className="text-sm text-muted-foreground mt-1">
                  Training plan for {selectedPlanForModal.pet_name}
                </p>
              )}
            </div>
          </DialogHeader>
          
          {selectedPlanForModal && (
            <div className="pt-4">
              {/* Plan Description */}
              {selectedPlanForModal.description && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg border border-blue-200 dark:border-blue-800 mb-6">
                  <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                    {t('training.trainingPlans.planDescription')}
                  </h3>
                  <p className="text-sm text-blue-600 dark:text-blue-200">
                    {selectedPlanForModal.description}
                  </p>
                </div>
              )}
              
              {/* Training Progress Card with full functionality */}
              <TrainingProgressCard
                planId={selectedPlanForModal.id}
                planTitle={selectedPlanForModal.title}
                steps={selectedPlanForModal.steps}
                onStepComplete={handleModalStepComplete}
                petName={selectedPlanForModal.pet_name}
                petSpecies={selectedPlanForModal.pet_species}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

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
