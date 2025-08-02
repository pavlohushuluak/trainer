
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PlanTemplate } from './PlanTemplates';
import { TemplateCard } from './TemplateCard';
import { getFilteredTemplatesByCategory } from './templateUtils';

interface TemplateCategoryTabsProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  availableCategories: string[];
  filteredTemplates: PlanTemplate[];
  userSpecies: string[];
  onSelectTemplate: (template: PlanTemplate) => void;
}

export const TemplateCategoryTabs = ({
  selectedCategory,
  onCategoryChange,
  availableCategories,
  filteredTemplates,
  userSpecies,
  onSelectTemplate
}: TemplateCategoryTabsProps) => {
  
  const getCategoryDisplayName = (category: string) => {
    if (category === 'all') return 'Alle';
    return category;
  };
  
  const getCategoryCount = (category: string) => {
    if (category === 'all') return filteredTemplates.length;
    return getFilteredTemplatesByCategory(filteredTemplates, category).length;
  };

  return (
    <Tabs value={selectedCategory} onValueChange={onCategoryChange}>
      <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${availableCategories.length}, minmax(0, 1fr))` }}>
        {availableCategories.map(category => (
          <TabsTrigger key={category} value={category} className="flex items-center gap-2">
            {getCategoryDisplayName(category)}
            <Badge variant="secondary" className="text-xs">
              {getCategoryCount(category)}
            </Badge>
          </TabsTrigger>
        ))}
      </TabsList>
      
      <TabsContent value={selectedCategory} className="mt-4">
        <div className="grid gap-4">
          {getFilteredTemplatesByCategory(filteredTemplates, selectedCategory).map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              userSpecies={userSpecies}
              onSelectTemplate={onSelectTemplate}
            />
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
};
