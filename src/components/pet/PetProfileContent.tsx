
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
        <CardContent className="py-8 text-center">
          <div className="text-muted-foreground">
            <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg mb-2">{t('pets.noPets')}</p>
            <p className="text-sm">{t('pets.addFirstPet')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {pets.map((pet) => {
        const petIsPending = isPending(pet.id);
        
        return (
          <Card key={pet.id} className={`transition-all duration-200 ${petIsPending ? 'opacity-50 pointer-events-none' : 'hover:shadow-md'}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  {petIsPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  {pet.name}
                </CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(pet)}
                    disabled={petIsPending}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(pet.id, pet.name)}
                    disabled={petIsPending}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Badge variant="secondary" className="w-fit">
                {pet.species} {pet.breed && `(${pet.breed})`}
              </Badge>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Age Information */}
              {(pet.age || pet.birth_date) && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {pet.birth_date 
                      ? `${calculateAge(pet.birth_date)} ${t('common.years')} ${t('common.old')} (${t('common.born')} ${formatDate(pet.birth_date)})`
                      : `${pet.age} ${t('common.years')} ${t('common.old')}`
                    }
                  </span>
                </div>
              )}

              {/* Behavior Focus */}
              {pet.behavior_focus && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Heart className="h-4 w-4" />
                    {t('pets.behaviorFocus')}
                  </div>
                  <p className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950/30 p-2 rounded">
                    {pet.behavior_focus}
                  </p>
                </div>
              )}

              {/* Notes */}
              {pet.notes && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <FileText className="h-4 w-4" />
                    {t('pets.notes')}
                  </div>
                  <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                    {pet.notes}
                  </p>
                </div>
              )}

              <div className="pt-2 border-t border-border text-xs text-muted-foreground">
                {t('common.created')}: {formatDate(pet.created_at)}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
