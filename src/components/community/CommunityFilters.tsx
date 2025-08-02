
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

interface CommunityFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedPostType: string;
  onPostTypeChange: (postType: string) => void;
}

export const CommunityFilters = ({ selectedCategory, onCategoryChange, selectedPostType, onPostTypeChange }: CommunityFiltersProps) => {
  const { t } = useTranslation();
  
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
        <h3 className="text-sm font-medium text-gray-700 mb-2">{t('community.filters.categories.title')}</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => {
                onCategoryChange(category.id);
              }}
              className="flex items-center gap-2"
            >
              <span>{category.icon}</span>
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Post Type Filters */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">{t('community.filters.postTypes.title')}</h3>
        <div className="flex flex-wrap gap-2">
          {postTypes.map((type) => (
            <Button
              key={type.id}
              variant={selectedPostType === type.id ? "default" : "outline"}
              size="sm"
              onClick={() => {
                onPostTypeChange(type.id);
              }}
              className="flex items-center gap-2"
            >
              <span>{type.icon}</span>
              {type.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Active Filters Display */}
      {(selectedCategory !== 'all' || selectedPostType !== 'all') && (
        <div className="flex items-center gap-2 pt-2 border-t">
          <span className="text-sm text-gray-600">{t('community.filters.activeFilters.label')}</span>
          {selectedCategory !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {categories.find(c => c.id === selectedCategory)?.icon}
              {categories.find(c => c.id === selectedCategory)?.label}
            </Badge>
          )}
          {selectedPostType !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {postTypes.find(t => t.id === selectedPostType)?.icon}
              {postTypes.find(t => t.id === selectedPostType)?.label}
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
