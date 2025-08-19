
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminUserCard } from './AdminUserCard';
import { AdminUser } from './types';
import { useTranslation } from 'react-i18next';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react';

interface AdminUsersListProps {
  admins: AdminUser[];
  onToggleStatus: (adminId: string, activate: boolean) => void;
  onRemove: (adminId: string) => void;
  isToggling: boolean;
  isRemoving: boolean;
}

export const AdminUsersList = ({ 
  admins, 
  onToggleStatus, 
  onRemove, 
  isToggling, 
  isRemoving 
}: AdminUsersListProps) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'support'>('all');
  const [sortBy, setSortBy] = useState<'email' | 'created_at' | 'role'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Frontend filtering and sorting
  const filteredAndSortedAdmins = useMemo(() => {
    let filtered = admins.filter(admin => {
      const matchesSearch = admin.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && admin.is_active) || 
        (statusFilter === 'inactive' && !admin.is_active);
      const matchesRole = roleFilter === 'all' || admin.role === roleFilter;
      
      return matchesSearch && matchesStatus && matchesRole;
    });

    // Frontend sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'role':
          aValue = a.role;
          bValue = b.role;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [admins, searchTerm, statusFilter, roleFilter, sortBy, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t('adminUsersList.title', { count: admins?.length || 0 })}</span>
          <div className="flex gap-2 text-sm text-muted-foreground">
            <span>{t('adminUsersList.activeCount', { count: admins?.filter(a => a.is_active).length || 0 })}</span>
            <span>•</span>
            <span>{t('adminUsersList.inactiveCount', { count: admins?.filter(a => !a.is_active).length || 0 })}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Frontend Filters */}
        <div className="space-y-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value: 'all' | 'active' | 'inactive') => setStatusFilter(value)}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={(value: 'all' | 'admin' | 'support') => setRoleFilter(value)}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="support">Support</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value: 'email' | 'created_at' | 'role') => setSortBy(value)}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Created Date</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="role">Role</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSortOrder}
              className="w-full sm:w-auto"
            >
              {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Results count */}
        <div className="text-sm text-muted-foreground mb-4">
          Showing {filteredAndSortedAdmins.length} of {admins?.length || 0} admin users
        </div>

        <div className="space-y-4">
          {filteredAndSortedAdmins.map((admin) => (
            <AdminUserCard
              key={admin.id}
              admin={admin}
              onToggleStatus={onToggleStatus}
              onRemove={onRemove}
              isToggling={isToggling}
              isRemoving={isRemoving}
            />
          ))}
          
          {filteredAndSortedAdmins.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              {searchTerm || statusFilter !== 'all' || roleFilter !== 'all' 
                ? 'No admin users match your filters'
                : t('adminUsersList.noAdmins')
              }
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
