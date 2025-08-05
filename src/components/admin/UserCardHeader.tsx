
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Mail, TestTube } from 'lucide-react';
import { UserWithDetails } from './types';

interface UserCardHeaderProps {
  user: UserWithDetails;
}

export const UserCardHeader = ({ user }: UserCardHeaderProps) => {
  return (
    <CardHeader className="pb-3">
      <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {user.subscription?.is_test_user && (
            <TestTube className="h-4 w-4 text-purple-500 flex-shrink-0" />
          )}
          <span className="text-sm sm:text-base truncate">{user.email}</span>
        </div>
        
        <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
          <Calendar className="h-3 w-3 mr-1" />
          <span className="hidden sm:inline">{new Date(user.created_at).toLocaleDateString()}</span>
          <span className="sm:hidden">{new Date(user.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' })}</span>
        </div>
      </CardTitle>
      <CardDescription className="flex items-center gap-2 text-xs">
        <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
        <span className="truncate font-mono">{user.id}</span>
      </CardDescription>
    </CardHeader>
  );
};
