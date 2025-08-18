
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, ChevronDown } from 'lucide-react';
import PetProfileManager from '@/components/PetProfileManager';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useTranslations } from '@/hooks/useTranslations';

interface Pet {
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

interface PetProfilesSectionProps {
  shouldOpenPetModal?: boolean;
}

const PetProfilesSection = ({ shouldOpenPetModal = false }: PetProfilesSectionProps) => {
  const [isExpanded, setIsExpanded] = useLocalStorage('pet-profiles-expanded', true);
  const { t } = useTranslations();

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <Card className="card-enhanced shadow-lg border-border/50 bg-gradient-to-br from-white via-green-50/30 to-blue-50/30 dark:from-gray-900 dark:via-green-900/20 dark:to-blue-900/20 overflow-hidden">
        <CollapsibleTrigger asChild>
          <CardHeader className={`header-enhanced bg-gradient-to-r from-green-100/80 dark:from-green-900/40 via-blue-100/80 dark:via-blue-900/40 to-green-100/80 dark:to-green-900/40 rounded-t-lg ${isExpanded ? null : 'rounded-b-lg'} cursor-pointer transition-all duration-300 ease-out group px-6 py-5`}>
            <CardTitle className="text-xl font-semibold flex items-center gap-3 justify-between text-green-900 dark:text-green-100">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-blue-500 shadow-lg">
                  <User className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold">{t('training.petProfilesSection.title')}</span>
              </div>
              <ChevronDown 
                className={`h-5 w-5 text-green-600 dark:text-green-300 transition-all duration-300 ease-out group-hover:scale-110 ${
                  isExpanded ? 'rotate-180' : ''
                }`} 
              />
            </CardTitle>
            <CardDescription className="text-green-700 dark:text-green-300 text-base mt-2 font-medium">
              {t('training.petProfilesSection.description')}
            </CardDescription>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden">
          <CardContent className="p-8 bg-gradient-to-br from-white/50 to-green-50/30 dark:from-gray-900/50 dark:to-green-900/10">
            <div className="animate-fade-in-up">
              <PetProfileManager shouldOpenPetModal={shouldOpenPetModal} />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default PetProfilesSection;
