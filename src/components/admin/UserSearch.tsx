
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface UserSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFilter: (query: string) => void;
  onClear: () => void;
  isFiltering: boolean;
}

export const UserSearch = ({ 
  searchQuery, 
  onSearchChange, 
  onFilter, 
  onClear, 
  isFiltering 
}: UserSearchProps) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState(searchQuery);

  // Sync input value with searchQuery prop
  React.useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  const handleFilter = () => {
    onFilter(inputValue);
  };

  const handleClear = () => {
    setInputValue('');
    onClear();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleFilter();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          <Search className="h-4 w-4 sm:h-5 sm:w-5" />
          {t('adminUsers.search.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <Input
              placeholder={t('adminUsers.search.placeholder')}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleFilter}
              disabled={isFiltering}
              className="w-full sm:w-auto"
            >
              <Filter className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{t('adminUsers.search.filter')}</span>
              <span className="sm:hidden">{t('adminUsers.search.filter')}</span>
            </Button>
            {(searchQuery || inputValue) && (
              <Button 
                onClick={handleClear}
                variant="outline"
                className="w-full sm:w-auto"
              >
                <X className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{t('adminUsers.search.clear')}</span>
                <span className="sm:hidden">{t('adminUsers.search.clear')}</span>
              </Button>
            )}
          </div>
        </div>
        {searchQuery && (
          <div className="mt-3 text-sm text-muted-foreground">
            {t('adminUsers.search.activeFilter')}: "{searchQuery}"
          </div>
        )}
      </CardContent>
    </Card>
  );
};
