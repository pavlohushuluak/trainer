
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, AlertCircle } from "lucide-react";
import { format, differenceInYears } from "date-fns";
import { de, enUS } from "date-fns/locale";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usePetProfiles } from "@/hooks/usePetProfiles";
import { useTranslations } from "@/hooks/useTranslations";
import CalendarModal from "./CalendarModal";

interface PetProfile {
  id: string;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  birth_date?: string;
  behavior_focus?: string;
  notes?: string;
  created_at: string;
}

interface PetProfileFormProps {
  editingPet: PetProfile | null;
  onPetSaved: () => void;
  onClose: () => void;
}

const PetProfileForm = ({ editingPet, onPetSaved, onClose }: PetProfileFormProps) => {
  const { t, currentLanguage } = useTranslations();
  const { user } = useAuth();
  const { toast } = useToast();
  const { createPet, updatePet } = usePetProfiles();
  
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    age: '',
    birth_date: undefined as Date | undefined,
    behavior_focus: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

  // Function to calculate age from birth date
  const calculateAge = (birthDate: Date) => {
    return differenceInYears(new Date(), birthDate);
  };

  useEffect(() => {
    
    if (editingPet) {
      const birthDate = editingPet.birth_date ? new Date(editingPet.birth_date) : undefined;
      setFormData({
        name: editingPet.name || '',
        species: editingPet.species || '',
        breed: editingPet.breed || '',
        age: editingPet.age?.toString() || '',
        birth_date: birthDate,
        behavior_focus: editingPet.behavior_focus || '',
        notes: editingPet.notes || ''
      });
    } else {
      setFormData({
        name: '',
        species: '',
        breed: '',
        age: '',
        birth_date: undefined,
        behavior_focus: '',
        notes: ''
      });
    }
    setError(null);
  }, [editingPet]);

  const handleBirthDateChange = (date: Date | undefined) => {
    setFormData(prev => {
      const newAge = date ? calculateAge(date).toString() : '';
      return {
        ...prev,
        birth_date: date,
        age: newAge
      };
    });
  };


  // Lightweight validation - nur die wichtigsten Felder
  const validateForm = () => {
    if (!formData.name.trim()) {
      setError(t('pets.form.errors.nameRequired'));
      return false;
    }
    if (!formData.species.trim()) {
      setError(t('pets.form.errors.speciesRequired'));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError(t('pets.form.errors.mustBeLoggedIn'));
      return;
    }

    if (!validateForm()) {
      return;
    }

    // Minimaler Loading-State nur für UI-Feedback
    setLoading(true);

    try {
      const petData = {
        user_id: user.id,
        name: formData.name.trim(),
        species: formData.species.trim(),
        breed: formData.breed?.trim() || undefined,
        age: formData.age ? parseInt(formData.age) : undefined,
        birth_date: formData.birth_date ? formData.birth_date.toISOString().split('T')[0] : undefined,
        behavior_focus: formData.behavior_focus?.trim() || undefined,
        notes: formData.notes?.trim() || undefined
      };

      if (editingPet) {
        await updatePet(editingPet.id, petData);
      } else {
        await createPet(petData);
      }

      // Show success toast
      toast({
        title: editingPet ? t('pets.toast.updated.title') : t('pets.toast.created.title'),
        description: editingPet 
          ? t('pets.toast.updated.description', { name: petData.name })
          : t('pets.toast.created.description', { name: petData.name }),
      });
      
      // Close dialog and show success
      onPetSaved();
      
    } catch (error: any) {
      setError(t('pets.form.errors.unexpected'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {editingPet ? t('pets.form.editTitle') : t('pets.form.createTitle')}
        </DialogTitle>
      </DialogHeader>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">{t('pets.form.name')} *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder={t('pets.form.namePlaceholder')}
            required
            disabled={loading}
          />
        </div>

        <div>
          <Label htmlFor="species">{t('pets.form.species')} *</Label>
          <Input
            id="species"
            value={formData.species}
            onChange={(e) => setFormData(prev => ({ ...prev, species: e.target.value }))}
            placeholder={t('pets.form.speciesPlaceholder')}
            required
            disabled={loading}
          />
        </div>

        <div>
          <Label htmlFor="breed">{t('pets.form.breed')}</Label>
          <Input
            id="breed"
            value={formData.breed}
            onChange={(e) => setFormData(prev => ({ ...prev, breed: e.target.value }))}
            placeholder={t('pets.form.breedPlaceholder')}
            disabled={loading}
          />
        </div>

        <div>
          <Label>{t('pets.form.birthDate')}</Label>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start text-left font-normal hover:bg-accent/50 transition-all duration-200 group"
            disabled={loading}
            onClick={() => setIsCalendarModalOpen(true)}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            {formData.birth_date ? (
              <span className="text-foreground font-medium">
                {format(formData.birth_date, "PPP", { locale: currentLanguage === 'en' ? enUS : de })}
              </span>
            ) : (
              <span className="text-muted-foreground">{t('pets.form.selectDate')}</span>
            )}
          </Button>
        </div>

        <div>
          <Label htmlFor="age">{t('pets.form.age')} ({t('common.years')})</Label>
          <Input
            id="age"
            type="number"
            value={formData.age}
            onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
            placeholder={t('pets.form.agePlaceholder')}
            min="0"
            disabled={!!formData.birth_date || loading}
          />
          {formData.birth_date && (
            <p className="text-sm text-muted-foreground mt-1">
              {t('pets.form.ageCalculated')}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="behavior_focus">{t('pets.form.behaviorFocus')}</Label>
          <Input
            id="behavior_focus"
            value={formData.behavior_focus}
            onChange={(e) => setFormData(prev => ({ ...prev, behavior_focus: e.target.value }))}
            placeholder={t('pets.form.behaviorFocusPlaceholder')}
            disabled={loading}
          />
        </div>

        <div>
          <Label htmlFor="notes">{t('pets.form.notes')}</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder={t('pets.form.notesPlaceholder')}
            rows={3}
            disabled={loading}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? t('pets.form.saving') : editingPet ? t('pets.form.update') : t('pets.form.create')}
          </Button>
        </div>
      </form>

      <CalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        selectedDate={formData.birth_date}
        onDateSelect={handleBirthDateChange}
        disabled={loading}
      />
    </DialogContent>
  );
};

export default PetProfileForm;
