
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';

export const PetProfileWarning = () => {
  const { t } = useTranslations();

  const handleScrollToPetSection = () => {
    const petSection = document.getElementById('pet-section');
    if (petSection) {
      petSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardContent className="p-4 text-center">
        <Plus className="h-8 w-8 text-orange-600 mx-auto mb-2" />
        <h3 className="font-semibold text-orange-800 mb-2">{t('training.petProfileWarning.title')}</h3>
        <p className="text-sm text-orange-700 mb-3">
          {t('training.petProfileWarning.description')}
        </p>
        <Button 
          className="bg-orange-600 hover:bg-orange-700 text-white"
          onClick={handleScrollToPetSection}
        >
          {t('training.petProfileWarning.button')}
        </Button>
      </CardContent>
    </Card>
  );
};
