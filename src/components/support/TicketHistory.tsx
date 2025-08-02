
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { useSupportTickets } from '@/hooks/useSupportTickets';
import { FeedbackForm } from './FeedbackForm';
import { TicketHistoryCard } from './TicketHistoryCard';
import { TicketDetailDialog } from './TicketDetailDialog';
import { EmptyTicketState } from './EmptyTicketState';
import { useTranslations } from '@/hooks/useTranslations';

export const TicketHistory = React.memo(() => {
  const { tickets, fetchTicketMessages, submitFeedback, fetchTickets } = useSupportTickets();
  const { t } = useTranslations();
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [ticketMessages, setTicketMessages] = useState<any[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  
  // Use refs to track if component has rendered to prevent unnecessary re-renders
  const hasRendered = useRef(false);
  const ticketsRef = useRef(tickets);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Set up timer to fetch data every 3 seconds
  useEffect(() => {
    const startTimer = () => {
      timerRef.current = setInterval(() => {
        fetchTickets(); // Reset data by fetching fresh data
      }, 3000); // 3 seconds
    };

    // Start timer immediately
    startTimer();

    // Cleanup timer on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [fetchTickets]);
  
  // Only update refs when tickets actually change
  useEffect(() => {
    if (JSON.stringify(ticketsRef.current) !== JSON.stringify(tickets)) {
      ticketsRef.current = tickets;
    }
  }, [tickets]);
  
  // Mark as rendered once
  useEffect(() => {
    hasRendered.current = true;
  }, []);

  const loadTicketDetails = useCallback(async (ticket: any) => {
    // Batch state updates to prevent multiple re-renders
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

  const ticketsList = useMemo(() => (
    <div className="space-y-4">
      {ticketsRef.current.map((ticket) => (
        <TicketHistoryCard
          key={ticket.id}
          ticket={ticket}
          onTicketClick={loadTicketDetails}
        />
      ))}
    </div>
  ), [loadTicketDetails]); // Remove tickets dependency, use ref instead

  const mainCard = useMemo(() => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {t('support.ticketHistory.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {ticketsRef.current.length === 0 ? (
          <EmptyTicketState />
        ) : (
          ticketsList
        )}
      </CardContent>
    </Card>
  ), [ticketsList, t]); // Remove tickets.length dependency, use ref instead

  // Only render once unless there are meaningful changes
  const shouldRender = !hasRendered.current || selectedTicket || showFeedback;

  // If already rendered and no meaningful changes, return cached version
  if (hasRendered.current && !shouldRender) {
    return (
      <>
        {mainCard}
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
  }

  return (
    <>
      {mainCard}

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
});
