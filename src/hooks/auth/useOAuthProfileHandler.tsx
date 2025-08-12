
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export const useOAuthProfileHandler = () => {
  const handleOAuthProfile = useCallback(async (user: User) => {
    // Skip if no user metadata or if user doesn't have OAuth data
    if (!user?.user_metadata || !user.app_metadata?.provider) {
      return;
    }

    const metadata = user.user_metadata;
    const provider = user.app_metadata.provider;
    
    // Only process for OAuth providers (google, github, etc.)
    if (!['google', 'github'].includes(provider)) {
      return;
    }

    // Check if we have name information to process
    const hasNameData = metadata.full_name || metadata.given_name || metadata.family_name || metadata.name;
    
    if (!hasNameData) {
      return;
    }

    // Use a more robust timeout and error handling
    setTimeout(async () => {
      try {
        // First check if profile exists
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          // PGRST116 is "not found" error, which is expected for new users
          console.warn('Error checking profile:', profileError);
          return;
        }

        const profileUpdates: any = {};
        
        // Extract name information from different OAuth providers
        if (metadata.given_name) {
          profileUpdates.first_name = metadata.given_name;
        }
        if (metadata.family_name) {
          profileUpdates.last_name = metadata.family_name;
        }
        
        // Fallback for providers that only provide full_name or name
        if (!profileUpdates.first_name && (metadata.full_name || metadata.name)) {
          const fullName = metadata.full_name || metadata.name;
          const nameParts = fullName.split(' ').filter(part => part.trim().length > 0);
          if (nameParts.length > 0) {
            profileUpdates.first_name = nameParts[0];
            if (nameParts.length > 1) {
              profileUpdates.last_name = nameParts.slice(1).join(' ');
            }
          }
        }
        
        // Only proceed if we have name data to update
        if (Object.keys(profileUpdates).length === 0) {
          return;
        }

        if (existingProfile) {
          // Update existing profile only if fields are empty or different
          const fieldsToUpdate: any = {};
          
          if ((!existingProfile.first_name || existingProfile.first_name.trim() === '') && profileUpdates.first_name) {
            fieldsToUpdate.first_name = profileUpdates.first_name;
          }
          if ((!existingProfile.last_name || existingProfile.last_name.trim() === '') && profileUpdates.last_name) {
            fieldsToUpdate.last_name = profileUpdates.last_name;
          }
          
          // Also update email if it's missing or different
          if (user.email && (!existingProfile.email || existingProfile.email !== user.email)) {
            fieldsToUpdate.email = user.email;
          }
          
          if (Object.keys(fieldsToUpdate).length > 0) {
            const { error: updateError } = await supabase
              .from('profiles')
              .update({
                ...fieldsToUpdate,
                updated_at: new Date().toISOString()
              })
              .eq('id', user.id);
            
            if (updateError) {
              console.warn('Error updating OAuth profile:', updateError);
            }
          }
        } else {
          // Create profile if it doesn't exist - this is a new user
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email || '',
              first_name: profileUpdates.first_name || null,
              last_name: profileUpdates.last_name || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          
          if (insertError) {
            console.warn('Error creating OAuth profile:', insertError);
          } else {
            // Set localStorage to indicate user has signed up (new OAuth user)
            localStorage.setItem('alreadySignedUp', 'true');
          }
        }

        // Also ensure subscriber record exists for OAuth users
        try {
          const { error: subscriberError } = await supabase
            .from('subscribers')
            .upsert({
              email: user.email || '',
              user_id: user.id,
              stripe_customer_id: null,
              subscribed: false,
              subscription_status: 'inactive',
              subscription_tier: null,
              tier_limit: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }, { onConflict: 'email' });
          
          if (subscriberError) {
            console.warn('Error upserting subscriber for OAuth user:', subscriberError);
          }
        } catch (subscriberError) {
          console.warn('Error handling subscriber record for OAuth user:', subscriberError);
        }

      } catch (error) {
        console.warn('Error processing OAuth profile data:', error);
      }
    }, 1000); // Increased delay to ensure session is fully established
  }, []); // Empty dependency array since this function doesn't depend on any props or state

  return { handleOAuthProfile };
};
