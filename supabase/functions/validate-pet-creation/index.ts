import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VALIDATE-PET-CREATION] ${step}${detailsStr}`);
};

interface PetCreationRequest {
  userId: string;
  petData: {
    name: string;
    species: string;
    breed?: string;
    age?: number;
    birth_date?: string;
    behavior_focus?: string;
    notes?: string;
  };
}

interface ValidationResult {
  canCreate: boolean;
  reason?: string;
  currentPetCount: number;
  maxPetsAllowed: number;
  subscriptionTier: string;
}

const getPetLimit = (subscriptionTier?: string, subscribed?: boolean, tierLimit?: number): number => {
  // Free tier gets 1 pet
  if (!subscribed || !subscriptionTier) return 1;
  
  // Use tier_limit from database if available (new 5-plan structure)
  if (tierLimit && tierLimit > 0) {
    return tierLimit;
  }
  
  // Fallback to subscription tier mapping for backward compatibility
  switch (subscriptionTier) {
    case 'plan1':
      return 1;
    case 'plan2':
      return 2;
    case 'plan3':
      return 4;
    case 'plan4':
      return 8;
    case 'plan5':
      return 999; // Unlimited
    case '1-tier':
      return 1;
    case '2-tier':
      return 2;
    case '3-4-tier':
      return 4;
    case '5-8-tier':
      return 8;
    case 'unlimited-tier':
      return 999; // Unlimited
    default:
      // For any legacy tiers, default to 2 for active subscribers
      return subscribed ? 2 : 1;
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Starting pet creation validation');

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !serviceRoleKey) {
      logStep('Missing environment variables', { 
        hasSupabaseUrl: !!supabaseUrl, 
        hasServiceRoleKey: !!serviceRoleKey 
      });
      return new Response(
        JSON.stringify({ 
          error: 'Missing required environment variables',
          success: false 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Parse request body
    const requestBody: PetCreationRequest = await req.json();
    const { userId, petData } = requestBody;

    if (!userId || !petData) {
      logStep('Invalid request body', { userId: !!userId, petData: !!petData });
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request body - missing userId or petData',
          success: false 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    logStep('Validating pet creation for user', { userId, petName: petData.name });

    // Get current pet count for user
    const { data: currentPets, error: petsError } = await supabase
      .from('pet_profiles')
      .select('id')
      .eq('user_id', userId);

    if (petsError) {
      logStep('Error fetching current pets', { error: petsError });
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch current pet count',
          success: false 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const currentPetCount = currentPets?.length || 0;
    logStep('Current pet count', { currentPetCount });

    // Get user's subscription information
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscribers')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (subscriptionError && subscriptionError.code !== 'PGRST116') {
      logStep('Error fetching subscription', { error: subscriptionError });
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch subscription information',
          success: false 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if subscription is active (considering the new system without subscription_status)
    const isActiveSubscriber = subscription?.subscribed === true;
    const subscriptionTier = subscription?.subscription_tier || 'free';
    const tierLimit = subscription?.tier_limit;

    logStep('Subscription info', { 
      isActiveSubscriber, 
      subscriptionTier, 
      tierLimit,
      hasSubscription: !!subscription
    });

    // Calculate pet limit
    const maxPetsAllowed = getPetLimit(subscriptionTier, isActiveSubscriber, tierLimit);
    const canCreate = currentPetCount < maxPetsAllowed;

    logStep('Validation result', { 
      currentPetCount, 
      maxPetsAllowed, 
      canCreate 
    });

    // Prepare response
    const validationResult: ValidationResult = {
      canCreate,
      currentPetCount,
      maxPetsAllowed,
      subscriptionTier: subscriptionTier === 'free' ? 'free' : subscriptionTier
    };

    if (!canCreate) {
      validationResult.reason = `Pet limit exceeded. Current: ${currentPetCount}, Maximum: ${maxPetsAllowed}`;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        validation: validationResult
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep('Error in pet creation validation', { 
      error: errorMessage 
    });
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
