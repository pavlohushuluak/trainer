
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
import { X, Trophy, Star, Sparkles, CheckCircle, Zap, Crown } from "lucide-react";
import { CompactPlanCard } from "./components/CompactPlanCard";
import { TrainingProgressCard } from "./TrainingProgressCard";
import { useToast } from "@/hooks/use-toast";
import Confetti from 'react-confetti';

interface PlansSectionProps {
  pets?: Pet[];
}

export const PlansSection = ({ pets = [] }: PlansSectionProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedPetFilter, setSelectedPetFilter] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);
  const [selectedPlanForModal, setSelectedPlanForModal] = useState<any>(null);
  const [isPlanDetailModalOpen, setIsPlanDetailModalOpen] = useState(false);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [completedPlan, setCompletedPlan] = useState<any>(null);
  
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

  // Enhanced refetch with success notification and congratulations
  const handleRefetchWithSuccess = async (planId?: string) => {
    await refetch();
    
    // Check if a specific plan was completed
    if (planId && plansWithSteps) {
      const plan = plansWithSteps.find(p => p.id === planId);
      if (plan && plan.steps.every(step => step.is_completed)) {
        setCompletedPlan(plan);
        setShowCongratulations(true);
        return;
      }
    }
    
    // Show regular success notification
    toast({
      title: "✨ Progress Saved!",
      description: "Your training plan has been updated successfully.",
    });
  };

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
  const handleModalStepComplete = async (planId?: string) => {
    console.log('🔄 Modal step completed, refetching data...');
    await handleRefetchWithSuccess(planId);
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
      {/* Confetti for congratulations */}
      {showCongratulations && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          colors={['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']}
        />
      )}

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
                    onStepComplete={() => handleRefetchWithSuccess(plan.id)}
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0" style={{padding: '0px'}}>
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 border-b sticky top-0 bg-background z-10 p-6">
            <div className="flex-1 pl-6">
              <DialogTitle className="text-2xl font-bold text-foreground">
                {selectedPlanForModal?.title}
              </DialogTitle>
              {selectedPlanForModal?.pet_name && (
                <p className="text-sm text-muted-foreground mt-1">
                  Training plan for {selectedPlanForModal.pet_name}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPlanDetailModalOpen(false)}
              className="h-8 w-8 p-0 hover:bg-muted mr-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          
          {selectedPlanForModal && (
            <div className="px-6 pb-6">
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
                onStepComplete={() => handleModalStepComplete(selectedPlanForModal.id)}
                petName={selectedPlanForModal.pet_name}
                petSpecies={selectedPlanForModal.pet_species}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Congratulations Modal */}
      <Dialog open={showCongratulations} onOpenChange={setShowCongratulations}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <div className="relative">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 animate-pulse"></div>
            
            {/* Content */}
            <div className="relative p-8 text-center">
              {/* Animated trophy icon */}
              <div className="mb-8 animate-bounce">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full border-4 border-white/30 shadow-2xl">
                  <Trophy className="h-12 w-12 text-white drop-shadow-lg" />
                </div>
              </div>

              {/* Title with sparkles */}
              <div className="mb-6">
                <h2 className="text-4xl font-bold text-white mb-3 flex items-center justify-center gap-3">
                  <Sparkles className="h-8 w-8 animate-ping text-yellow-300" />
                  Plan Completed!
                  <Sparkles className="h-8 w-8 animate-ping text-yellow-300" style={{ animationDelay: '0.5s' }} />
                </h2>
                <p className="text-white/90 text-xl font-medium">
                  Congratulations on completing your training plan!
                </p>
                <p className="text-white/70 text-sm mt-2">
                  Your dedication has paid off - great job!
                </p>
              </div>

              {/* Plan details */}
              {completedPlan && (
                <div className="mb-8 p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="p-2 bg-green-500/20 rounded-full">
                      <CheckCircle className="h-6 w-6 text-green-300" />
                    </div>
                    <span className="text-white/90 text-lg font-semibold">
                      Training Plan Completed
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-white/5 rounded-lg">
                      <div className="text-white/80 mb-1">Plan Name</div>
                      <div className="text-white font-medium text-sm">
                        {completedPlan.title}
                      </div>
                    </div>
                    {completedPlan.pet_name && (
                      <div className="text-center p-3 bg-white/5 rounded-lg">
                        <div className="text-white/80 mb-1">Trained Pet</div>
                        <div className="text-white font-medium text-sm">
                          {completedPlan.pet_name}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="text-center p-2 bg-white/5 rounded-lg">
                      <div className="text-white/90 text-lg font-bold">
                        {completedPlan.steps.length}
                      </div>
                      <div className="text-white/70 text-xs">Total Steps</div>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded-lg">
                      <div className="text-white/90 text-lg font-bold">
                        {completedPlan.steps.filter((step: any) => step.is_completed).length}
                      </div>
                      <div className="text-white/70 text-xs">Completed</div>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded-lg">
                      <div className="text-white/90 text-lg font-bold">
                        {Math.round((completedPlan.steps.filter((step: any) => step.is_completed).length / completedPlan.steps.length) * 100)}%
                      </div>
                      <div className="text-white/70 text-xs">Success Rate</div>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded-lg">
                      <div className="text-white/90 text-lg font-bold">
                        {completedPlan.steps.reduce((total: number, step: any) => total + (step.reward_points || 10), 0)}
                      </div>
                      <div className="text-white/70 text-xs">Points Earned</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Achievement Highlights */}
              <div className="mb-8 p-6 bg-gradient-to-r from-white/15 to-white/5 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg">
                <h3 className="text-white font-semibold text-lg mb-4 flex items-center justify-center gap-2">
                  <Star className="h-5 w-5 text-yellow-300" />
                  Your Achievements
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-lg border border-white/20">
                    <div className="text-3xl mb-2">🎯</div>
                    <div className="text-white/90 text-sm font-medium">Perfect Execution</div>
                    <div className="text-white/70 text-xs">All steps completed successfully</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-lg border border-white/20">
                    <div className="text-3xl mb-2">⭐</div>
                    <div className="text-white/90 text-sm font-medium">Skill Mastery</div>
                    <div className="text-white/70 text-xs">Training techniques mastered</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-lg border border-white/20">
                    <div className="text-3xl mb-2">🏆</div>
                    <div className="text-white/90 text-sm font-medium">Champion Status</div>
                    <div className="text-white/70 text-xs">Plan completion unlocked</div>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="mb-8">
                <h3 className="text-white font-semibold text-lg mb-4 flex items-center justify-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-300" />
                  What's Next?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-lg border border-white/20">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-500/30 rounded-lg">
                        <Trophy className="h-4 w-4 text-blue-300" />
                      </div>
                      <span className="text-white font-medium text-sm">Create New Plan</span>
                    </div>
                    <p className="text-white/70 text-xs">
                      Start a new training journey with advanced techniques
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-lg border border-white/20">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-green-500/30 rounded-lg">
                        <Star className="h-4 w-4 text-green-300" />
                      </div>
                      <span className="text-white font-medium text-sm">Review Progress</span>
                    </div>
                    <p className="text-white/70 text-xs">
                      Analyze your training data and insights
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-lg border border-white/20">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-purple-500/30 rounded-lg">
                        <Crown className="h-4 w-4 text-purple-300" />
                      </div>
                      <span className="text-white font-medium text-sm">Share Success</span>
                    </div>
                    <p className="text-white/70 text-xs">
                      Share your achievement with the community
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-sm rounded-lg border border-white/20">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-orange-500/30 rounded-lg">
                        <Zap className="h-4 w-4 text-orange-300" />
                      </div>
                      <span className="text-white font-medium text-sm">Advanced Training</span>
                    </div>
                    <p className="text-white/70 text-xs">
                      Explore more challenging training programs
                    </p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => {
                    setShowCongratulations(false);
                    setIsPlanDetailModalOpen(false);
                  }}
                  className="flex-1 bg-gradient-to-r from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 text-white border-white/30 backdrop-blur-sm font-medium py-3"
                >
                  <Zap className="h-5 w-5 mr-2" />
                  Create New Plan
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCongratulations(false)}
                  className="border-white/30 text-white hover:bg-white/10 font-medium py-3"
                >
                  Continue Training
                </Button>
              </div>

              {/* Footer note */}
              <div className="mt-6 pt-4 border-t border-white/20">
                <p className="text-white/60 text-xs">
                  Amazing work! Your dedication to training is inspiring! 🌟
                </p>
              </div>
            </div>
          </div>
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
