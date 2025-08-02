
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface UserSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const UserSearch = ({ searchQuery, onSearchChange }: UserSearchProps) => {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          {t('adminUsers.search.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder={t('adminUsers.search.placeholder')}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            {t('adminUsers.search.filter')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
