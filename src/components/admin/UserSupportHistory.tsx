
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HelpCircle, Star } from 'lucide-react';

interface UserSupportHistoryProps {
  userId: string;
}

export const UserSupportHistory = ({ userId }: UserSupportHistoryProps) => {
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
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'low': 'secondary',
      'normal': 'outline',
      'high': 'default',
      'urgent': 'destructive'
    };
    return <Badge variant={variants[priority] || 'outline'}>{priority}</Badge>;
  };

  if (isLoading) {
    return <div className="text-center py-4">Lade Support-Verlauf...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <HelpCircle className="h-4 w-4" />
        <h4 className="font-medium">Support-Tickets ({supportTickets?.length || 0})</h4>
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
                <span>Kategorie: {ticket.category}</span>
                <span>Erstellt: {new Date(ticket.created_at).toLocaleDateString('de-DE')}</span>
                {ticket.resolved_at && (
                  <span>Gelöst: {new Date(ticket.resolved_at).toLocaleDateString('de-DE')}</span>
                )}
              </div>

              <div className="flex items-center gap-4 mt-2">
                {ticket.is_resolved_by_ai && (
                  <Badge variant="outline" className="text-xs">🤖 AI-gelöst</Badge>
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
            <p className="text-muted-foreground text-center py-8">Keine Support-Tickets gefunden</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
