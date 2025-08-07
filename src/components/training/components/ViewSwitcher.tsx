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
        className="px-3 py-1.5 h-8"
      >
        <List className="h-4 w-4" />
        <span className="ml-1 text-xs">{t('training.viewSwitcher.list')}</span>
      </Button>
      <Button
        variant={view === 'grid' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('grid')}
        className="px-3 py-1.5 h-8"
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="ml-1 text-xs">{t('training.viewSwitcher.grid')}</span>
      </Button>
    </div>
  );
};