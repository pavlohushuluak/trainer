
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { authenticateAdmin } from './utils/auth.ts'
import { cancelStripeSubscriptions } from './utils/stripe.ts'
import { deleteUserData, deleteUserProfile, deleteUserAuth, logAdminAction } from './utils/database.ts'
import { validateUserExists } from './utils/validation.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Delete user function called')
    
    // Authenticate admin user
    const authHeader = req.headers.get('Authorization')
    const { user: admin, supabaseAdmin } = await authenticateAdmin(authHeader)

    // Parse request body
    let requestBody
    try {
      requestBody = await req.json()
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    const { userId } = requestBody
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(userId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid User ID format' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    console.log('Starting deletion process')

    // Validate user exists and get subscriber data
    const subscriberData = await validateUserExists(supabaseAdmin, userId)

    // Cancel Stripe subscriptions and handle refunds if user has subscription data
    const stripeResult = subscriberData?.email 
      ? await cancelStripeSubscriptions(subscriberData.email)
      : { cancelled: false, refunded: false, refundAmount: 0 }

    // Delete all user data from database
    await deleteUserData(supabaseAdmin, userId)

    // Delete user profile if it exists
    await deleteUserProfile(supabaseAdmin, userId)

    // Delete from Auth (might fail if user doesn't exist in auth)
    await deleteUserAuth(supabaseAdmin, userId)

    // Log the admin action with refund information
    await logAdminAction(supabaseAdmin, admin.id, userId, stripeResult.cancelled, {
      refunded: stripeResult.refunded,
      refundAmount: stripeResult.refundAmount
    })

    console.log('User successfully deleted:', userId)
    if (stripeResult.refunded) {
      console.log(`Refund issued: €${(stripeResult.refundAmount / 100).toFixed(2)}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User deleted successfully',
        refunded: stripeResult.refunded,
        refundAmount: stripeResult.refundAmount
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Unexpected error in delete user function')
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
