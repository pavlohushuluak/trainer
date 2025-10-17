
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PlansHeaderProps {
  onCreateClick: () => void;
  onTemplateClick: () => void;
}

export const PlansHeader = ({ onCreateClick, onTemplateClick }: PlansHeaderProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
      <div className="flex gap-2 sm:gap-3 flex-shrink-0">
        <Button 
          onClick={onTemplateClick} 
          variant="outline"
          className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 min-h-[44px] sm:min-h-[40px] text-xs sm:text-sm touch-manipulation"
        >
          <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
          <span className="truncate">{t('training.plansHeader.fromTemplate')}</span>
        </Button>
        <Button 
          onClick={onCreateClick} 
          className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 min-h-[44px] sm:min-h-[40px] text-xs sm:text-sm touch-manipulation"
        >
          <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
          <span className="truncate">{t('training.plansHeader.newPlan')}</span>
        </Button>
      </div>
    </div>
  );
};
