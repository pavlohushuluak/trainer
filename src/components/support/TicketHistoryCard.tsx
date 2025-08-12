
import React, { useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';

interface TicketHistoryCardProps {
  ticket: any;
  onTicketClick: (ticket: any) => void;
}

const getStatusBadge = (status: string, t: any) => {
  const variants: Record<string, { variant: any; icon: any; label: string }> = {
    open: { variant: "default", icon: AlertCircle, label: t('support.ticketHistory.status.open') },
    in_progress: { variant: "secondary", icon: Clock, label: t('support.ticketHistory.status.inProgress') },
    waiting_user: { variant: "outline", icon: Clock, label: t('support.ticketHistory.status.waitingUser') },
    resolved: { variant: "default", icon: CheckCircle, label: t('support.ticketHistory.status.resolved') },
    closed: { variant: "secondary", icon: CheckCircle, label: t('support.ticketHistory.status.closed') }
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

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    technisch: "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300",
    abo: "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300",
    funktion: "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300",
    training: "bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300",
    allgemein: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300"
  };
  return colors[category] || colors.allgemein;
};

export const TicketHistoryCard = React.memo(({ ticket, onTicketClick }: TicketHistoryCardProps) => {
  const { t } = useTranslations();
  
  const handleClick = useCallback(() => {
    onTicketClick(ticket);
  }, [onTicketClick, ticket]);

  const statusBadge = useMemo(() => getStatusBadge(ticket.status, t), [ticket.status, t]);
  const categoryBadge = useMemo(() => (
    <Badge className={getCategoryColor(ticket.category)}>
      {ticket.category}
    </Badge>
  ), [ticket.category]);

  const satisfactionStars = useMemo(() => {
    if (!ticket.satisfaction_rating) return null;
    return (
      <div className="flex items-center gap-1 mt-2">
        <span className="text-sm text-muted-foreground">{t('support.ticketHistory.rating')}:</span>
        {[...Array(ticket.satisfaction_rating)].map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
    );
  }, [ticket.satisfaction_rating, t]);

  const aiResolvedBadge = useMemo(() => {
    if (!ticket.is_resolved_by_ai) return null;
    return (
      <Badge variant="outline" className="mt-2">
        {t('support.ticketHistory.resolvedByAI')} 🤖
      </Badge>
    );
  }, [ticket.is_resolved_by_ai, t]);

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-medium">{ticket.subject}</h3>
            <p className="text-sm text-muted-foreground">
              #{ticket.id.slice(-8)} • {new Date(ticket.created_at).toLocaleDateString('de-DE')}
            </p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            {statusBadge}
            {categoryBadge}
          </div>
        </div>
        
        {satisfactionStars}
        {aiResolvedBadge}
      </CardContent>
    </Card>
  );
});
