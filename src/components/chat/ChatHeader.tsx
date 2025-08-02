
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useTranslations } from "@/hooks/useTranslations";

interface ChatHeaderProps {
  selectedPetName: string | null;
  trainerName: string;
  selectedPetSpecies?: string;
}

const getPetIcon = (species: string) => {
  if (!species) return '🐾';
  
  const normalizedSpecies = species.toLowerCase().trim();
  
  switch (normalizedSpecies) {
    case 'hund':
    case 'dog': 
      return '🐶';
    case 'katze':
    case 'cat':
    case 'katz':
      return '🐱';
    case 'pferd':
    case 'horse':
      return '🐴';
    case 'vogel':
    case 'bird':
      return '🐦';
    case 'nager':
    case 'hamster':
    case 'meerschweinchen':
    case 'guinea pig':
    case 'rabbit':
    case 'kaninchen':
      return '🐹';
    default: 
      return '🐾';
  }
};

export const ChatHeader = ({ selectedPetName, trainerName, selectedPetSpecies }: ChatHeaderProps) => {
  const { t } = useTranslations();
  const petIcon = selectedPetSpecies ? getPetIcon(selectedPetSpecies) : '🐾';
  
  return (
    <DialogHeader className="pb-4 border-b">
      <DialogTitle className="flex items-center gap-2 text-lg">
        {selectedPetName ? (
          <>
            <span className="text-xl">{petIcon}</span>
            <span className="text-blue-600">{t('chat.header.trainingWith')} {selectedPetName}</span>
          </>
        ) : (
          <>{t('chat.header.generalAdvice')}</>
        )}
      </DialogTitle>
      <DialogDescription className="text-sm">
        {t('chat.header.trainer')} <strong className="text-blue-600">{trainerName}</strong>
        {selectedPetName ? (
          <div className="mt-1 text-xs bg-blue-50 p-2 rounded">
            {t('chat.header.specializedAdvice')} <strong>{selectedPetName}</strong> ({selectedPetSpecies})
          </div>
        ) : (
          <div className="mt-1 text-xs bg-gray-50 p-2 rounded">
            {t('chat.header.selectPetAdvice')}
          </div>
        )}
      </DialogDescription>
    </DialogHeader>
  );
};
