
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from '@/hooks/useTranslations';

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

interface AdminMessage {
  id: string;
  sender_type: 'user' | 'ai' | 'admin';
  sender_id?: string;
  message: string;
  created_at: string;
  metadata?: any;
}

export const useSupportTicketManager = () => {
  const { toast } = useToast();
  const { t } = useTranslations();
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<AdminTicket | null>(null);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('support_tickets')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      const typedData = (data || []).map(ticket => ({
        ...ticket,
        profiles: Array.isArray(ticket.profiles) ? ticket.profiles[0] : ticket.profiles
      })) as AdminTicket[];
      
      setTickets(typedData);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        variant: "destructive",
        title: t('support.admin.ticketManager.loadingError.title'),
        description: t('support.admin.ticketManager.loadingError.description')
      });
    }
    setLoading(false);
  };

  const fetchMessages = async (ticketId: string) => {
    try {
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      const typedMessages = (data || []).map(msg => ({
        ...msg,
        sender_type: msg.sender_type as 'user' | 'ai' | 'admin'
      })) as AdminMessage[];
      
      setMessages(typedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const openTicket = async (ticket: AdminTicket) => {
    setSelectedTicket(ticket);
    await fetchMessages(ticket.id);
    
    if (ticket.status === 'open') {
      await updateTicketStatus(ticket.id, 'in_progress');
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
      const updateData: any = { status };
      if (status === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('support_tickets')
        .update(updateData)
        .eq('id', ticketId);

      if (error) throw error;
      
      fetchTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status, resolved_at: updateData.resolved_at });
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  };

  const sendAdminMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;

    setSending(true);
    try {
      const { error: messageError } = await supabase
        .from('support_messages')
        .insert({
          ticket_id: selectedTicket.id,
          sender_type: 'admin',
          sender_id: null,
          message: newMessage,
          message_type: 'text'
        });

      if (messageError) throw messageError;

      await supabase
        .from('support_tickets')
        .update({ 
          last_response_at: new Date().toISOString(),
          status: 'waiting_user'
        })
        .eq('id', selectedTicket.id);

      setNewMessage('');
      fetchMessages(selectedTicket.id);
      fetchTickets();

      toast({
        title: t('support.admin.ticketManager.messageSent.title'),
        description: t('support.admin.ticketManager.messageSent.description')
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: t('support.admin.ticketManager.sendError.title'),
        description: t('support.admin.ticketManager.sendError.description')
      });
    }
    setSending(false);
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  return {
    tickets,
    selectedTicket,
    messages,
    newMessage,
    setNewMessage,
    statusFilter,
    setStatusFilter,
    loading,
    sending,
    fetchTickets,
    openTicket,
    updateTicketStatus,
    sendAdminMessage,
    setSelectedTicket
  };
};
