
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PaymentNotificationData {
  userEmail: string;
  userName?: string;
  paymentType: 'payment_failed' | 'payment_retry' | 'payment_method_required';
  amount?: number;
  currency?: string;
  nextRetry?: string;
  failureReason?: string;
}

export const usePaymentEmailNotifications = () => {
  const { toast } = useToast();

  const sendPaymentNotification = useCallback(async (data: PaymentNotificationData) => {
    try {
      const { error } = await supabase.functions.invoke('send-payment-notification', {
        body: {
          userEmail: data.userEmail,
          userName: data.userName,
          paymentType: data.paymentType,
          amount: data.amount,
          currency: data.currency || 'EUR',
          nextRetry: data.nextRetry,
          failureReason: data.failureReason
        }
      });

      if (error) throw error;
      
    } catch (error) {
      console.error('Error sending payment notification:', error);
      // Don't block payment flow if email fails
    }
  }, []);

  return {
    sendPaymentNotification
  };
};
