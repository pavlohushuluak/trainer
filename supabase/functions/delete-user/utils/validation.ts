
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

export const validateUserExists = async (supabaseAdmin: SupabaseClient, userId: string) => {
  console.log('Validating user exists...')
  
  const { data: profileExists } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single()

  const { data: subscriberExists } = await supabaseAdmin
    .from('subscribers')
    .select('user_id, email, stripe_customer_id')
    .eq('user_id', userId)
    .single()

  if (!profileExists && !subscriberExists) {
    throw new Error('User not found')
  }

  console.log('User found, proceeding with deletion...')
  return subscriberExists
}
