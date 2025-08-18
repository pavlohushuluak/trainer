
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
        <Card className="card-enhanced shadow-lg border-border/50 bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 overflow-hidden">
          <CollapsibleTrigger asChild>
            <CardHeader className={`header-enhanced bg-gradient-to-r from-purple-100/80 dark:from-purple-900/40 via-pink-100/80 dark:via-pink-900/40 to-purple-100/80 dark:to-purple-900/40 rounded-t-lg ${isExpanded ? null : 'rounded-b-lg'} cursor-pointer transition-all duration-300 ease-out group px-6 py-5`}>
              <CardTitle className="text-xl font-semibold flex items-center gap-3 justify-between text-purple-900 dark:text-purple-100">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                    <Crown className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-bold">{t('training.trainingPlans.title')}</span>
                </div>
                <ChevronDown 
                  className={`h-5 w-5 text-purple-600 dark:text-purple-300 transition-all duration-300 ease-out group-hover:scale-110 ${
                    isExpanded ? 'rotate-180' : ''
                  }`} 
                />
              </CardTitle>
              <CardDescription className="text-purple-700 dark:text-purple-300 text-base mt-2 font-medium">
                {t('training.trainingPlans.description')}
              </CardDescription>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden">
            <CardContent className="p-8 bg-gradient-to-br from-white/50 to-purple-50/30 dark:from-gray-900/50 dark:to-purple-900/10">
              <div className="animate-fade-in-up">
                <PlansSection pets={pets} />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
};
