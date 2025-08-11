
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChatHeader } from "./chat/ChatHeader";
import { PetSelector } from "./chat/PetSelector";
import { ChatMessages } from "./chat/ChatMessages";
import { ChatInput } from "./chat/ChatInput";
import { FreeChatLimitDisplay } from "./chat/FreeChatLimitDisplay";
import { PetProfileRequiredCard } from "./chat/PetProfileRequiredCard";

import { useOptimizedChat } from "./chat/hooks/useOptimizedChat";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { useTranslations } from "@/hooks/useTranslations";
import { usePetProfiles } from "@/hooks/usePetProfiles";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatModal = ({ isOpen, onClose }: ChatModalProps) => {
  const { t, currentLanguage } = useTranslations();
  const { pets } = usePetProfiles();
  
  // Separate subscription hook for immediate status
  const { hasActiveSubscription: premiumStatus, subscriptionMode, isLoading: subscriptionLoading } = useSubscriptionStatus();
  
  const {
    message,
    setMessage,
    messages,
    selectedPet,
    setSelectedPet,
    pets: chatPets,
    loading,
    sendMessage,
    handleKeyPress,
    getSelectedPetName,
    getTrainerName,
    getSelectedPetSpecies,
    canSendMessage,
    hasPets,
    hasActiveSubscription,
    usage,
    usageLoading
  } = useOptimizedChat(isOpen, pets);

  // Use the more reliable premium status
  const isPremiumUser = premiumStatus || hasActiveSubscription;
  const shouldShowFreeChatLimit = hasPets && !isPremiumUser && !subscriptionLoading;
  
  // Sofortiger Input sobald Pets verfügbar - immer zeigen wenn Tiere da sind
  const canShowInput = hasPets;
  
  // Nur bei echten Blockern deaktivieren: API-Limit erreicht oder gerade am Senden
  const isInputDisabled = loading || (!isPremiumUser && usage.hasReachedLimit && !usageLoading);

  // Optimistische Placeholder-Logik
  const getPlaceholder = () => {
    if (!hasPets) {
      return t('chat.modal.placeholders.noPets');
    }
    if (!isPremiumUser && usage.hasReachedLimit) {
      return t('chat.modal.placeholders.limitReached');
    }
    if (loading) {
      return t('chat.modal.placeholders.sending');
    }
    return t('chat.modal.placeholders.default');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[90vw] max-h-[85vh] overflow-y-auto flex flex-col">
        <ChatHeader 
          selectedPetName={getSelectedPetName()} 
          trainerName={getTrainerName()}
          selectedPetSpecies={getSelectedPetSpecies()}
        />

        {/* Debug button for language testing */}
        <div className="p-2 border-b">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              console.log('🌍 Debug - Current language:', currentLanguage);
              console.log('🌍 Debug - localStorage:', localStorage.getItem('i18nextLng'));
            }}
          >
            Debug Language: {currentLanguage}
          </Button>
        </div>

        {/* Tierprofil-Warnung nur wenn keine Tiere vorhanden */}
        {!hasPets && <PetProfileRequiredCard />}

        {/* Gratis-Limit für nicht-Premium Nutzer mit Tieren */}
        {shouldShowFreeChatLimit && (
          <FreeChatLimitDisplay 
            questionsUsed={usage.questionsUsed}
            maxQuestions={usage.maxQuestions}
            hasReachedLimit={usage.hasReachedLimit}
            onUpgrade={onClose}
          />
        )}

        {/* Pet Selector nur zeigen wenn Tiere vorhanden */}
        {hasPets && (
          <PetSelector 
            pets={chatPets}
            selectedPet={selectedPet}
            onSelectPet={setSelectedPet}
          />
        )}

        <div>
          <ChatMessages 
            messages={messages}
            loading={loading}
            selectedPetName={getSelectedPetName()}
            trainerName={getTrainerName()}
          />
        </div>

        {/* Chat Input - sofort verfügbar wenn Tiere vorhanden */}
        {canShowInput && (
          <ChatInput 
            message={message}
            loading={isInputDisabled}
            onMessageChange={setMessage}
            onSendMessage={sendMessage}
            onKeyPress={handleKeyPress}
            placeholder={getPlaceholder()}
          />
        )}
      </DialogContent>
      
    </Dialog>
  );
};
