
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
        <Card className="bg-gradient-to-r from-primary/5 via-secondary to-accent/5 border-primary/20">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-card/20 transition-colors">
              <CardTitle className="flex items-center justify-between text-xl text-foreground">
                <div className="flex items-center gap-2">
                  <Camera className="h-6 w-6" />
                  {t('training.imageAnalysis.title')}
                </div>
                <ChevronDown 
                  className={`h-5 w-5 transition-transform duration-200 ${
                    isExpanded ? 'rotate-180' : ''
                  }`} 
                />
              </CardTitle>
              <p className="text-muted-foreground text-left">
                {t('training.imageAnalysis.description')}
                {subscriptionMode === 'free' && (
                  <>
                    <br />
                    <span className="font-medium">{t('training.imageAnalysis.freeForAll')}</span> {t('training.imageAnalysis.freeDescription')}
                  </>
                )}
              </p>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <ImageAnalysisSection 
                selectedPet={primaryPet} 
                onPlanCreated={() => {
                  // Invalidate training plans query to refresh the list
                  queryClient.invalidateQueries({ queryKey: ['training-plans-with-steps'] });
                }}
              />
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
};
