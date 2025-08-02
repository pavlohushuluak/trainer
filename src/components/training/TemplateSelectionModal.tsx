
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { PlanTemplate } from './templateTypes';
import { TemplateDetailView } from './components/TemplateDetailView';
import { TemplateList } from './components/TemplateList';
import { planTemplates } from './PlanTemplates';

interface Pet {
  id: string;
  name: string;
  species: string;
}

interface PlanTemplateForCreation {
  title: string;
  description: string;
  exercises: Array<{
    title: string;
    description: string;
    points_reward?: number;
  }>;
}

interface TemplateSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  pets: Pet[];
  onSelectTemplate: (template: PlanTemplateForCreation, selectedPetId?: string) => void;
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
      return '🐱';
    case 'pferd':
    case 'horse':
      return '🐴';
    default: 
      return '🐾';
  }
};

export const TemplateSelectionModal = ({
  isOpen,
  onClose,
  pets,
  onSelectTemplate
}: TemplateSelectionModalProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<PlanTemplate | null>(null);
  const [selectedPetId, setSelectedPetId] = useState<string>(
    pets.length > 0 ? pets[0].id : "none"
  );

  // Get user species from pets
  const userSpecies = pets.map(pet => pet.species);

  // Filter templates based on user's pets
  const relevantTemplates = planTemplates.filter(template => 
    template.species.some(species => 
      userSpecies.includes(species) || 
      userSpecies.includes('Hund') && species === 'Dog' ||
      userSpecies.includes('Dog') && species === 'Hund'
    )
  );

  const templates = relevantTemplates.length > 0 ? relevantTemplates : planTemplates;

  const handleBack = () => {
    setSelectedTemplate(null);
  };

  const handleTemplateDetails = (template: PlanTemplate) => {
    setSelectedTemplate(template);
  };

  const handleUseTemplate = () => {
    if (selectedTemplate) {
      // Convert template to the format expected by usePlanActions
      const templateForCreation: PlanTemplateForCreation = {
        title: selectedTemplate.title,
        description: selectedTemplate.description,
        exercises: selectedTemplate.exercises.map(exercise => ({
          title: exercise.title,
          description: exercise.description,
          points_reward: 10 // Default points
        }))
      };

      onSelectTemplate(templateForCreation, selectedPetId);
      onClose();
      setSelectedTemplate(null);
    }
  };

  const handleSelectFromOverview = (template: PlanTemplate) => {
    // Convert template to the format expected by usePlanActions
    const templateForCreation: PlanTemplateForCreation = {
      title: template.title,
      description: template.description,
      exercises: template.exercises.map(exercise => ({
        title: exercise.title,
        description: exercise.description,
        points_reward: 10 // Default points
      }))
    };

    onSelectTemplate(templateForCreation, selectedPetId);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {selectedTemplate && (
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <DialogTitle>
              {selectedTemplate ? selectedTemplate.title : 'Trainingsvorlage wählen'}
            </DialogTitle>
          </div>
        </DialogHeader>

        {selectedTemplate ? (
          <div className="space-y-6">
            <TemplateDetailView template={selectedTemplate} />
            
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label>Für welches Tier soll der Plan erstellt werden?</Label>
                <Select value={selectedPetId} onValueChange={setSelectedPetId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tier auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      🌟 Allgemeiner Plan (ohne spezifisches Tier)
                    </SelectItem>
                    {pets.map(pet => (
                      <SelectItem key={pet.id} value={pet.id}>
                        {getPetIcon(pet.species)} {pet.name} ({pet.species})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleBack} variant="outline" className="flex-1">
                  Zurück zur Auswahl
                </Button>
                <Button onClick={handleUseTemplate} className="flex-1">
                  Diese Vorlage verwenden
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <TemplateList
            templates={templates}
            onSelectTemplate={handleSelectFromOverview}
            onViewDetails={handleTemplateDetails}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
