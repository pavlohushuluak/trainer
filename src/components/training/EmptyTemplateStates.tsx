
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface EmptyTemplateStatesProps {
  hasNoPets: boolean;
  userSpecies: string[];
  onClose: () => void;
}

export const EmptyTemplateStates = ({ hasNoPets, userSpecies, onClose }: EmptyTemplateStatesProps) => {
  const { t } = useTranslation();
  
  if (hasNoPets) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">
          {t('training.emptyTemplateStates.noPets')}
        </p>
        <Button onClick={onClose}>
          {t('training.emptyTemplateStates.understood')}
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      <p className="text-muted-foreground mb-2">
        {t('training.emptyTemplateStates.noTemplates', { species: userSpecies.join(', ') })}
      </p>
      <p className="text-sm text-muted-foreground mb-4">
        {t('training.emptyTemplateStates.canCreateIndividual')}
      </p>
      <Button onClick={onClose}>
        {t('training.emptyTemplateStates.understood')}
      </Button>
    </div>
  );
};
