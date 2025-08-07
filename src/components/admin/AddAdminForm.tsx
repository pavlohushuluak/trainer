
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus, Plus, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from 'react-i18next';

interface AddAdminFormProps {
  onAddAdmin: (email: string, role: 'admin' | 'support') => void;
  isAdding: boolean;
}

export const AddAdminForm = ({ onAddAdmin, isAdding }: AddAdminFormProps) => {
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'admin' | 'support'>('support');
  const { t } = useTranslation();

  const handleSubmit = () => {
    if (newAdminEmail.trim()) {
      onAddAdmin(newAdminEmail.trim(), newAdminRole);
      setNewAdminEmail('');
      setNewAdminRole('support');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <UserPlus className="h-5 w-5" />
          {t('adminAddAdmin.title')}
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
          {t('adminAddAdmin.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <Input
              placeholder={t('adminAddAdmin.emailPlaceholder')}
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={newAdminRole} onValueChange={(value: 'admin' | 'support') => setNewAdminRole(value)}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="support">{t('adminAddAdmin.roles.support')}</SelectItem>
              <SelectItem value="admin">{t('adminAddAdmin.roles.admin')}</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={handleSubmit}
            disabled={!newAdminEmail.trim() || isAdding}
            className="w-full sm:w-auto"
          >
            {isAdding ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            <span className="text-sm sm:text-base">{t('adminAddAdmin.addButton')}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
