
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export const createSupabaseAdmin = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
}

export const authenticateAdmin = async (authHeader: string | null) => {
  if (!authHeader) {
    throw new Error('No authorization header provided')
  }

  console.log('Verifying admin authentication...')
  const supabaseAdmin = createSupabaseAdmin()
  
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
    authHeader.replace('Bearer ', '')
  )

  if (authError) {
    throw new Error(`Authentication failed: ${authError.message}`)
  }

  if (!user) {
    throw new Error('Invalid authentication - no user found')
  }

  console.log('Checking admin privileges for user:', user.id)
  
  // Check if user is admin
  const { data: adminUser, error: adminCheckError } = await supabaseAdmin
    .from('admin_users')
    .select('role')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  if (adminCheckError) {
    throw new Error(`Admin verification failed: ${adminCheckError.message}`)
  }

  if (!adminUser) {
    throw new Error('Unauthorized: Not an admin or admin is inactive')
  }

  return { user, supabaseAdmin }
}
