
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Pet } from "./types";

interface PetFilterProps {
  pets: Pet[];
  selectedPetFilter: string;
  onPetFilterChange: (petId: string) => void;
  plansCount?: number;
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

const getFilterDisplayName = (selectedPetFilter: string, pets: Pet[], t: any) => {
  if (selectedPetFilter === "all") return t('training.petFilter.allPets');
  if (selectedPetFilter === "none") return t('training.petFilter.generalPlans');
  if (selectedPetFilter === "unassigned") return t('training.petFilter.unassigned');
  
  const pet = pets.find(p => p.id === selectedPetFilter);
  if (pet) {
    return `${getPetIcon(pet.species)} ${pet.name}`;
  }
  
  return t('training.petFilter.selectPet');
};

export const PetFilter = ({ pets, selectedPetFilter, onPetFilterChange, plansCount = 0 }: PetFilterProps) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const handlePetFilterChange = (value: string) => {
    onPetFilterChange(value);
    // Invalidate training plans cache for immediate refresh
    queryClient.invalidateQueries({ 
      queryKey: ['training-plans-with-steps'],
      exact: false 
    });
  };

  // Enhanced pet validation with fallbacks
  const validPets = pets.filter(pet => {
    if (!pet || !pet.id) {
      return false;
    }
    
    // Accept pets with fallback values
    const hasName = pet.name && pet.name !== 'undefined';
    const hasSpecies = pet.species && pet.species !== 'undefined';
    
    if (!hasName || !hasSpecies) {
      return false;
    }
    
    return true;
  });

  // Always show filter when there are pets (even with just one pet)
  if (validPets.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-4 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">{t('training.petFilter.title')}</span>
          <Select value={selectedPetFilter} onValueChange={handlePetFilterChange}>
            <SelectTrigger className="w-64 bg-white border-2 border-blue-200 hover:border-blue-300 transition-colors">
              <SelectValue>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{getFilterDisplayName(selectedPetFilter, validPets, t)}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white border-2 border-gray-200 shadow-lg z-50">
              <SelectItem value="all" className="hover:bg-blue-50">
                <div className="flex items-center gap-2">
                  <span>🌟</span>
                  <span className="font-medium">{t('training.petFilter.showAllPets')}</span>
                </div>
              </SelectItem>
              <SelectItem value="none" className="hover:bg-gray-50">
                <div className="flex items-center gap-2">
                  <span>📋</span>
                  <span>{t('training.petFilter.generalPlans')}</span>
                </div>
              </SelectItem>
              <SelectItem value="unassigned" className="hover:bg-orange-50">
                <div className="flex items-center gap-2">
                  <span>❓</span>
                  <span>{t('training.petFilter.unassignedPlans')}</span>
                </div>
              </SelectItem>
              {validPets.map(pet => (
                <SelectItem key={pet.id} value={pet.id} className="hover:bg-blue-50">
                  <div className="flex items-center gap-2">
                    <span>{getPetIcon(pet.species)}</span>
                    <span className="font-medium">{pet.name}</span>
                    <span className="text-gray-500 text-sm">({pet.species})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {plansCount > 0 && (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {plansCount} {plansCount === 1 ? t('training.petFilter.plan') : t('training.petFilter.plans')}
          </Badge>
        )}
      </div>
      
      <div className="text-xs text-gray-500">
        {selectedPetFilter === "all" && t('training.petFilter.description.allPets')}
        {selectedPetFilter === "none" && t('training.petFilter.description.generalPlans')}
        {selectedPetFilter === "unassigned" && t('training.petFilter.description.unassignedPlans')}
        {selectedPetFilter !== "all" && selectedPetFilter !== "none" && selectedPetFilter !== "unassigned" && (
          t('training.petFilter.description.specificPet', { 
            petName: validPets.find(p => p.id === selectedPetFilter)?.name || t('training.petFilter.selectedPet') 
          })
        )}
      </div>
    </div>
  );
};
