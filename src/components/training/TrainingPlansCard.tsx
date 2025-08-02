
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, ChevronDown } from 'lucide-react';
import { SubscriptionGuard } from '@/components/auth/SubscriptionGuard';
import { PlansSection } from './PlansSection';
import { Pet } from './types';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useTranslations } from '@/hooks/useTranslations';

interface TrainingPlansCardProps {
  pets?: Pet[];
}

export const TrainingPlansCard = ({ pets = [] }: TrainingPlansCardProps) => {
  const [isExpanded, setIsExpanded] = useLocalStorage('training-plans-expanded', true);
  const { t } = useTranslations();

  return (
    <div className="mt-8">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <Card className="shadow-sm border-border">
          <CollapsibleTrigger asChild>
            <CardHeader className={`bg-gradient-to-r from-purple-50 dark:from-purple-900/20 to-pink-50 dark:to-pink-900/20 rounded-t-lg ${isExpanded? null : 'rounded-b-lg'} cursor-pointer hover:from-purple-100 dark:hover:from-purple-900/30 hover:to-pink-100 dark:hover:to-pink-900/30 transition-colors`}>
              <CardTitle className="text-lg flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  {t('training.trainingPlans.title')}
                  <Crown className="h-4 w-4 text-yellow-500" />
                </div>
                <ChevronDown 
                  className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                    isExpanded ? 'rotate-180' : ''
                  }`} 
                />
              </CardTitle>
              <CardDescription>
                {t('training.trainingPlans.description')}
              </CardDescription>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <CardContent className="p-6">
              <PlansSection pets={pets} />
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
};
