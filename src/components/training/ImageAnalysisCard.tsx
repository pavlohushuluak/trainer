
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
    <div className="mb-4 sm:mb-6 lg:mb-8">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <Card className="card-enhanced shadow-lg border-border/50 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 overflow-hidden">
          <CollapsibleTrigger asChild>
            <CardHeader className={`header-enhanced bg-gradient-to-r from-blue-100/80 dark:from-blue-900/40 via-indigo-100/80 dark:via-indigo-900/40 to-blue-100/80 dark:to-blue-900/40 rounded-t-lg ${isExpanded ? null : 'rounded-b-lg'} cursor-pointer transition-all duration-300 ease-out group px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-5 touch-manipulation`}>
              <CardTitle className="text-base sm:text-lg lg:text-xl font-semibold flex items-center gap-2 sm:gap-3 justify-between text-blue-900 dark:text-blue-100">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg flex-shrink-0">
                    <Camera className="h-4 w-4 sm:h-4.5 sm:w-4.5 lg:h-5 lg:w-5 text-white" />
                  </div>
                  <span className="font-bold truncate">{t('training.imageAnalysis.title')}</span>
                </div>
                <ChevronDown 
                  className={`h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-300 transition-all duration-300 ease-out group-hover:scale-110 flex-shrink-0 ${
                    isExpanded ? 'rotate-180' : ''
                  }`} 
                />
              </CardTitle>
              <div className="text-blue-700 dark:text-blue-300 text-xs sm:text-sm lg:text-base mt-1.5 sm:mt-2 font-medium">
                <p className="leading-relaxed">{t('training.imageAnalysis.description')}</p>
                {subscriptionMode === 'free' && (
                  <p className="mt-1.5 sm:mt-2 leading-relaxed">
                    <span className="font-bold text-green-600 dark:text-green-400">{t('training.imageAnalysis.freeForAll')}</span> {t('training.imageAnalysis.freeDescription')}
                  </p>
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent className="animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden">
            <CardContent className="p-3 sm:p-4 lg:p-6 xl:p-8 bg-gradient-to-br from-white/50 to-blue-50/30 dark:from-gray-900/50 dark:to-blue-900/10">
              <div className="animate-fade-in-up">
                <ImageAnalysisSection 
                  selectedPet={primaryPet} 
                  subscriptionMode={subscriptionMode}
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
