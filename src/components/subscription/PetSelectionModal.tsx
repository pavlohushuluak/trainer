
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

interface PetProfile {
  id: string;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  notes?: string;
}

interface PetSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  pets: PetProfile[];
  maxAllowed: number;
  onSelectionComplete: () => void;
}

const getPetIcon = (species: string) => {
  const normalizedSpecies = species.toLowerCase().trim();
  switch (normalizedSpecies) {
    case 'hund':
    case 'dog': 
      return '🐶';
    case 'katze':
    case 'cat':
      return '🐱';
    case 'pferd':
    case 'horse':
      return '🐴';
    case 'vogel':
    case 'bird':
      return '🐦';
    default: 
      return '🐾';
  }
};

export const PetSelectionModal = ({ 
  isOpen, 
  onClose, 
  pets, 
  maxAllowed, 
  onSelectionComplete 
}: PetSelectionModalProps) => {
  const [selectedPets, setSelectedPets] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const handlePetToggle = (petId: string) => {
    setSelectedPets(prev => {
      if (prev.includes(petId)) {
        return prev.filter(id => id !== petId);
      } else if (prev.length < maxAllowed) {
        return [...prev, petId];
      }
      return prev;
    });
  };

  const handleConfirmSelection = async () => {
    if (selectedPets.length === 0) {
      toast({
        title: t('subscription.petSelection.selectionRequired.title'),
        description: t('subscription.petSelection.selectionRequired.description', { maxAllowed }),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Archive non-selected pets by adding a note to indicate they are archived
      const petsToArchive = pets.filter(pet => !selectedPets.includes(pet.id));
      
      for (const pet of petsToArchive) {
        const currentNotes = pet.notes || '';
        const archiveNote = `[ARCHIVIERT: ${new Date().toLocaleDateString()}] `;
        const updatedNotes = currentNotes.startsWith('[ARCHIVIERT:') 
          ? currentNotes 
          : archiveNote + currentNotes;

        const { error } = await supabase
          .from('pet_profiles')
          .update({ 
            notes: updatedNotes
          })
          .eq('id', pet.id);
        
        if (error) throw error;
      }

      toast({
        title: t('subscription.petSelection.toasts.selectionSaved.title'),
        description: t('subscription.petSelection.toasts.selectionSaved.description', { selectedCount: selectedPets.length })
      });
      
      onSelectionComplete();
      onClose();
    } catch (error) {
      console.error('Error updating pet profiles:', error);
      toast({
        title: t('subscription.petSelection.error.title'),
        description: t('subscription.petSelection.error.description'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            {t('subscription.petSelection.title')}
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600 mt-2">
            {t('subscription.petSelection.description', { maxAllowed })}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-4 w-4 text-blue-600" />
              <h3 className="font-semibold text-blue-900">{t('subscription.petSelection.noWorries')}</h3>
            </div>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>{t('subscription.petSelection.assurances.profilesSaved')}</li>
              <li>{t('subscription.petSelection.assurances.archivedOnly')}</li>
              <li>{t('subscription.petSelection.assurances.reactivateUpgrade')}</li>
              <li>{t('subscription.petSelection.assurances.trainingDataPreserved')}</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">
              {t('subscription.petSelection.selectActive', { maxAllowed })}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pets.map((pet) => (
                <Card 
                  key={pet.id} 
                  className={`cursor-pointer transition-all ${
                    selectedPets.includes(pet.id) 
                      ? 'border-2 border-primary bg-primary/5' 
                      : 'border hover:border-gray-300'
                  }`}
                  onClick={() => handlePetToggle(pet.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {getPetIcon(pet.species)}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium">{pet.name}</h5>
                        <p className="text-sm text-gray-600">
                          {pet.species} {pet.breed && `• ${pet.breed}`} {pet.age && `• ${pet.age} Jahre`}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <input
                          type={maxAllowed === 1 ? "radio" : "checkbox"}
                          checked={selectedPets.includes(pet.id)}
                          onChange={() => handlePetToggle(pet.id)}
                          className="w-4 h-4"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-sm text-gray-600 text-center">
              {t('subscription.petSelection.selectedCount', { selected: selectedPets.length, maxAllowed })}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              {t('subscription.petSelection.cancel')}
            </Button>
            <Button 
              onClick={handleConfirmSelection} 
              disabled={loading || selectedPets.length === 0}
            >
              {loading ? t('subscription.petSelection.saving') : t('subscription.petSelection.confirmSelection')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
