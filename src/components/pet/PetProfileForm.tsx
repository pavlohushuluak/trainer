
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, AlertCircle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { format, differenceInYears, addYears, subYears, getYear } from "date-fns";
import { de, enUS } from "date-fns/locale";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usePetProfiles } from "@/hooks/usePetProfiles";
import { useTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

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
  const [currentDate, setCurrentDate] = useState(new Date());

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

  // Year selection functions
  const handleYearChange = (year: string) => {
    const newYear = parseInt(year);
    const newDate = new Date(currentDate);
    newDate.setFullYear(newYear);
    setCurrentDate(newDate);
  };

  const handlePreviousYear = () => {
    setCurrentDate(prev => subYears(prev, 1));
  };

  const handleNextYear = () => {
    setCurrentDate(prev => addYears(prev, 1));
  };

  const handlePreviousMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  // Generate year options (current year - 50 to current year + 5)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 56 }, (_, i) => currentYear - 50 + i);

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
                className="w-full justify-start text-left font-normal hover:bg-accent/50 transition-all duration-200 group"
                disabled={loading}
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
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-0 shadow-2xl" align="start">
              <div className="bg-gradient-to-br from-background via-background to-muted/20 rounded-lg border border-border/50 backdrop-blur-sm">
                {/* Enhanced Navigation Header */}
                <div className="p-3 border-b border-border/50 bg-gradient-to-r from-primary/5 to-secondary/5">
                  <div className="flex items-center justify-between mb-3">
                    {/* Year Navigation */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handlePreviousYear}
                        className="h-8 w-8 p-0 hover:bg-accent/50"
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </Button>
                      <Select value={getYear(currentDate).toString()} onValueChange={handleYearChange}>
                        <SelectTrigger className="w-20 h-8 text-sm font-medium">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {yearOptions.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleNextYear}
                        className="h-8 w-8 p-0 hover:bg-accent/50"
                      >
                        <ChevronsRight className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Month Navigation */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handlePreviousMonth}
                        className="h-8 w-8 p-0 hover:bg-accent/50"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-semibold text-foreground min-w-[80px] text-center">
                        {format(currentDate, "MMMM", { locale: currentLanguage === 'en' ? enUS : de })}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleNextMonth}
                        className="h-8 w-8 p-0 hover:bg-accent/50"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="p-1">
                  <Calendar
                    mode="single"
                    selected={formData.birth_date}
                    onSelect={handleBirthDateChange}
                    month={currentDate}
                    onMonthChange={setCurrentDate}
                    initialFocus
                    disabled={loading}
                    className="rounded-md"
                    classNames={{
                      months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                      month: "space-y-4",
                      caption: "hidden", // Hide default caption since we have custom navigation
                      nav: "space-x-1 flex items-center",
                      nav_button: cn(
                        buttonVariants({ variant: "outline" }),
                        "h-8 w-8 bg-background/80 hover:bg-accent/50 border-border/50 p-0 opacity-70 hover:opacity-100 transition-all duration-200"
                      ),
                      nav_button_previous: "absolute left-1",
                      nav_button_next: "absolute right-1",
                      table: "w-full border-collapse space-y-1",
                      head_row: "flex",
                      head_cell:
                        "text-muted-foreground rounded-md w-10 font-medium text-[0.8rem] uppercase tracking-wider",
                      row: "flex w-full mt-2",
                      cell: "h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                      day: cn(
                        buttonVariants({ variant: "ghost" }),
                        "h-10 w-10 p-0 font-normal aria-selected:opacity-100 hover:bg-accent/80 transition-all duration-200 rounded-md"
                      ),
                      day_range_end: "day-range-end",
                      day_selected:
                        "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground shadow-lg transform scale-105 transition-all duration-200",
                      day_today: "bg-accent/80 text-accent-foreground font-semibold ring-2 ring-primary/20",
                      day_outside:
                        "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                      day_disabled: "text-muted-foreground opacity-30 cursor-not-allowed",
                      day_range_middle:
                        "aria-selected:bg-accent aria-selected:text-accent-foreground",
                      day_hidden: "invisible",
                    }}
                    components={{
                      IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" {...props} />,
                      IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" {...props} />,
                    }}
                  />
                </div>
                {formData.birth_date && (
                  <div className="px-3 py-2 bg-gradient-to-r from-primary/10 to-secondary/10 border-t border-border/50 rounded-b-lg">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {t('pets.form.selectedDate')}:
                      </span>
                      <span className="font-medium text-foreground">
                        {format(formData.birth_date, "dd.MM.yyyy", { locale: currentLanguage === 'en' ? enUS : de })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
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
