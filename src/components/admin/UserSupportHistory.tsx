
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HelpCircle, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface UserSupportHistoryProps {
  userId: string;
}

export const UserSupportHistory = ({ userId }: UserSupportHistoryProps) => {
  const { t, i18n } = useTranslation();
  const { data: supportTickets, isLoading } = useQuery({
    queryKey: ['user-support-tickets', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          id,
          subject,
          category,
          status,
          priority,
          satisfaction_rating,
          is_resolved_by_ai,
          created_at,
          resolved_at
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'open': 'destructive',
      'in_progress': 'default',
      'waiting_user': 'outline',
      'resolved': 'secondary'
    };
    
    const statusLabels: Record<string, string> = {
      'open': t('adminDetails.supportHistory.status.open'),
      'in_progress': t('adminDetails.supportHistory.status.inProgress'),
      'waiting_user': t('adminDetails.supportHistory.status.waitingUser'),
      'resolved': t('adminDetails.supportHistory.status.resolved')
    };
    
    return <Badge variant={variants[status] || 'secondary'}>{statusLabels[status] || status}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'low': 'secondary',
      'normal': 'outline',
      'high': 'default',
      'urgent': 'destructive'
    };
    
    const priorityLabels: Record<string, string> = {
      'low': t('adminDetails.supportHistory.priority.low'),
      'normal': t('adminDetails.supportHistory.priority.normal'),
      'high': t('adminDetails.supportHistory.priority.high'),
      'urgent': t('adminDetails.supportHistory.priority.urgent')
    };
    
    return <Badge variant={variants[priority] || 'outline'}>{priorityLabels[priority] || priority}</Badge>;
  };

  if (isLoading) {
    return <div className="text-center py-4">{t('adminDetails.supportHistory.loading')}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <HelpCircle className="h-4 w-4" />
        <h4 className="font-medium">{t('adminDetails.supportHistory.title', { count: supportTickets?.length || 0 })}</h4>
      </div>

      <ScrollArea className="h-80">
        <div className="space-y-3">
          {supportTickets?.map((ticket) => (
            <div key={ticket.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h5 className="font-medium">{ticket.subject}</h5>
                  <p className="text-sm text-muted-foreground">#{ticket.id.slice(-8)}</p>
                </div>
                <div className="flex flex-col gap-1">
                  {getStatusBadge(ticket.status)}
                  {getPriorityBadge(ticket.priority)}
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{t('adminDetails.supportHistory.category')}: {ticket.category}</span>
                <span>{t('adminDetails.supportHistory.created')}: {new Date(ticket.created_at).toLocaleDateString(i18n.language === 'de' ? 'de-DE' : 'en-US')}</span>
                {ticket.resolved_at && (
                  <span>{t('adminDetails.supportHistory.resolved')}: {new Date(ticket.resolved_at).toLocaleDateString(i18n.language === 'de' ? 'de-DE' : 'en-US')}</span>
                )}
              </div>

              <div className="flex items-center gap-4 mt-2">
                {ticket.is_resolved_by_ai && (
                  <Badge variant="outline" className="text-xs">🤖 {t('adminDetails.supportHistory.aiResolved')}</Badge>
                )}
                {ticket.satisfaction_rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs">{ticket.satisfaction_rating}/5</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {!supportTickets?.length && (
            <p className="text-muted-foreground text-center py-8">{t('adminDetails.supportHistory.noTickets')}</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
