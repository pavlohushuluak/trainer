
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Calendar, Heart, FileText, Loader2 } from "lucide-react";
import { SubscriptionRequiredWarning } from "../subscription/SubscriptionRequiredWarning";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
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
  updated_at: string;
  user_id: string;
}

interface PetProfileContentProps {
  pets: PetProfile[];
  onEdit: (pet: PetProfile) => void;
  onDelete: (petId: string, petName: string) => void;
  isPending?: (petId: string) => boolean;
}

export const PetProfileContent = ({ 
  pets, 
  onEdit, 
  onDelete, 
  isPending = () => false 
}: PetProfileContentProps) => {
  const { t } = useTranslation();
  const { hasActiveSubscription, subscriptionTierName } = useSubscriptionStatus();
  // Check if user has a valid plan (plan1-plan5)
  const hasValidPlan = hasActiveSubscription && subscriptionTierName && 
    ['1 Tier', '2 Tiere', '3-4 Tiere', '5-8 Tiere', 'Unbegrenzt'].includes(subscriptionTierName);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  if (pets.length === 0) {
    // Free users can create their first pet profile, so show the empty state
    return (
      <Card>
        <CardContent className="py-6 sm:py-8 lg:py-10 text-center px-3 sm:px-4 lg:px-6">
          <div className="text-muted-foreground">
            <Heart className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 mx-auto mb-3 sm:mb-4 text-muted-foreground/50" />
            <p className="text-base sm:text-lg font-medium mb-1.5 sm:mb-2">{t('pets.noPets')}</p>
            <p className="text-xs sm:text-sm">{t('pets.addFirstPet')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
      {pets.map((pet) => {
        const petIsPending = isPending(pet.id);
        
        return (
          <Card key={pet.id} className={`transition-all duration-200 ${petIsPending ? 'opacity-50 pointer-events-none' : 'hover:shadow-md hover:border-primary/30'}`}>
            <CardHeader className="pb-2 sm:pb-3 px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-5">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base sm:text-lg flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                  {petIsPending && <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin flex-shrink-0" />}
                  <span className="truncate">{pet.name}</span>
                </CardTitle>
                <div className="flex gap-0.5 sm:gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(pet)}
                    disabled={petIsPending}
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 touch-manipulation"
                    aria-label={t('pets.editPet')}
                  >
                    <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(pet.id, pet.name)}
                    disabled={petIsPending}
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/20 touch-manipulation"
                    aria-label={t('common.delete')}
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>
              <Badge variant="secondary" className="w-fit text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1">
                {pet.species} {pet.breed && `(${pet.breed})`}
              </Badge>
            </CardHeader>

            <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4 lg:px-6 lg:pb-6 space-y-2 sm:space-y-3">
              {/* Age Information */}
              {(pet.age || pet.birth_date) && (
                <div className="flex items-start gap-1.5 sm:gap-2 text-[10px] sm:text-xs lg:text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    {pet.birth_date 
                      ? `${calculateAge(pet.birth_date)} ${t('common.years')} ${t('common.old')} (${t('common.born')} ${formatDate(pet.birth_date)})`
                      : `${pet.age} ${t('common.years')} ${t('common.old')}`
                    }
                  </span>
                </div>
              )}

              {/* Behavior Focus */}
              {pet.behavior_focus && (
                <div className="space-y-1 sm:space-y-1.5">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-foreground">
                    <Heart className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span>{t('pets.behaviorFocus')}</span>
                  </div>
                  <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950/30 p-2 sm:p-2.5 rounded leading-relaxed">
                    {pet.behavior_focus}
                  </p>
                </div>
              )}

              {/* Notes */}
              {pet.notes && (
                <div className="space-y-1 sm:space-y-1.5">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-foreground">
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span>{t('pets.notes')}</span>
                  </div>
                  <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground bg-muted p-2 sm:p-2.5 rounded leading-relaxed">
                    {pet.notes}
                  </p>
                </div>
              )}

              <div className="pt-1.5 sm:pt-2 border-t border-border text-[10px] sm:text-xs text-muted-foreground">
                {t('common.created')}: {formatDate(pet.created_at)}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
