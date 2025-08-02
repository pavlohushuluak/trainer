
import { Resend } from "npm:resend@4.0.0";
import { logStep } from "./logger.ts";

export const validateEmailSetup = async (resendKey: string) => {
  try {
    logStep("Starting email setup validation", { 
      keyExists: !!resendKey, 
      keyLength: resendKey?.length,
      keyPrefix: resendKey?.substring(0, 8) + "..." 
    });
    
    if (!resendKey || resendKey.trim() === '') {
      return {
        valid: false,
        error: "RESEND_API_KEY ist leer oder nicht gesetzt",
        details: {
          apiKeyValid: false,
          apiKeyType: "missing",
          domainsConfigured: false,
          canSendEmails: false,
          troubleshooting: "Bitte überprüfen Sie die Supabase Edge Function Secrets und starten Sie die Functions neu"
        }
      };
    }

    // Check if key looks valid (should start with re_ for Resend)
    if (!resendKey.startsWith('re_')) {
      return {
        valid: false,
        error: "RESEND_API_KEY hat ungültiges Format. Resend API-Keys beginnen mit 're_'",
        details: {
          apiKeyValid: false,
          apiKeyType: "invalid_format",
          domainsConfigured: false,
          canSendEmails: false,
          providedKeyPrefix: resendKey.substring(0, 3),
          troubleshooting: "Erstellen Sie einen neuen API-Key in Resend und aktualisieren Sie die Supabase Secrets"
        }
      };
    }
    
    const resend = new Resend(resendKey);
    
    // Test with a simple email send with better error handling
    logStep("Testing email sending capability with current API key");
    
    try {
      const testEmailResult = await resend.emails.send({
        from: "TierTrainer24 <noreply@mail.tiertrainer24.com>",
        to: ["ow@cooper-ads.com"],
        subject: "✅ API-Key Validierung erfolgreich - TierTrainer",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #22c55e; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
              <h1 style="margin: 0; font-size: 24px;">🎉 API-Key Synchronisation erfolgreich!</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Resend API-Key wurde erfolgreich validiert</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
              <h2 style="margin: 0 0 15px 0; color: #333;">✅ Validierung Details</h2>
              <ul style="margin: 0; padding-left: 20px; color: #666;">
                <li><strong>Zeitstempel:</strong> ${new Date().toLocaleString('de-DE')}</li>
                <li><strong>API-Key Status:</strong> ✅ Gültig und funktionsfähig</li>
                <li><strong>Domain:</strong> mail.tiertrainer24.com</li>
                <li><strong>Test-Empfänger:</strong> ow@cooper-ads.com</li>
                <li><strong>Edge Function:</strong> send-welcome-email</li>
              </ul>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #dbeafe; border-radius: 6px;">
              <p style="margin: 0; color: #1e40af; font-size: 14px;">
                <strong>📧 E-Mail-System bereit:</strong> Alle E-Mail-Funktionen sind jetzt verfügbar und können verwendet werden.
              </p>
            </div>
            
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #666; font-size: 12px; text-align: center;">
              Diese Validierungs-E-Mail wurde automatisch von TierTrainer24 System gesendet.
            </p>
          </div>
        `,
      });
      
      if (testEmailResult.error) {
        logStep("Test email failed", { error: testEmailResult.error });
        
        // Analyze specific error types with better error mapping
        const errorMessage = testEmailResult.error.message || '';
        const errorName = testEmailResult.error.name || '';
        
        // Check for authentication/authorization errors
        if (errorMessage.includes('API key is invalid') || 
            errorMessage.includes('Invalid API key') ||
            errorMessage.includes('Unauthorized') ||
            errorName === 'validation_error') {
          return {
            valid: false,
            error: `API-Key ist ungültig oder abgelaufen. Der Key muss in den Supabase Edge Function Secrets aktualisiert werden.`,
            details: {
              apiKeyValid: false,
              apiKeyType: "invalid_or_expired",
              domainsConfigured: false,
              canSendEmails: false,
              resendError: errorMessage,
              resendErrorName: errorName,
              keyPrefix: resendKey.substring(0, 8) + "...",
              troubleshooting: "1. Gehen Sie zu Resend.com und erstellen Sie einen neuen API-Key\n2. Aktualisieren Sie RESEND_API_KEY in Supabase Edge Function Secrets\n3. Warten Sie 1-2 Minuten bis die Functions neu gestartet sind\n4. Testen Sie erneut"
            }
          };
        }
        
        // Check for domain verification errors
        if (errorMessage.includes('domain') || 
            errorMessage.includes('verified') || 
            errorMessage.includes('not found') ||
            errorMessage.includes('Domain not found')) {
          return {
            valid: false,
            error: `Domain mail.tiertrainer24.com ist nicht in Resend verifiziert.`,
            details: {
              apiKeyValid: true,
              apiKeyType: "valid",
              domainsConfigured: false,
              canSendEmails: false,
              domainVerificationRequired: true,
              resendError: errorMessage,
              resendErrorName: errorName,
              troubleshooting: "1. Gehen Sie zu https://resend.com/domains\n2. Fügen Sie mail.tiertrainer24.com hinzu\n3. Verifizieren Sie die Domain mit den DNS-Einstellungen\n4. Testen Sie erneut"
            }
          };
        }
        
        // Generic error handling
        return {
          valid: false,
          error: `Test-E-Mail konnte nicht gesendet werden: ${errorMessage}`,
          details: {
            apiKeyValid: true,
            apiKeyType: "send_error",
            domainsConfigured: false,
            canSendEmails: false,
            resendError: errorMessage,
            resendErrorName: errorName,
            troubleshooting: "Überprüfen Sie die Resend-Konfiguration und versuchen Sie es erneut"
          }
        };
      }
      
      logStep("Test email sent successfully", { emailId: testEmailResult.data?.id });
      
      return {
        valid: true,
        message: "E-Mail-Konfiguration ist vollständig funktionsfähig - API-Key erfolgreich synchronisiert",
        details: {
          apiKeyValid: true,
          apiKeyType: "valid_and_synced",
          domainsConfigured: true,
          canSendEmails: true,
          testEmailId: testEmailResult.data?.id,
          verifiedDomains: ["mail.tiertrainer24.com"],
          totalDomains: 1,
          syncTimestamp: new Date().toISOString()
        }
      };
      
    } catch (sendError: any) {
      logStep("Email sending test failed with exception", { error: sendError });
      
      // Handle different types of exceptions
      if (sendError.message?.includes('401') || 
          sendError.message?.includes('unauthorized') || 
          sendError.message?.includes('Invalid API key') ||
          sendError.message?.includes('API key is invalid')) {
        return {
          valid: false,
          error: `Resend API-Key ungültig. Der Key in den Supabase Secrets muss aktualisiert werden.`,
          details: {
            apiKeyValid: false,
            apiKeyType: "invalid_or_expired", 
            domainsConfigured: false,
            canSendEmails: false,
            sendError: sendError.message,
            keyPrefix: resendKey.substring(0, 8) + "...",
            troubleshooting: "1. Erstellen Sie einen neuen API-Key in Resend\n2. Aktualisieren Sie RESEND_API_KEY in den Supabase Edge Function Secrets\n3. Warten Sie 1-2 Minuten für Function Neustart\n4. Validieren Sie erneut"
          }
        };
      }
      
      // Check for domain verification errors
      if (sendError.message?.includes('domain') || 
          sendError.message?.includes('verified') || 
          sendError.message?.includes('not found')) {
        return {
          valid: false,
          error: `Domain mail.tiertrainer24.com ist nicht in Resend verifiziert.`,
          details: {
            apiKeyValid: true,
            apiKeyType: "valid",
            domainsConfigured: false,
            canSendEmails: false,
            domainVerificationRequired: true,
            sendError: sendError.message,
            troubleshooting: "Domain-Verifizierung erforderlich in Resend Dashboard"
          }
        };
      }
      
      // Network or other connection errors
      if (sendError.message?.includes('fetch') || 
          sendError.message?.includes('network') ||
          sendError.message?.includes('timeout')) {
        return {
          valid: false,
          error: `Netzwerk-Fehler beim Testen der E-Mail-Konfiguration: ${sendError.message}`,
          details: {
            apiKeyValid: true,
            apiKeyType: "network_error",
            domainsConfigured: false,
            canSendEmails: false,
            sendError: sendError.message,
            troubleshooting: "Überprüfen Sie die Internetverbindung und versuchen Sie es erneut"
          }
        };
      }
      
      return {
        valid: false,
        error: `E-Mail-Versand fehlgeschlagen: ${sendError.message}`,
        details: {
          apiKeyValid: true,
          apiKeyType: "send_failed",
          domainsConfigured: false,
          canSendEmails: false,
          sendError: sendError.message,
          troubleshooting: "Unbekannter Fehler - überprüfen Sie die Resend-Konfiguration"
        }
      };
    }
    
  } catch (error: any) {
    logStep("Email validation failed completely", { error });
    return {
      valid: false,
      error: `E-Mail-Validierung fehlgeschlagen: ${error.message}`,
      details: {
        apiKeyValid: false,
        apiKeyType: "validation_exception",
        domainsConfigured: false,
        canSendEmails: false,
        validationError: error.message,
        troubleshooting: "Vollständige Validierung fehlgeschlagen - überprüfen Sie alle Einstellungen"
      }
    };
  }
};
