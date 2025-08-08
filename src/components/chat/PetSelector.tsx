
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslations } from "@/hooks/useTranslations";

interface PetProfile {
  id: string;
  name: string;
  species: string;
}

interface PetSelectorProps {
  pets: PetProfile[];
  selectedPet: string;
  onSelectPet: (petId: string) => void;
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

export const PetSelector = ({ pets, selectedPet, onSelectPet }: PetSelectorProps) => {
  const { t } = useTranslations();
  const [isExpanded, setIsExpanded] = useState(selectedPet === "none");

  // Automatisch das erste Tier auswählen, wenn nur eins vorhanden ist
  useEffect(() => {

    if (pets.length === 1 && selectedPet === "none") {
      onSelectPet(pets[0].id);
      setIsExpanded(false); // Kompakte Ansicht für einzelnes Tier
    }
  }, [pets, selectedPet, onSelectPet]);

  if (pets.length === 0) return null;

  const getSelectedPetInfo = () => {
    if (selectedPet === "none") return null;
    return pets.find(p => p.id === selectedPet);
  };

  const selectedPetInfo = getSelectedPetInfo();

  // Für einzelnes Tier: zeige kompakte Info ohne Selector
  if (pets.length === 1 && selectedPetInfo && !isExpanded) {
    return (
      <div className="mb-4">
        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/30 rounded-md border border-blue-200 dark:border-blue-400/50">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getPetIcon(selectedPetInfo.species)}</span>
            <div>
              <div className="font-semibold text-blue-900 dark:text-blue-200">
                {t('chat.petSelector.singlePet.trainingWith')} <strong className="text-foreground">{selectedPetInfo.name}</strong>
              </div>
              <div className="text-xs text-blue-700 dark:text-blue-300">
                {t('chat.petSelector.singlePet.adviceNote')} {selectedPetInfo.name} ({selectedPetInfo.species})
              </div>
            </div>
          </div>
          {pets.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(true)}
              className="text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/50"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Für mehrere Tiere oder erweiterte Ansicht: zeige Selector
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-muted-foreground">
          {t('chat.petSelector.multiplePets.title')} ({pets.length} {pets.length === 1 ? t('chat.petSelector.multiplePets.pet') : t('chat.petSelector.multiplePets.pets')} {t('chat.petSelector.multiplePets.available')})
        </div>
        {selectedPetInfo && pets.length === 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
            className="text-muted-foreground hover:bg-muted"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <Select value={selectedPet} onValueChange={onSelectPet}>
        <SelectTrigger className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-400/50">
          <SelectValue 
            placeholder={t('chat.petSelector.multiplePets.placeholder')} 
          />
        </SelectTrigger>
        <SelectContent>
          {pets.length > 1 && (
            <SelectItem value="none" className="text-muted-foreground">
              {t('chat.petSelector.multiplePets.generalAdvice')}
            </SelectItem>
          )}
          {pets.map(pet => (
            <SelectItem key={pet.id} value={pet.id} className="font-medium">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getPetIcon(pet.species)}</span>
                <div>
                  <div className="font-semibold text-foreground">{pet.name}</div>
                  <div className="text-xs text-muted-foreground">{t('chat.petSelector.multiplePets.trainingFor')} {pet.species}</div>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
    </div>
  );
};
