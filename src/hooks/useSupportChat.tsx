
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from '@/hooks/useTranslations';
import { requestCache } from '@/utils/requestCache';

interface Message {
  id: string;
  sender_type: 'user' | 'ai' | 'admin';
  sender_id: string | null;
  message: string;
  message_type: string;
  created_at: string;
  metadata?: any;
}

export const useSupportChat = (isOpen: boolean) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslations();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [showSatisfactionRequest, setShowSatisfactionRequest] = useState(false);
  const [lastAiMessageId, setLastAiMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && user) {
      initializeChat();
    }
  }, [isOpen, user]); // initializeChat will be memoized below

  const initializeChat = useCallback(async () => {
    if (!user) return;

    const welcomeMessage: Message = {
      id: 'welcome',
      sender_type: 'ai',
      sender_id: null,
      message: t('support.chat.welcomeMessage'),
      message_type: 'text',
      created_at: new Date().toISOString()
    };

    setMessages([welcomeMessage]);

    try {
      const result = await requestCache.get(
        `existing_tickets_${user.id}`,
        async () => {
          const { data: existingTickets } = await supabase
            .from('support_tickets')
            .select('*')
            .eq('user_id', user.id)
            .in('status', ['open', 'waiting_user'])
            .order('created_at', { ascending: false })
            .limit(1);

          return existingTickets || [];
        },
        10000 // Cache for 10 seconds
      );

      if (result && result.length > 0) {
        const ticket = result[0];
        setTicketId(ticket.id);
        
        const ticketMessages = await requestCache.get(
          `ticket_messages_${ticket.id}`,
          async () => {
            const { data: ticketMessages } = await supabase
              .from('support_messages')
              .select('*')
              .eq('ticket_id', ticket.id)
              .order('created_at', { ascending: true });

            if (ticketMessages) {
              return ticketMessages.map(msg => ({
                ...msg,
                sender_type: msg.sender_type as 'user' | 'ai' | 'admin'
              })) as Message[];
            }
            return [];
          },
          15000 // Cache for 15 seconds
        );
        
        if (ticketMessages.length > 0) {
          setMessages([welcomeMessage, ...ticketMessages]);
        }
      }
    } catch (error) {
      console.warn('Error initializing chat:', error);
    }
  }, [user, t]);

  const createTicket = useCallback(async () => {
    if (!user) return null;

    try {
      const { data: ticket, error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          subject: 'Support-Anfrage',
          category: 'allgemein',
          status: 'open'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating ticket:', error);
        return null;
      }

      return ticket.id;
    } catch (error) {
      console.error('Error creating ticket:', error);
      return null;
    }
  }, [user]);

  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() || !user) return;

    setIsLoading(true);
    let currentTicketId = ticketId;

    if (!currentTicketId) {
      currentTicketId = await createTicket();
      if (!currentTicketId) {
        toast({
          variant: "destructive",
          title: t('support.chat.ticketCreationError.title'),
          description: t('support.chat.ticketCreationError.description')
        });
        setIsLoading(false);
        return;
      }
      setTicketId(currentTicketId);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      sender_type: 'user',
      sender_id: user.id,
      message: newMessage,
      message_type: 'text',
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = newMessage;
    setNewMessage('');
    setShowSatisfactionRequest(false);

    try {
      const { data, error } = await supabase.functions.invoke('support-ai-chat', {
        body: {
          message: messageToSend,
          ticketId: currentTicketId,
          userId: user.id,
          chatHistory: messages.filter(m => m.id !== 'welcome')
        }
      });

      if (error) throw error;

      if (data.success && data.message) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          sender_type: 'ai',
          sender_id: null,
          message: data.message,
          message_type: 'text',
          created_at: new Date().toISOString()
        };

        setMessages(prev => [...prev, aiMessage]);
        setLastAiMessageId(aiMessage.id);
        
        if (data.showSatisfactionRequest) {
          setTimeout(() => {
            setShowSatisfactionRequest(true);
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: t('support.chat.messageSendError.title'),
        description: t('support.chat.messageSendError.description')
      });
    }

    setIsLoading(false);
  }, [newMessage, user, ticketId, messages, toast, createTicket, t]);

  const handleSatisfactionFeedback = useCallback(async (isHelpful: boolean) => {
    if (!ticketId || !user) return;

    setShowSatisfactionRequest(false);

    if (isHelpful) {
      await supabase
        .from('support_tickets')
        .update({ 
          status: 'resolved',
          is_resolved_by_ai: true,
          resolved_at: new Date().toISOString(),
          satisfaction_rating: 5
        })
        .eq('id', ticketId);

      await supabase
        .from('support_feedback')
        .insert({
          ticket_id: ticketId,
          user_id: user.id,
          rating: 5,
          resolved_by: 'ai'
        });

      const thankYouMessage: Message = {
        id: (Date.now() + 2).toString(),
        sender_type: 'ai',
        sender_id: null,
        message: t('support.chat.satisfaction.thankYouMessage'),
        message_type: 'system',
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, thankYouMessage]);
      
      toast({
        title: t('support.chat.satisfaction.thankYouToast.title'),
        description: t('support.chat.satisfaction.thankYouToast.description')
      });

      return true; // Signal to close chat
    } else {
      await supabase
        .from('support_tickets')
        .update({ 
          status: 'in_progress',
          satisfaction_rating: 2
        })
        .eq('id', ticketId);

      const escalationMessage: Message = {
        id: (Date.now() + 3).toString(),
        sender_type: 'ai',
        sender_id: null,
        message: t('support.chat.satisfaction.escalationMessage'),
        message_type: 'system',
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, escalationMessage]);
      
      toast({
        title: t('support.chat.satisfaction.escalationToast.title'),
        description: t('support.chat.satisfaction.escalationToast.description')
      });

      return false;
    }
  }, [ticketId, user, toast, t]);

  return {
    messages,
    newMessage,
    setNewMessage,
    isLoading,
    ticketId,
    showSatisfactionRequest,
    messagesEndRef,
    sendMessage,
    handleSatisfactionFeedback
  };
};
