
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
    <Badge variant={config.variant} className="flex items-center gap-1 text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 whitespace-nowrap">
      <Icon className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
      <span>{config.label}</span>
    </Badge>
  );
};

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    technical: "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300",
    subscription: "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300",
    feature: "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300",
    training: "bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300",
    general: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300"
  };
  return colors[category] || colors.general;
};

export const TicketHistoryCard = React.memo(({ ticket, onTicketClick }: TicketHistoryCardProps) => {
  const { t } = useTranslations();
  
  const handleClick = useCallback(() => {
    onTicketClick(ticket);
  }, [onTicketClick, ticket]);

  const statusBadge = useMemo(() => getStatusBadge(ticket.status, t), [ticket.status, t]);
  // const categoryBadge = useMemo(() => (
  //   <Badge className={getCategoryColor(ticket.category)}>
  //     {ticket.category}
  //   </Badge>
  // ), [ticket.category, t]);

  const satisfactionStars = useMemo(() => {
    if (!ticket.satisfaction_rating) return null;
    return (
      <div className="flex items-center gap-1 sm:gap-1.5 mt-2 sm:mt-2.5">
        <span className="text-xs sm:text-sm text-muted-foreground">{t('support.ticketHistory.rating')}:</span>
        {[...Array(ticket.satisfaction_rating)].map((_, i) => (
          <Star key={i} className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
        ))}
      </div>
    );
  }, [ticket.satisfaction_rating, t]);

  const aiResolvedBadge = useMemo(() => {
    if (!ticket.is_resolved_by_ai) return null;
    return (
      <Badge variant="outline" className="mt-2 sm:mt-2.5 text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1">
        {t('support.ticketHistory.resolvedByAI')} 🤖
      </Badge>
    );
  }, [ticket.is_resolved_by_ai, t]);

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg hover:border-primary/20 transition-all duration-200 touch-manipulation"
      onClick={handleClick}
    >
      <CardContent className="p-3 sm:p-4 lg:p-5">
        <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm sm:text-base lg:text-lg text-foreground mb-1 sm:mb-1.5 leading-snug truncate">
              {ticket.subject}
            </h3>
            <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground flex flex-wrap items-center gap-1">
              <span className="font-mono">#{ticket.id.slice(-8)}</span>
              <span className="hidden sm:inline">•</span>
              <span className="flex-shrink-0">{new Date(ticket.created_at).toLocaleDateString()}</span>
            </p>
          </div>
          <div className="flex flex-col gap-1.5 sm:gap-2 items-end flex-shrink-0">
            {statusBadge}
            {/* {categoryBadge} */}
          </div>
        </div>
        
        {satisfactionStars}
        {aiResolvedBadge}
      </CardContent>
    </Card>
  );
});
