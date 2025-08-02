
import { Button } from "@/components/ui/button";
import { Plus, BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PlansHeaderProps {
  onCreateClick: () => void;
  onTemplateClick: () => void;
}

export const PlansHeader = ({ onCreateClick, onTemplateClick }: PlansHeaderProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold">{t('training.plansHeader.title')}</h2>
      <div className="flex gap-2 sm:flex-row flex-col sm:items-center items-center">
        <Button 
          onClick={onTemplateClick} 
          variant="outline"
          className="flex items-center gap-2 sm:w-auto w-4/5 sm:mb-0 mb-2 text-xs sm:text-sm"
        >
          <BookOpen className="h-4 w-4 sm:block hidden" />
          {t('training.plansHeader.fromTemplate')}
        </Button>
        <Button onClick={onCreateClick} className="flex items-center gap-2 sm:w-auto w-4/5 text-xs sm:text-sm">
          <Plus className="h-4 w-4 sm:block hidden" />
          {t('training.plansHeader.newPlan')}
        </Button>
      </div>
    </div>
  );
};
