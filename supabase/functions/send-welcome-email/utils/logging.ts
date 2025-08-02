
import { logStep } from "./logger.ts";

export const logEmailSuccess = async (
  supabaseClient: any,
  emailType: string,
  subject: string,
  finalRecipient: string,
  userEmail: string,
  testMode: boolean
) => {
  try {
    await supabaseClient.from('system_notifications').insert({
      type: emailType,
      title: subject,
      message: `E-Mail erfolgreich versendet an ${finalRecipient}${testMode ? ` (Test-Modus, Original: ${userEmail})` : ''}`,
      user_id: null,
      status: 'sent'
    });
  } catch (logError) {
    logStep("Failed to log success", { logError });
  }
};

export const logEmailError = async (
  supabaseClient: any,
  emailType: string,
  subject: string,
  finalRecipient: string,
  errorMessage: string
) => {
  try {
    await supabaseClient.from('system_notifications').insert({
      type: emailType,
      title: `E-Mail fehlgeschlagen: ${subject}`,
      message: `Fehler beim Senden an ${finalRecipient}: ${errorMessage}`,
      user_id: null,
      status: 'failed'
    });
  } catch (logError) {
    logStep("Failed to log error", { logError });
  }
};
