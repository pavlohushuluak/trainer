
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, addDays } from "date-fns";
import { de } from "date-fns/locale";

export const useEmailNotifications = () => {
  const { toast } = useToast();

  const sendWelcomeEmail = useCallback(async (
    userEmail: string,
    userName: string,
    planName: string
  ) => {
    try {
      const trialEndDate = format(addDays(new Date(), 7), "dd. MMMM yyyy", { locale: de });
      
      const { error } = await supabase.functions.invoke('send-welcome-email', {
        body: {
          emailType: "welcome",
          userEmail,
          userName,
          planName,
          trialEndDate,
        }
      });

      if (error) throw error;

    } catch (error) {
      console.error('Error sending welcome email:', error);
      // Don't show error toast to user, just log it
    }
  }, []);

  const sendCheckoutConfirmationEmail = useCallback(async (
    userEmail: string,
    userName: string,
    planName: string,
    amount: string,
    interval: string
  ) => {
    try {
      const trialEndDate = format(addDays(new Date(), 7), "dd. MMMM yyyy", { locale: de });
      
      const { error } = await supabase.functions.invoke('send-welcome-email', {
        body: {
          emailType: "checkout-confirmation",
          userEmail,
          userName,
          planName,
          amount,
          interval,
          trialEndDate,
        }
      });

      if (error) throw error;

    } catch (error) {
      console.error('Error sending checkout confirmation email:', error);
    }
  }, []);

  return {
    sendWelcomeEmail,
    sendCheckoutConfirmationEmail,
  };
};
