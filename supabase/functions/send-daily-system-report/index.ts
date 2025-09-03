
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

// Generate system report content based on language
const generateSystemReportContent = (tests: any[], timestamp: string, language: string = 'de') => {
  const reportDate = new Date(timestamp).toLocaleDateString(language === 'en' ? 'en-US' : 'de-DE');
  const reportTime = new Date(timestamp).toLocaleTimeString(language === 'en' ? 'en-US' : 'de-DE');
  
  const passedTests = tests.filter((t: any) => t.status === 'pass');
  const failedTests = tests.filter((t: any) => t.status === 'fail');
  const warningTests = tests.filter((t: any) => t.status === 'warning');
  
  const overallStatus = failedTests.length > 0 ? 'CRITICAL' : 
                       warningTests.length > 0 ? 'WARNING' : 'HEALTHY';
  
  const statusColor = overallStatus === 'CRITICAL' ? '#ef4444' : 
                     overallStatus === 'WARNING' ? '#f59e0b' : '#22c55e';

  const content = language === 'en' ? {
    title: '🔧 TierTrainer24 System Report',
    status: 'Status:',
    summary: '📊 Summary',
    successful: 'Successful',
    warnings: 'Warnings',
    failed: 'Failed',
    total: 'Total',
    testDetails: '🧪 Test Details',
    test: 'Test',
    status: 'Status',
    result: 'Result',
    duration: 'Duration',
    passed: 'PASSED',
    failed: 'FAILED',
    warning: 'WARNING',
    noIssues: '✅ All systems operational',
    minorIssues: '⚠️ Minor issues detected',
    criticalIssues: '🚨 Critical issues detected',
    footer: 'This is an automated system report. Please contact support if you have questions.'
  } : {
    title: '🔧 TierTrainer24 System Report',
    status: 'Status:',
    summary: '📊 Zusammenfassung',
    successful: 'Erfolgreich',
    warnings: 'Warnungen',
    failed: 'Fehlgeschlagen',
    total: 'Gesamt',
    testDetails: '🧪 Test Details',
    test: 'Test',
    status: 'Status',
    result: 'Ergebnis',
    duration: 'Dauer',
    passed: 'ERFOLGREICH',
    failed: 'FEHLGESCHLAGEN',
    warning: 'WARNUNG',
    noIssues: '✅ Alle Systeme funktionieren',
    minorIssues: '⚠️ Kleinere Probleme erkannt',
    criticalIssues: '🚨 Kritische Probleme erkannt',
    footer: 'Dies ist ein automatisierter Systembericht. Bitte kontaktieren Sie den Support bei Fragen.'
  };

  const statusMessage = overallStatus === 'HEALTHY' ? content.noIssues :
                       overallStatus === 'WARNING' ? content.minorIssues :
                       content.criticalIssues;

  return {
    overallStatus,
    statusColor,
    statusMessage,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="background: ${statusColor}; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 24px;">${content.title}</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">${content.status} ${overallStatus}</p>
          <p style="margin: 5px 0 0 0; font-size: 14px;">${reportDate} ${language === 'en' ? 'at' : 'um'} ${reportTime}</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="margin: 0 0 15px 0; color: #333;">${content.summary}</h2>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; text-align: center;">
            <div style="background: white; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb;">
              <div style="font-size: 24px; font-weight: bold; color: #22c55e;">${passedTests.length}</div>
              <div style="font-size: 12px; color: #666;">${content.successful}</div>
            </div>
            <div style="background: white; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb;">
              <div style="font-size: 24px; font-weight: bold; color: #f59e0b;">${warningTests.length}</div>
              <div style="font-size: 12px; color: #666;">${content.warnings}</div>
            </div>
            <div style="background: white; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb;">
              <div style="font-size: 24px; font-weight: bold; color: #ef4444;">${failedTests.length}</div>
              <div style="font-size: 12px; color: #666;">${content.failed}</div>
            </div>
            <div style="background: white; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb;">
              <div style="font-size: 24px; font-weight: bold; color: #3b82f6;">${tests.length}</div>
              <div style="font-size: 12px; color: #666;">${content.total}</div>
            </div>
          </div>
        </div>

        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
          <div style="background: #f8f9fa; padding: 15px; border-bottom: 1px solid #e5e7eb;">
            <h2 style="margin: 0; color: #333;">${content.testDetails}</h2>
          </div>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f8f9fa;">
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb;">${content.test}</th>
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb;">${content.status}</th>
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb;">${content.result}</th>
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb;">${content.duration}</th>
              </tr>
            </thead>
            <tbody>
              ${tests.map((test: any) => {
                const statusColor = test.status === 'pass' ? '#22c55e' : 
                                   test.status === 'warning' ? '#f59e0b' : '#ef4444';
                const statusText = test.status === 'pass' ? content.passed :
                                  test.status === 'warning' ? content.warning :
                                  content.failed;
                return `
                  <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${test.name}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
                      <span style="color: ${statusColor}; font-weight: bold;">${statusText}</span>
                    </td>
                    <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${test.result || '-'}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${test.duration || '-'}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #0ea5e9;">
          <h3 style="margin: 0 0 10px 0; color: #0c4a6e;">${statusMessage}</h3>
          <p style="margin: 0; color: #0c4a6e; font-size: 14px;">${content.footer}</p>
        </div>
      </div>
    `
  };
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
    const { tests, timestamp, language = 'de' } = requestBody;
    
    logStep("Processing daily report", { testsCount: tests?.length, timestamp, language });

    // Generate HTML report with language support
    const reportContent = generateSystemReportContent(tests, timestamp, language);

    const html = reportContent.html;

    // Send email
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: ["admin@tiertrainer24.com"], // Admin email for system reports
      subject: `🔧 TierTrainer24 System Report - ${reportContent.overallStatus} - ${new Date(timestamp).toLocaleDateString()}`,
      html: html,
    });

    if (error) {
      logStep("Resend error", { error });
      throw new Error(`Failed to send email: ${error.message}`);
    }

    logStep("System report email sent successfully", { 
      emailId: data?.id, 
      status: reportContent.overallStatus,
      language: language
    });

    return new Response(JSON.stringify({
      success: true,
      emailId: data?.id,
      status: reportContent.overallStatus,
      language: language,
      message: `System report sent successfully with status: ${reportContent.overallStatus}`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in daily system report", { message: errorMessage, stack: error?.stack });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      code: "INTERNAL_ERROR"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
