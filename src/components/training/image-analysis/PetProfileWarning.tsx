
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
    <Card className="border-orange-200/50 bg-orange-50/50 dark:border-orange-300/30 dark:bg-orange-950/20">
      <CardContent className="p-3 sm:p-4 text-center">
        <Plus className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
        <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-2 text-sm sm:text-base">{t('training.petProfileWarning.title')}</h3>
        <p className="text-xs sm:text-sm text-orange-700 dark:text-orange-300 mb-3">
          {t('training.petProfileWarning.description')}
        </p>
        <Button 
          className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white text-sm sm:text-base w-full sm:w-auto"
          onClick={handleScrollToPetSection}
        >
          {t('training.petProfileWarning.button')}
        </Button>
      </CardContent>
    </Card>
  );
};
