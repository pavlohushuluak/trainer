
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

export const deleteUserData = async (supabaseAdmin: SupabaseClient, userId: string) => {
  console.log('Deleting user data from all tables')
  
  // Delete from subscribers table
  const { error: subscribersError } = await supabaseAdmin
    .from('subscribers')
    .delete()
    .eq('user_id', userId)
    
  if (subscribersError) {
    console.error('Error deleting from subscribers table')
  } else {
    console.log('Deleted from subscribers table')
  }

  // Delete from other user-related tables
  const tables = [
    'chat_sessions',
    'training_plans', 
    'training_steps',
    'pet_profiles',
    'support_tickets',
    'support_messages',
    'invoices'
  ]

  for (const table of tables) {
    try {
      const { error } = await supabaseAdmin
        .from(table)
        .delete()
        .eq('user_id', userId)
      
      if (error && !error.message.includes('does not exist')) {
        console.error(`Error deleting from table`)
      } else {
        console.log(`Deleted from ${table} table`)
      }
    } catch (err) {
      console.error(`Error deleting from table`)
    }
  }
}

export const deleteUserProfile = async (supabaseAdmin: SupabaseClient, userId: string) => {
  console.log('Deleting user profile')
  
  const { error } = await supabaseAdmin
    .from('profiles')
    .delete()
    .eq('id', userId)
    
  if (error) {
    console.error('Error deleting profile')
  } else {
    console.log('Profile deleted successfully')
  }
}

export const deleteUserAuth = async (supabaseAdmin: SupabaseClient, userId: string) => {
  console.log('Deleting user from auth')
  
  try {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
    
    if (error) {
      console.error('Error deleting user from auth')
    } else {
      console.log('User deleted from auth successfully')
    }
  } catch (authError) {
    console.error('Auth deletion failed')
  }
}

export const logAdminAction = async (
  supabaseAdmin: SupabaseClient, 
  adminId: string, 
  targetUserId: string, 
  stripeDeleted: boolean,
  refundInfo?: { refunded: boolean; refundAmount: number }
) => {
  console.log('Logging admin action')
  
  const details: any = { stripe_deleted: stripeDeleted }
  
  if (refundInfo) {
    details.refunded = refundInfo.refunded
    details.refund_amount = refundInfo.refundAmount
  }
  
  const { error } = await supabaseAdmin
    .from('admin_activity_log')
    .insert({
      admin_id: adminId,
      action: 'user_deleted',
      target_user_id: targetUserId,
      details
    })
    
  if (error) {
    console.error('Error logging admin action')
  } else {
    console.log('Admin action logged successfully')
  }
}
