
import { useState, useCallback, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from '@/hooks/useTranslations';
import { requestCache } from '@/utils/requestCache';

interface SupportTicket {
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
  last_response_at?: string;
}

interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_type: 'user' | 'ai' | 'admin';
  sender_id?: string;
  message: string;
  message_type: string;
  metadata?: any;
  created_at: string;
}

export const useSupportTickets = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslations();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTickets = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const result = await requestCache.get(
        `support_tickets_${user.id}`,
        async () => {
          const { data, error } = await supabase
            .from('support_tickets')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (error) {
            console.warn('Error fetching tickets:', error);
            return [];
          }
          
          return data || [];
        },
        10000 // Cache for 10 seconds for more responsive updates
      );
      
      setTickets(result);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        variant: "destructive",
        title: t('support.loadingError.title'),
        description: t('support.loadingError.description')
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast, t]);

  const fetchTicketMessages = useCallback(async (ticketId: string): Promise<SupportMessage[]> => {
    try {
      const result = await requestCache.get(
        `support_messages_${ticketId}`,
        async () => {
          const { data, error } = await supabase
            .from('support_messages')
            .select('*')
            .eq('ticket_id', ticketId)
            .order('created_at', { ascending: true });

          if (error) {
            console.warn('Error fetching messages:', error);
            return [];
          }
          
          // Type assertion to fix sender_type issue
          const typedMessages = (data || []).map(msg => ({
            ...msg,
            sender_type: msg.sender_type as 'user' | 'ai' | 'admin'
          })) as SupportMessage[];
          
          return typedMessages;
        },
        15000 // Cache for 15 seconds
      );
      
      return result;
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }, []);

  const submitFeedback = useCallback(async (
    ticketId: string, 
    rating: number, 
    feedbackText?: string
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('support_feedback')
        .insert({
          ticket_id: ticketId,
          user_id: user.id,
          rating,
          feedback_text: feedbackText,
          resolved_by: 'admin'
        });

      if (error) throw error;

      // Mark ticket as resolved
      await supabase
        .from('support_tickets')
        .update({ 
          status: 'resolved',
          satisfaction_rating: rating,
          resolved_at: new Date().toISOString()
        })
        .eq('id', ticketId);

      toast({
        title: t('support.feedbackSubmitted.title'),
        description: t('support.feedbackSubmitted.description')
      });

      // Clear specific cache keys and fetch tickets immediately
      requestCache.clear(`support_tickets_${user.id}`);
      await fetchTickets();
      
      // Additional refresh after a short delay to ensure UI is updated
      setTimeout(async () => {
        await fetchTickets();
      }, 500);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        variant: "destructive",
        title: t('support.feedbackError.title'),
        description: t('support.feedbackError.description')
      });
    }
  }, [user, toast, fetchTickets, t]);

  // Initial fetch on mount
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const memoizedValue = useMemo(() => ({
    tickets,
    loading,
    fetchTickets,
    fetchTicketMessages,
    submitFeedback
  }), [tickets, loading, fetchTickets, fetchTicketMessages, submitFeedback]);

  return memoizedValue;
};
