
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Camera, ChevronDown } from 'lucide-react';
import { ImageAnalysisSection } from './image-analysis/ImageAnalysisSection';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useTranslations } from '@/hooks/useTranslations';
import { useQueryClient } from '@tanstack/react-query';

interface Pet {
  id: string;
  name: string;
  species: string;
}

interface ImageAnalysisCardProps {
  primaryPet?: Pet;
}

export const ImageAnalysisCard = ({ primaryPet }: ImageAnalysisCardProps) => {
  const { subscriptionMode } = useSubscriptionStatus();
  const [isExpanded, setIsExpanded] = useLocalStorage('image-analysis-expanded', true);
  const { t } = useTranslations();
  const queryClient = useQueryClient();

  return (
    <div className="mb-8">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <Card className="card-enhanced shadow-lg border-border/50 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 overflow-hidden">
          <CollapsibleTrigger asChild>
            <CardHeader className={`header-enhanced bg-gradient-to-r from-blue-100/80 dark:from-blue-900/40 via-indigo-100/80 dark:via-indigo-900/40 to-blue-100/80 dark:to-blue-900/40 rounded-t-lg ${isExpanded ? null : 'rounded-b-lg'} cursor-pointer transition-all duration-300 ease-out group px-6 py-5`}>
              <CardTitle className="text-xl font-semibold flex items-center gap-3 justify-between text-blue-900 dark:text-blue-100">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-bold">{t('training.imageAnalysis.title')}</span>
                </div>
                <ChevronDown 
                  className={`h-5 w-5 text-blue-600 dark:text-blue-300 transition-all duration-300 ease-out group-hover:scale-110 ${
                    isExpanded ? 'rotate-180' : ''
                  }`} 
                />
              </CardTitle>
              <div className="text-blue-700 dark:text-blue-300 text-base mt-2 font-medium">
                <p>{t('training.imageAnalysis.description')}</p>
                {subscriptionMode === 'free' && (
                  <p className="mt-2">
                    <span className="font-bold text-green-600 dark:text-green-400">{t('training.imageAnalysis.freeForAll')}</span> {t('training.imageAnalysis.freeDescription')}
                  </p>
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent className="animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden">
            <CardContent className="p-8 bg-gradient-to-br from-white/50 to-blue-50/30 dark:from-gray-900/50 dark:to-blue-900/10">
              <div className="animate-fade-in-up">
                <ImageAnalysisSection 
                  selectedPet={primaryPet} 
                  onPlanCreated={() => {
                    // Invalidate training plans query to refresh the list
                    queryClient.invalidateQueries({ queryKey: ['training-plans-with-steps'] });
                  }}
                />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
};
