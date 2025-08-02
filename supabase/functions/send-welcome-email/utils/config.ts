
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { logStep } from "./logger.ts";

export interface EmailConfig {
  testMode: boolean;
  allowedTestEmail: string;
  dashboardUrl: string;
}

export const getEmailConfig = async (supabaseClient: any): Promise<EmailConfig> => {
  let testMode = true; // Default to test mode for safety
  
  try {
    const { data: configData, error: configError } = await supabaseClient
      .from('system_notifications')
      .select('message')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .eq('type', 'email_config')
      .single();

    if (configError) {
      logStep("No config found, using test mode", { error: configError.message });
    } else if (configData?.message) {
      try {
        const config = JSON.parse(configData.message);
        testMode = config.testMode !== false; // Explicit check for false
        logStep("Email config loaded", { testMode });
      } catch (e) {
        logStep("Error parsing config, using test mode", { error: e.message });
      }
    } else {
      logStep("No config found, using test mode");
    }
  } catch (configError) {
    logStep("Config fetch failed, using test mode", { error: configError });
  }

  return {
    testMode,
    allowedTestEmail: "owydwaldt12@gmail.com",
    dashboardUrl: "https://tiertrainer24.com/dashboard"
  };
};

export const validateEnvironment = () => {
  const resendKey = Deno.env.get("RESEND_API_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  logStep("Environment check", { 
    hasResendKey: !!resendKey, 
    hasSupabaseUrl: !!supabaseUrl,
    hasSupabaseKey: !!supabaseKey 
  });

  if (!resendKey) throw new Error("RESEND_API_KEY ist nicht konfiguriert");
  if (!supabaseUrl) throw new Error("SUPABASE_URL ist nicht konfiguriert");
  if (!supabaseKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY ist nicht konfiguriert");

  return { resendKey, supabaseUrl, supabaseKey };
};
