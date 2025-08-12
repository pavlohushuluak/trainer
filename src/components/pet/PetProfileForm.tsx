
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, AlertCircle } from "lucide-react";
import { format, differenceInYears } from "date-fns";
import { de } from "date-fns/locale";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usePetProfiles } from "@/hooks/usePetProfiles";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
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
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
                disabled={loading}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.birth_date ? (
                  format(formData.birth_date, "PPP", { locale: de })
                ) : (
                  <span>{t('pets.form.selectDate')}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.birth_date}
                onSelect={handleBirthDateChange}
                initialFocus
                disabled={loading}
              />
            </PopoverContent>
          </Popover>
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
    </DialogContent>
  );
};

export default PetProfileForm;
