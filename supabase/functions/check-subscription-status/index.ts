import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION-STATUS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Starting subscription status check function');

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

    // Get current timestamp
    const now = new Date();
    logStep('Checking subscriptions at', { timestamp: now.toISOString() });

    // Find all active subscriptions that have expired
    const { data: expiredSubscriptions, error: queryError } = await supabase
      .from('subscribers')
      .select('id, user_id, email, subscription_tier, current_period_end, subscribed')
      .gte('current_period_end', '1970-01-01') // Ensure we have a valid date
      .lt('current_period_end', now.toISOString())
      .eq('subscribed', true);

    if (queryError) {
      logStep('Error querying expired subscriptions', { error: queryError });
      return new Response(
        JSON.stringify({ 
          error: 'Failed to query expired subscriptions',
          success: false 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    logStep('Found expired subscriptions', { count: expiredSubscriptions?.length || 0 });

    if (expiredSubscriptions && expiredSubscriptions.length > 0) {
      // Update expired subscriptions to inactive
      const { error: updateError } = await supabase
        .from('subscribers')
        .update({
          subscribed: false,
          updated_at: now.toISOString(),
          admin_notes: `Subscription expired on ${now.toISOString()} - automatically deactivated`
        })
        .in('id', expiredSubscriptions.map(s => s.id));

      if (updateError) {
        logStep('Error updating expired subscriptions', { error: updateError });
        return new Response(
          JSON.stringify({ 
            error: 'Failed to update expired subscriptions',
            success: false 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      logStep('Successfully updated expired subscriptions', { 
        count: expiredSubscriptions.length,
        emails: expiredSubscriptions.map(s => s.email)
      });
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Subscription status check completed',
        expiredSubscriptionsCount: expiredSubscriptions?.length || 0,
        checkedAt: now.toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep('Error in subscription status check function', { 
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
