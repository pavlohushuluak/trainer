
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "@/hooks/useTranslations";

interface CommunityFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedPostType: string;
  onPostTypeChange: (postType: string) => void;
}

export const CommunityFilters = ({ selectedCategory, onCategoryChange, selectedPostType, onPostTypeChange }: CommunityFiltersProps) => {
  const { t } = useTranslations();
  
  const categories = [
    { id: 'all', label: t('community.filters.categories.all'), icon: '🐾' },
    { id: 'hund', label: t('community.filters.categories.dog'), icon: '🐕' },
    { id: 'katze', label: t('community.filters.categories.cat'), icon: '🐱' },
    { id: 'pferd', label: t('community.filters.categories.horse'), icon: '🐴' },
    { id: 'kleintiere', label: t('community.filters.categories.smallAnimals'), icon: '🐹' },
    { id: 'voegel', label: t('community.filters.categories.birds'), icon: '🐦' },
    { id: 'sonstige', label: t('community.filters.categories.other'), icon: '🦎' },
  ];

  const postTypes = [
    { id: 'all', label: t('community.filters.postTypes.all'), icon: '📝' },
    { id: 'question', label: t('community.filters.postTypes.question'), icon: '❓' },
    { id: 'tip', label: t('community.filters.postTypes.tip'), icon: '💡' },
    { id: 'success', label: t('community.filters.postTypes.success'), icon: '🎉' },
    { id: 'discussion', label: t('community.filters.postTypes.discussion'), icon: '💬' },
  ];
  
  return (
    <div className="mb-6 space-y-4">
      {/* Category Filters */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('community.filters.categories.title')}</h3>
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => {
                onCategoryChange(category.id);
              }}
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <span className="text-sm">{category.icon}</span>
              <span className="hidden sm:inline">{category.label}</span>
              <span className="sm:hidden">{category.label.split(' ')[0]}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Post Type Filters */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('community.filters.postTypes.title')}</h3>
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {postTypes.map((type) => (
            <Button
              key={type.id}
              variant={selectedPostType === type.id ? "default" : "outline"}
              size="sm"
              onClick={() => {
                onPostTypeChange(type.id);
              }}
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <span className="text-sm">{type.icon}</span>
              <span className="hidden sm:inline">{type.label}</span>
              <span className="sm:hidden">{type.label.split(' ')[0]}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Active Filters Display */}
      {(selectedCategory !== 'all' || selectedPostType !== 'all') && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('community.filters.activeFilters.label')}</span>
          {selectedCategory !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1 text-xs">
              {categories.find(c => c.id === selectedCategory)?.icon}
              <span className="hidden sm:inline">{categories.find(c => c.id === selectedCategory)?.label}</span>
              <span className="sm:hidden">{categories.find(c => c.id === selectedCategory)?.label?.split(' ')[0]}</span>
            </Badge>
          )}
          {selectedPostType !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1 text-xs">
              {postTypes.find(t => t.id === selectedPostType)?.icon}
              <span className="hidden sm:inline">{postTypes.find(t => t.id === selectedPostType)?.label}</span>
              <span className="sm:hidden">{postTypes.find(t => t.id === selectedPostType)?.label?.split(' ')[0]}</span>
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onCategoryChange('all');
              onPostTypeChange('all');
            }}
            className="text-xs"
          >
            {t('community.filters.activeFilters.clearAll')}
          </Button>
        </div>
      )}
    </div>
  );
};
