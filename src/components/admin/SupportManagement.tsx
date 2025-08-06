
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Users, 
  MessageSquare, 
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Search
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface SystemNotificationExtended {
  id: string;
  type: string;
  title: string;
  message?: string | null;
  user_id?: string | null;
  admin_id?: string | null;
  status: 'unread' | 'read' | 'resolved';
  created_at: string | null;
}

export const SupportManagement = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [newNotification, setNewNotification] = useState({
    type: 'info',
    title: '',
    message: '',
    user_id: ''
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notifications } = useQuery({
    queryKey: ['admin-notifications', searchQuery, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('system_notifications')
        .select('*');

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Client-seitige Suche
      let filteredData = (data || []) as SystemNotificationExtended[];
      if (searchQuery.trim()) {
        filteredData = filteredData.filter((notification: SystemNotificationExtended) => 
          notification.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          notification.message?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      return filteredData;
    },
  });

  const { data: userNotes } = useQuery({
    queryKey: ['admin-user-notes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_notes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
  });

  const createNotificationMutation = useMutation({
    mutationFn: async (notification: typeof newNotification) => {
      const { data, error } = await supabase
        .from('system_notifications')
        .insert([{
          type: notification.type,
          title: notification.title,
          message: notification.message || null,
          user_id: notification.user_id || null,
          status: 'unread'
        }]);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      setIsDialogOpen(false);
      setNewNotification({ type: 'info', title: '', message: '', user_id: '' });
      toast({
        title: t('adminSupport.notifications.created'),
        description: t('adminSupport.notifications.createdDescription')
      });
    },
    onError: (error) => {
      toast({
        title: t('adminSupport.notifications.error'),
        description: t('adminSupport.notifications.errorDescription'),
        variant: "destructive"
      });
    }
  });

  const updateNotificationStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from('system_notifications')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'unread':
        return <Badge variant="destructive">{t('adminSupport.statusBadges.unread')}</Badge>;
      case 'read':
        return <Badge variant="secondary">{t('adminSupport.statusBadges.read')}</Badge>;
      case 'resolved':
        return <Badge variant="default">{t('adminSupport.statusBadges.resolved')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Section - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold">{t('adminSupport.title')}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {t('adminSupport.description')}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              {t('adminSupport.notifications.createNew')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t('adminSupport.notifications.createTitle')}</DialogTitle>
              <DialogDescription>
                {t('adminSupport.notifications.createDescription')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">{t('adminSupport.notifications.type')}</label>
                <Select value={newNotification.type} onValueChange={(value) => 
                  setNewNotification({...newNotification, type: value})
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">{t('adminSupport.notifications.types.info')}</SelectItem>
                    <SelectItem value="warning">{t('adminSupport.notifications.types.warning')}</SelectItem>
                    <SelectItem value="error">{t('adminSupport.notifications.types.error')}</SelectItem>
                    <SelectItem value="success">{t('adminSupport.notifications.types.success')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">{t('adminSupport.notifications.title')}</label>
                <Input
                  value={newNotification.title}
                  onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                  placeholder={t('adminSupport.notifications.titlePlaceholder')}
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t('adminSupport.notifications.message')}</label>
                <Textarea
                  value={newNotification.message}
                  onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                  placeholder={t('adminSupport.notifications.messagePlaceholder')}
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t('adminSupport.notifications.userId')}</label>
                <Input
                  value={newNotification.user_id}
                  onChange={(e) => setNewNotification({...newNotification, user_id: e.target.value})}
                  placeholder={t('adminSupport.notifications.userIdPlaceholder')}
                />
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                {t('adminSupport.notifications.cancel')}
              </Button>
              <Button 
                onClick={() => createNotificationMutation.mutate(newNotification)}
                disabled={createNotificationMutation.isPending || !newNotification.title}
                className="w-full sm:w-auto"
              >
                {t('adminSupport.notifications.create')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards - Mobile Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">{t('adminSupport.stats.unreadNotifications')}</CardTitle>
            <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">
              {notifications?.filter(n => n.status === 'unread').length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">{t('adminSupport.stats.resolvedTickets')}</CardTitle>
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">
              {notifications?.filter(n => n.status === 'resolved').length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">{t('adminSupport.stats.userNotes')}</CardTitle>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{userNotes?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">{t('adminSupport.stats.openTickets')}</CardTitle>
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">
              {notifications?.filter(n => n.status === 'read').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Section - Mobile Responsive */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            {t('adminSupport.filters.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Input
              placeholder={t('adminSupport.filters.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t('adminSupport.filters.status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('adminSupport.filters.allStatuses')}</SelectItem>
                <SelectItem value="unread">{t('adminSupport.filters.unread')}</SelectItem>
                <SelectItem value="read">{t('adminSupport.filters.read')}</SelectItem>
                <SelectItem value="resolved">{t('adminSupport.filters.resolved')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List - Mobile Responsive */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">{t('adminSupport.notificationsList.title')} ({notifications?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            {notifications?.map((notification) => (
              <div key={notification.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg gap-3 sm:gap-4">
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="flex-shrink-0 mt-1 sm:mt-0">
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm sm:text-base truncate">{notification.title}</h3>
                    {notification.message && (
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(notification.created_at)}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  <div className="flex-shrink-0">
                    {getStatusBadge(notification.status)}
                  </div>
                  
                  {notification.status !== 'resolved' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateNotificationStatus.mutate({
                        id: notification.id,
                        status: notification.status === 'unread' ? 'read' : 'resolved'
                      })}
                      className="w-full sm:w-auto text-xs sm:text-sm"
                    >
                      {notification.status === 'unread' ? t('adminSupport.notificationsList.markAsRead') : t('adminSupport.notificationsList.resolve')}
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            {notifications?.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-sm sm:text-base">{t('adminSupport.notificationsList.noNotifications')}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
