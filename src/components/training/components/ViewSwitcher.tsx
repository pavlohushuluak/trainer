import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/hooks/useTranslations";

export type ViewMode = 'list' | 'grid';

interface ViewSwitcherProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export const ViewSwitcher = ({ view, onViewChange }: ViewSwitcherProps) => {
  const { t } = useTranslations();
  
  return (
    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
      <Button
        variant={view === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('list')}
        className="px-3 sm:px-4 py-2 h-10 sm:h-8 min-w-[44px] sm:min-w-0"
      >
        <List className="h-4 w-4" />
        <span className="ml-1 text-xs font-medium">{t('training.viewSwitcher.list')}</span>
      </Button>
      <Button
        variant={view === 'grid' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('grid')}
        className="px-3 sm:px-4 py-2 h-10 sm:h-8 min-w-[44px] sm:min-w-0"
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="ml-1 text-xs font-medium">{t('training.viewSwitcher.grid')}</span>
      </Button>
    </div>
  );
};