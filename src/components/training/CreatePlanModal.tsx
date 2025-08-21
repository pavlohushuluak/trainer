
import { useState } from "react";
import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";

interface Pet {
  id: string;
  name: string;
  species: string;
}

interface CreatePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanCreated: () => void;
  pets: Pet[];
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

export const CreatePlanModal = ({ isOpen, onClose, onPlanCreated, pets }: CreatePlanModalProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    petId: pets.length > 0 ? pets[0].id : "none", // Default to first pet if available
    status: "planned"
  });

  // Update pet selection when pets change
  React.useEffect(() => {
    if (pets.length > 0 && formData.petId === "none") {
      setFormData(prev => ({ ...prev, petId: pets[0].id }));
    } else if (pets.length === 0 && formData.petId !== "none") {
      setFormData(prev => ({ ...prev, petId: "none" }));
    } else if (formData.petId !== "none" && !pets.find(p => p.id === formData.petId)) {
      // Selected pet no longer exists
      setFormData(prev => ({ ...prev, petId: pets.length > 0 ? pets[0].id : "none" }));
    }
  }, [pets, formData.petId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('training_plans')
        .insert({
          title: formData.title,
          description: formData.description,
          pet_id: formData.petId === 'none' ? null : formData.petId,
          status: formData.status,
          user_id: user.id,
          is_ai_generated: false // Explicitly mark as manual plan
        });

      if (error) throw error;

      toast({
        title: t('training.createPlanModal.toast.success.title'),
        description: t('training.createPlanModal.toast.success.description'),
      });

      onPlanCreated();
      onClose();
      setFormData({
        title: "",
        description: "",
        petId: pets.length > 0 ? pets[0].id : "none", // Reset to first pet if available
        status: "planned"
      });
    } catch (error) {
      console.error('Error creating plan:', error);
      toast({
        title: t('training.createPlanModal.toast.error.title'),
        description: t('training.createPlanModal.toast.error.description'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {t('training.createPlanModal.title')}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t('training.createPlanModal.planName')} *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder={t('training.createPlanModal.planNamePlaceholder')}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('training.createPlanModal.description')}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder={t('training.createPlanModal.descriptionPlaceholder')}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pet">{t('training.createPlanModal.selectPet')}</Label>
            <Select 
              value={formData.petId} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, petId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('training.createPlanModal.selectPet')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  {t('training.createPlanModal.generalPlan')}
                </SelectItem>
                {pets.map(pet => (
                  <SelectItem key={pet.id} value={pet.id}>
                    {getPetIcon(pet.species)} {pet.name} ({pet.species})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">{t('training.createPlanModal.status.label')}</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">{t('training.createPlanModal.status.planned')}</SelectItem>
                <SelectItem value="in_progress">{t('training.createPlanModal.status.inProgress')}</SelectItem>
                <SelectItem value="completed">{t('training.createPlanModal.status.completed')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('training.createPlanModal.cancel')}
            </Button>
            <Button type="submit" disabled={loading || !formData.title}>
              {loading ? t('training.createPlanModal.creating') : t('training.createPlanModal.createPlan')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
