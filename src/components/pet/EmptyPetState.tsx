
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const EmptyPetState = () => {
  const { t } = useTranslation();
  
  const handleScrollToPetSection = () => {
    const petSection = document.getElementById('pet-section');
    if (petSection) {
      petSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <Card className="border-2 border-dashed border-blue-200 bg-blue-50">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Heart className="h-12 w-12 text-blue-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2 text-blue-800">{t('pets.empty.title')}</h3>
        <p className="text-blue-700 text-center mb-4 max-w-md">
          {t('pets.empty.description')}
        </p>
        <Button 
          onClick={handleScrollToPetSection}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('pets.empty.createFirst')}
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmptyPetState;
