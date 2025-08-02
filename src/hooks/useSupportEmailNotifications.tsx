
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useSupportEmailNotifications = () => {
  const { toast } = useToast();

  const sendTicketCreatedEmail = useCallback(async (
    userEmail: string,
    userName: string,
    ticketId: string,
    ticketSubject: string
  ) => {
    try {
      const { error } = await supabase.functions.invoke('send-support-notification', {
        body: {
          emailType: 'ticket_created',
          userEmail,
          userName,
          ticketId,
          ticketSubject
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending ticket created email:', error);
    }
  }, []);

  const sendTicketResponseEmail = useCallback(async (
    userEmail: string,
    userName: string,
    ticketId: string,
    ticketSubject: string,
    adminMessage: string,
    ticketStatus: string
  ) => {
    try {
      const { error } = await supabase.functions.invoke('send-support-notification', {
        body: {
          emailType: 'ticket_response',
          userEmail,
          userName,
          ticketId,
          ticketSubject,
          adminMessage,
          ticketStatus
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending ticket response email:', error);
    }
  }, []);

  const sendTicketResolvedEmail = useCallback(async (
    userEmail: string,
    userName: string,
    ticketId: string,
    ticketSubject: string
  ) => {
    try {
      const { error } = await supabase.functions.invoke('send-support-notification', {
        body: {
          emailType: 'ticket_resolved',
          userEmail,
          userName,
          ticketId,
          ticketSubject
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending ticket resolved email:', error);
    }
  }, []);

  return {
    sendTicketCreatedEmail,
    sendTicketResponseEmail,
    sendTicketResolvedEmail,
  };
};
