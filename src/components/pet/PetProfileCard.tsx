
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit, Trash2 } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

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

interface PetProfileCardProps {
  pet: PetProfile;
  onEdit: (pet: PetProfile) => void;
  onDelete: (petId: string, petName: string) => void;
}

const PetProfileCard = ({ pet, onEdit, onDelete }: PetProfileCardProps) => {
  const { t } = useTranslations();
  
  const formatBirthDate = (birthDate?: string | null) => {
    if (!birthDate) return null;
    
    try {
      const date = new Date(birthDate);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('🗓️ Invalid birth date:', birthDate);
        return null; // Return null instead of error text
      }
      
      return date.toLocaleDateString('de-DE', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      console.error('🗓️ Error formatting birth date:', error);
      return null; // Return null instead of error text
    }
  };

  const handleConfirmedDelete = () => {
    onDelete(pet.id, pet.name);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>🐾 {pet.name}</span>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(pet)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('pets.delete.title')}</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2">
                    <p
                      dangerouslySetInnerHTML={{
                        __html: t('pets.delete.confirmationStrong', { name: pet.name })
                      }}
                    />
                    <div className="bg-destructive/10 p-3 rounded-md border border-destructive/20">
                      <p className="text-sm font-medium text-destructive">
                        {t('pets.delete.irreversible')}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t('pets.delete.dataLoss')}
                      </p>
                    </div>
                    <p 
                      className="text-sm"
                      dangerouslySetInnerHTML={{
                        __html: t('pets.delete.confirmName', { name: pet.name })
                      }}
                    />
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleConfirmedDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {t('pets.delete.permanently')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardTitle>
        <CardDescription>
          {pet.species} {pet.breed && `• ${pet.breed}`} {pet.age && `• ${pet.age} ${t('common.years')}`}
          {pet.birth_date && (
            <div className="mt-1">
              {formatBirthDate(pet.birth_date) ? 
                `${t('pets.birthday')}: ${formatBirthDate(pet.birth_date)}` : 
                ''
              }
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pet.behavior_focus && (
          <p className="text-sm mb-2">
            <strong>{t('pets.focus')}:</strong> {pet.behavior_focus}
          </p>
        )}
        {pet.notes && (
          <p className="text-sm text-muted-foreground">
            📝 {pet.notes.length > 100 ? `${pet.notes.substring(0, 100)}...` : pet.notes}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default PetProfileCard;
