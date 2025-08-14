import { useState } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { useTranslation } from 'react-i18next';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Camera, 
  User, 
  PawPrint,
  Check,
  X
} from 'lucide-react';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  age?: number;
}

interface PetSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPetSelected: (pet: Pet) => void;
  pets: Pet[];
  imagePreview?: string;
}

export const PetSelectionModal = ({ 
  isOpen, 
  onClose, 
  onPetSelected, 
  pets,
  imagePreview 
}: PetSelectionModalProps) => {
  const { t } = useTranslations();
  const { i18n } = useTranslation();
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);

  const handlePetSelect = (pet: Pet) => {
    setSelectedPet(pet);
  };

  const handleConfirm = () => {
    if (selectedPet) {
      onPetSelected(selectedPet);
      setSelectedPet(null);
      onClose(); // Close the modal immediately
    }
  };

  const handleCancel = () => {
    setSelectedPet(null);
    onClose();
  };

  const getSpeciesIcon = (species: string) => {
    const speciesLower = species.toLowerCase();
    if (speciesLower.includes('hund') || speciesLower.includes('dog')) return '🐕';
    if (speciesLower.includes('katze') || speciesLower.includes('cat')) return '🐱';
    if (speciesLower.includes('vogel') || speciesLower.includes('bird')) return '🐦';
    if (speciesLower.includes('hamster') || speciesLower.includes('hamster')) return '🐹';
    if (speciesLower.includes('kaninchen') || speciesLower.includes('rabbit')) return '🐰';
    if (speciesLower.includes('fisch') || speciesLower.includes('fish')) return '🐠';
    return '🐾';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            {t('imageAnalysis.petSelection.title')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-6">
              {/* Image Preview */}
              {imagePreview && (
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <img 
                        src={imagePreview} 
                        alt={t('imageAnalysis.petSelection.imagePreview')}
                        className="max-w-full max-h-48 mx-auto rounded-lg shadow-md"
                      />
                      <p className="text-sm text-muted-foreground mt-2">
                        {t('imageAnalysis.petSelection.selectPetForImage')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Pet Selection */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  {t('imageAnalysis.petSelection.choosePet')}
                </h3>
                
                {pets.length === 0 ? (
                  <Card className="border-dashed border-2 border-muted-foreground/20">
                    <CardContent className="p-6 text-center">
                      <PawPrint className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-muted-foreground mb-2">
                        {t('imageAnalysis.petSelection.noPets.title')}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {t('imageAnalysis.petSelection.noPets.description')}
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={handleCancel}
                        className="w-full sm:w-auto"
                      >
                        {t('imageAnalysis.petSelection.createPetProfile')}
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-3 px-2">
                    {pets.map((pet) => (
                      <Card 
                        key={pet.id}
                        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                          selectedPet?.id === pet.id 
                            ? 'ring-2 ring-primary bg-primary/5' 
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => handlePetSelect(pet)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">
                                {getSpeciesIcon(pet.species)}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-foreground">
                                  {pet.name}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="secondary" className="text-xs">
                                    {pet.species}
                                  </Badge>
                                  {pet.breed && (
                                    <Badge variant="outline" className="text-xs">
                                      {pet.breed}
                                    </Badge>
                                  )}
                                  {pet.age && (
                                    <Badge variant="outline" className="text-xs">
                                      {pet.age} {t('imageAnalysis.petSelection.years')}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            {selectedPet?.id === pet.id && (
                              <Check className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleCancel}>
            <X className="h-4 w-4 mr-2" />
            {t('imageAnalysis.petSelection.cancel')}
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!selectedPet}
            className="min-w-[100px]"
          >
            <Camera className="h-4 w-4 mr-2" />
            {t('imageAnalysis.petSelection.analyze')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 