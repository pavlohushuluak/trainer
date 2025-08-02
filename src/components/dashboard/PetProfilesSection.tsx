
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
  pets?: Pet[];
}

const PetProfilesSection = ({ pets = [] }: PetProfilesSectionProps) => {
  const [isExpanded, setIsExpanded] = useLocalStorage('pet-profiles-expanded', true);
  const { t } = useTranslations();

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <Card className="shadow-sm border-border">
        <CollapsibleTrigger asChild>
          <CardHeader className={`bg-gradient-to-r from-green-50 dark:from-green-900/20 to-blue-50 dark:to-blue-900/20 rounded-t-lg ${isExpanded? null : 'rounded-b-lg'} cursor-pointer hover:from-green-100 dark:hover:from-green-900/30 hover:to-blue-100 dark:hover:to-blue-900/30 transition-colors`}>
            <CardTitle className="flex items-center gap-2 text-lg justify-between">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-green-600 dark:text-green-400" />
                {t('training.petProfilesSection.title')}
              </div>
              <ChevronDown 
                className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                  isExpanded ? 'rotate-180' : ''
                }`} 
              />
            </CardTitle>
            <CardDescription>
              {t('training.petProfilesSection.description')}
            </CardDescription>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
          <CardContent className="p-6">
            <PetProfileManager pets={pets} />
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default PetProfilesSection;
