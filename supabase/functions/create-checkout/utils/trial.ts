
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { logStep } from "./logger.ts";

export const checkTrialStatus = async (
  supabaseClient: ReturnType<typeof createClient>,
  userEmail: string
): Promise<boolean> => {
  const { data: subscriber } = await supabaseClient
    .from("subscribers")
    .select("trial_used")
    .eq("email", userEmail)
    .single();

  const hasUsedTrial = subscriber?.trial_used || false;
  logStep("Trial status checked", { email: userEmail, hasUsedTrial });
  return hasUsedTrial;
};

export const markTrialAsUsed = async (
  supabaseClient: ReturnType<typeof createClient>,
  userEmail: string,
  userId: string
): Promise<void> => {
  // Only mark trial as used if a trial period is actually being applied
  await supabaseClient.from("subscribers").upsert({
    email: userEmail,
    user_id: userId,
    trial_used: true,
    trial_start: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }, { onConflict: 'email' });
  
  logStep("Trial marked as used", { email: userEmail, userId });
};

// Neue Funktion: Trial-Status zurücksetzen
export const resetTrialStatus = async (
  supabaseClient: ReturnType<typeof createClient>,
  userEmail: string
): Promise<void> => {
  await supabaseClient
    .from("subscribers")
    .update({
      trial_used: false,
      trial_start: null,
      updated_at: new Date().toISOString(),
    })
    .eq("email", userEmail);
  
  logStep("Trial status reset", { email: userEmail });
};

// Neue Funktion: Spezielle Trial-Periode gewähren
export const grantSpecialTrial = async (
  supabaseClient: ReturnType<typeof createClient>,
  userEmail: string,
  trialDays: number = 7
): Promise<void> => {
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + trialDays);
  
  await supabaseClient
    .from("subscribers")
    .update({
      trial_used: false,
      trial_end: trialEnd.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("email", userEmail);
  
  logStep("Special trial granted", { email: userEmail, trialDays, trialEnd: trialEnd.toISOString() });
};

// Neue Funktion: Erweiterte Trial-Status-Prüfung
export const getEnhancedTrialStatus = async (
  supabaseClient: ReturnType<typeof createClient>,
  userEmail: string
): Promise<{
  hasUsedTrial: boolean;
  isEligibleForTrial: boolean;
  specialTrialEnd?: string;
  trialDaysRemaining?: number;
}> => {
  const { data: subscriber } = await supabaseClient
    .from("subscribers")
    .select("trial_used, trial_end")
    .eq("email", userEmail)
    .single();

  const hasUsedTrial = subscriber?.trial_used || false;
  const specialTrialEnd = subscriber?.trial_end;
  
  let isEligibleForTrial = !hasUsedTrial;
  let trialDaysRemaining = 0;
  
  // Prüfe ob spezielle Trial-Periode noch aktiv ist
  if (specialTrialEnd) {
    const trialEndDate = new Date(specialTrialEnd);
    const now = new Date();
    
    if (trialEndDate > now) {
      isEligibleForTrial = true;
      trialDaysRemaining = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }
  }
  
  logStep("Enhanced trial status checked", { 
    email: userEmail, 
    hasUsedTrial, 
    isEligibleForTrial, 
    trialDaysRemaining 
  });
  
  return {
    hasUsedTrial,
    isEligibleForTrial,
    specialTrialEnd,
    trialDaysRemaining
  };
};
