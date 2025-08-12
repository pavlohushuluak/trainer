
import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, History } from 'lucide-react';
import { useSupportTickets } from '@/hooks/useSupportTickets';
import { FeedbackForm } from './FeedbackForm';
import { TicketHistoryCard } from './TicketHistoryCard';
import { TicketDetailDialog } from './TicketDetailDialog';
import { EmptyTicketState } from './EmptyTicketState';
import { useTranslations } from '@/hooks/useTranslations';

export const TicketHistory = () => {
  const { tickets, loading, fetchTicketMessages, submitFeedback, fetchTickets } = useSupportTickets();
  const { t } = useTranslations();
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [ticketMessages, setTicketMessages] = useState<any[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  
  // Fetch tickets on mount and set up refresh interval
  useEffect(() => {
    fetchTickets();
    
    // Set up timer to refresh data every 10 seconds
    const interval = setInterval(() => {
      fetchTickets();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchTickets]);

  const loadTicketDetails = useCallback(async (ticket: any) => {
    const messages = await fetchTicketMessages(ticket.id);
    setSelectedTicket(ticket);
    setTicketMessages(messages);
  }, [fetchTicketMessages]);

  const handleFeedbackSubmit = useCallback(async (rating: number, feedback?: string) => {
    if (selectedTicket) {
      await submitFeedback(selectedTicket.id, rating, feedback);
      setShowFeedback(false);
      setSelectedTicket(null);
    }
  }, [selectedTicket, submitFeedback]);

  const handleCloseDialog = useCallback(() => {
    setSelectedTicket(null);
  }, []);

  const handleFeedbackClick = useCallback(() => {
    setShowFeedback(true);
  }, []);

  const handleCloseFeedback = useCallback(() => {
    setShowFeedback(false);
  }, []);

  return (
    <>
      <Card className="bg-gradient-to-br from-background to-muted/5 border-2 border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl font-semibold text-foreground">
            <div className="p-2 bg-primary/10 rounded-lg">
              <History className="h-6 w-6 text-primary" />
            </div>
            {t('support.ticketHistory.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : tickets.length === 0 ? (
            <EmptyTicketState />
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <TicketHistoryCard
                  key={ticket.id}
                  ticket={ticket}
                  onTicketClick={loadTicketDetails}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <TicketDetailDialog
        selectedTicket={selectedTicket}
        ticketMessages={ticketMessages}
        onClose={handleCloseDialog}
        onFeedbackClick={handleFeedbackClick}
      />

      <FeedbackForm
        isOpen={showFeedback}
        onClose={handleCloseFeedback}
        onSubmit={handleFeedbackSubmit}
      />
    </>
  );
};
