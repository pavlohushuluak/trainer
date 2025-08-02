
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslations } from '@/hooks/useTranslations';

export const PetProfileRequiredCard = () => {
  const navigate = useNavigate();
  const { t } = useTranslations();

  const handleCreatePetProfile = () => {
    // Navigate to the pet training page where users can create pet profiles
    navigate('/mein-tiertraining');
  };

  return (
    <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20 mb-4">
      <CardContent className="p-4 text-center">
        <AlertCircle className="h-8 w-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
        <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">
          {t('chat.petProfileRequired.title')}
        </h3>
        <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
          {t('chat.petProfileRequired.description')}
        </p>
        <Button 
          className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white"
          onClick={handleCreatePetProfile}
        >
          {t('chat.petProfileRequired.button')}
        </Button>
      </CardContent>
    </Card>
  );
};
