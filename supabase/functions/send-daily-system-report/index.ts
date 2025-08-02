
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Standardized email sender - using consistent verified domain
const EMAIL_FROM = "TierTrainer24 System <noreply@mail.tiertrainer24.com>";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[DAILY-SYSTEM-REPORT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Daily system report function started");

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      logStep("RESEND_API_KEY missing");
      throw new Error("RESEND_API_KEY ist nicht konfiguriert");
    }

    logStep("RESEND_API_KEY found", { 
      keyExists: !!resendKey, 
      keyLength: resendKey.length,
      keyPrefix: resendKey.substring(0, 8) + "..."
    });

    const resend = new Resend(resendKey);
    
    const requestBody = await req.json();
    const { tests, timestamp } = requestBody;
    
    logStep("Processing daily report", { testsCount: tests?.length, timestamp });

    // Generate HTML report
    const reportDate = new Date(timestamp).toLocaleDateString('de-DE');
    const reportTime = new Date(timestamp).toLocaleTimeString('de-DE');
    
    const passedTests = tests.filter((t: any) => t.status === 'pass');
    const failedTests = tests.filter((t: any) => t.status === 'fail');
    const warningTests = tests.filter((t: any) => t.status === 'warning');
    
    const overallStatus = failedTests.length > 0 ? 'CRITICAL' : 
                         warningTests.length > 0 ? 'WARNING' : 'HEALTHY';
    
    const statusColor = overallStatus === 'CRITICAL' ? '#ef4444' : 
                       overallStatus === 'WARNING' ? '#f59e0b' : '#22c55e';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="background: ${statusColor}; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 24px;">🔧 TierTrainer24 System Report</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Status: ${overallStatus}</p>
          <p style="margin: 5px 0 0 0; font-size: 14px;">${reportDate} um ${reportTime}</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="margin: 0 0 15px 0; color: #333;">📊 Zusammenfassung</h2>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; text-align: center;">
            <div style="background: white; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb;">
              <div style="font-size: 24px; font-weight: bold; color: #22c55e;">${passedTests.length}</div>
              <div style="font-size: 12px; color: #666;">Erfolgreich</div>
            </div>
            <div style="background: white; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb;">
              <div style="font-size: 24px; font-weight: bold; color: #f59e0b;">${warningTests.length}</div>
              <div style="font-size: 12px; color: #666;">Warnungen</div>
            </div>
            <div style="background: white; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb;">
              <div style="font-size: 24px; font-weight: bold; color: #ef4444;">${failedTests.length}</div>
              <div style="font-size: 12px; color: #666;">Fehlgeschlagen</div>
            </div>
            <div style="background: white; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb;">
              <div style="font-size: 24px; font-weight: bold; color: #3b82f6;">${tests.length}</div>
              <div style="font-size: 12px; color: #666;">Gesamt</div>
            </div>
          </div>
        </div>

        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
          <div style="background: #f8f9fa; padding: 15px; border-bottom: 1px solid #e5e7eb;">
            <h2 style="margin: 0; color: #333;">🧪 Test Details</h2>
          </div>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f8f9fa;">
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb;">Test</th>
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb;">Status</th>
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb;">Ergebnis</th>
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb;">Dauer</th>
              </tr>
            </thead>
            <tbody>
              ${tests.map((test: any) => {
                const statusIcon = test.status === 'pass' ? '✅' : 
                                 test.status === 'fail' ? '❌' : 
                                 test.status === 'warning' ? '⚠️' : '⏱️';
                const statusColor = test.status === 'pass' ? '#22c55e' : 
                                  test.status === 'fail' ? '#ef4444' : 
                                  test.status === 'warning' ? '#f59e0b' : '#6b7280';
                
                return `
                  <tr style="border-bottom: 1px solid #f3f4f6;">
                    <td style="padding: 12px; font-weight: 500;">${test.name}</td>
                    <td style="padding: 12px;">
                      <span style="color: ${statusColor};">${statusIcon} ${test.status.toUpperCase()}</span>
                    </td>
                    <td style="padding: 12px; font-size: 13px; color: #666;">${test.message}</td>
                    <td style="padding: 12px; font-size: 13px; color: #666;">${test.duration ? test.duration + 'ms' : '-'}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        ${failedTests.length > 0 ? `
          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin-top: 20px;">
            <h3 style="margin: 0 0 10px 0; color: #dc2626;">⚠️ Sofortige Aufmerksamkeit erforderlich</h3>
            <p style="margin: 0; color: #7f1d1d; font-size: 14px;">
              ${failedTests.length} Test(s) sind fehlgeschlagen. Bitte überprüfen Sie das System umgehend.
            </p>
          </div>
        ` : ''}

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="margin: 0; color: #6b7280; font-size: 12px;">
            Automatisch generiert von TierTrainer24 System Monitor<br>
            ${new Date().toLocaleString('de-DE')}
          </p>
        </div>
      </div>
    `;

    const subject = `🔧 TierTrainer24 System Report - ${overallStatus} (${reportDate})`;

    logStep("Sending daily report email", { 
      subject, 
      overallStatus,
      testsCount: tests.length,
      failedCount: failedTests.length,
      fromAddress: EMAIL_FROM
    });

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: ["ow@cooper-ads.com"],
      cc: ["gl@cooper-ads.com"],
      subject,
      html,
    });

    if (error) {
      logStep("Resend error", { error });
      
      // Enhanced error handling
      if (error.message?.includes('API key is invalid') || error.message?.includes('Invalid API key')) {
        throw new Error(`Invalid API key: ${error.message}. Please check RESEND_API_KEY in Supabase Edge Function Secrets.`);
      }
      
      if (error.message?.includes('domain') || error.message?.includes('verified')) {
        throw new Error(`Domain not verified: ${error.message}. Please verify mail.tiertrainer24.com in Resend dashboard.`);
      }
      
      throw new Error(`Failed to send email: ${error.message}`);
    }

    logStep("Daily report sent successfully", { 
      emailId: data?.id,
      fromAddress: EMAIL_FROM
    });

    return new Response(JSON.stringify({
      success: true,
      emailId: data?.id,
      overallStatus,
      testsProcessed: tests.length,
      fromAddress: EMAIL_FROM,
      message: "Daily system report sent successfully with standardized domain"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in send-daily-system-report", { message: errorMessage });
    return new Response(JSON.stringify({ 
      error: errorMessage,
      troubleshooting: errorMessage.includes('domain') ? 
        "Verify mail.tiertrainer24.com in Resend dashboard" :
        errorMessage.includes('API key') ?
        "Check RESEND_API_KEY in Supabase Edge Function Secrets" :
        "Check network connectivity and configuration"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
