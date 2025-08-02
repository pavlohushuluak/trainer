
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, AlertCircle, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AdminTicket {
  id: string;
  user_id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  satisfaction_rating?: number;
  is_resolved_by_ai: boolean;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  profiles?: {
    first_name?: string;
    last_name?: string;
    email: string;
  };
}

interface TicketListProps {
  tickets: AdminTicket[];
  loading: boolean;
  onTicketClick: (ticket: AdminTicket) => void;
}

export const TicketList = ({ tickets, loading, onTicketClick }: TicketListProps) => {
  const { t } = useTranslation();
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any; label: string }> = {
      open: { variant: "destructive", icon: AlertCircle, label: t('adminSupport.tickets.status.open') },
      in_progress: { variant: "default", icon: Clock, label: t('adminSupport.tickets.status.inProgress') },
      waiting_user: { variant: "secondary", icon: Clock, label: t('adminSupport.tickets.status.waitingUser') },
      resolved: { variant: "outline", icon: CheckCircle, label: t('adminSupport.tickets.status.resolved') },
      closed: { variant: "secondary", icon: CheckCircle, label: t('adminSupport.tickets.status.closed') }
    };

    const config = variants[status] || variants.open;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      urgent: "text-red-600",
      high: "text-orange-600",
      normal: "text-blue-600",
      low: "text-gray-600"
    };
    return colors[priority] || colors.normal;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">{t('adminSupport.tickets.loading')}</CardContent>
      </Card>
    );
  }

  if (tickets.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          {t('adminSupport.tickets.noTickets')}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {tickets.map((ticket) => (
        <Card 
          key={ticket.id} 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onTicketClick(ticket)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium">{ticket.subject}</h3>
                  {ticket.is_resolved_by_ai && (
                    <Badge variant="outline" className="text-xs">{t('adminSupport.tickets.aiResolved')}</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {ticket.profiles?.first_name} {ticket.profiles?.last_name} 
                  ({ticket.profiles?.email})
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>#{ticket.id.slice(-8)}</span>
                  <span>•</span>
                  <span>{new Date(ticket.created_at).toLocaleString('de-DE')}</span>
                  <span>•</span>
                  <span className={getPriorityColor(ticket.priority)}>
                    {ticket.priority.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2 items-end">
                {getStatusBadge(ticket.status)}
                <Badge variant="outline">{ticket.category}</Badge>
                {ticket.satisfaction_rating && (
                  <div className="flex items-center gap-1">
                    {[...Array(ticket.satisfaction_rating)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
