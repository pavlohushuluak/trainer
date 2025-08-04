
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Mail, TestTube } from 'lucide-react';
import { UserWithDetails } from './types';

interface UserCardHeaderProps {
  user: UserWithDetails;
}

export const UserCardHeader = ({ user }: UserCardHeaderProps) => {
  return (
    <CardHeader>
      <CardTitle className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {user.subscription?.is_test_user && (
            <TestTube className="h-4 w-4 text-purple-500 mr-1" />
          )}
          {user.email}
        </div>
        
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3 mr-1" />
          {new Date(user.created_at).toLocaleDateString()}
        </div>
      </CardTitle>
      <CardDescription className="flex items-center gap-2">
        <Mail className="h-4 w-4" />
        {user.id}
      </CardDescription>
    </CardHeader>
  );
};
