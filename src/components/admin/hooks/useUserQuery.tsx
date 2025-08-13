
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { UserWithDetails } from '../types';

export const useUserQuery = (searchQuery: string, shouldFetch: boolean = false) => {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();

  return useQuery({
    queryKey: ['admin-users', searchQuery],
    queryFn: async () => {
      console.log('🔍 useUserQuery: Starting user data fetch');
      
      try {
        // Get all subscribers first with better error handling
        let subscribersQuery = supabase
          .from('subscribers')
          .select(`
            user_id,
            email,
            subscribed,
            subscription_tier,
            subscription_status,
            subscription_end,
            trial_end,
            country,
            last_activity,
            is_manually_activated,
            admin_notes,
            is_test_user,
            current_period_start,
            cancel_at_period_end,
            created_at
          `);

        if (searchQuery.trim()) {
          subscribersQuery = subscribersQuery.ilike('email', `%${searchQuery.trim()}%`);
        }

        const { data: subscribers, error: subscribersError } = await subscribersQuery
          .order('created_at', { ascending: false })
          .limit(100);

        if (subscribersError) {
          console.error('Error fetching subscribers:', subscribersError);
          throw new Error(`${t('adminHooks.userQuery.errors.fetchSubscribersError')}: ${subscribersError.message}`);
        }

        console.log('🔍 useUserQuery: Fetched subscribers:', subscribers?.length || 0);

        // Get all profiles with better error handling
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email, created_at');

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          // Continue without profiles instead of throwing
        }

        console.log('🔍 useUserQuery: Fetched profiles:', profiles?.length || 0);

        // Combine subscribers with profile data
        const usersWithDetails: UserWithDetails[] = [];
        const processedEmails = new Set<string>();
        const processedIds = new Set<string>();

        // Process subscribers first
        if (subscribers && subscribers.length > 0) {
          for (const subscriber of subscribers) {
            if (!subscriber.email || processedEmails.has(subscriber.email)) continue;
            processedEmails.add(subscriber.email);

            // Find matching profile
            const profile = profiles?.find(p => p.email === subscriber.email || p.id === subscriber.user_id);
            
            // Generate unique ID
            let userId = subscriber.user_id;
            if (!userId) {
              // Use email + timestamp for unique fallback ID
              const timestamp = Date.now();
              const emailHash = subscriber.email.split('@')[0]; // Use part before @
              userId = `subscriber_${emailHash}_${timestamp}`;
            }
            
            // Ensure ID is unique
            let uniqueId = userId;
            let counter = 1;
            while (processedIds.has(uniqueId)) {
              uniqueId = `${userId}_${counter}`;
              counter++;
            }
            processedIds.add(uniqueId);
            
            const userWithDetails: UserWithDetails = {
              id: uniqueId,
              email: subscriber.email,
              created_at: profile?.created_at || subscriber.created_at,
              subscription: {
                subscribed: subscriber.subscribed,
                subscription_tier: subscriber.subscription_tier,
                subscription_status: subscriber.subscription_status,
                subscription_end: subscriber.subscription_end,
                trial_end: subscriber.trial_end,
                country: subscriber.country,
                last_activity: subscriber.last_activity,
                is_manually_activated: subscriber.is_manually_activated,
                admin_notes: subscriber.admin_notes,
                is_test_user: subscriber.is_test_user,
                current_period_start: subscriber.current_period_start,
                cancel_at_period_end: subscriber.cancel_at_period_end
              }
            };

            usersWithDetails.push(userWithDetails);
          }
        }

        // Add profiles that don't have subscribers (only if we have profiles)
        if (profiles && profiles.length > 0) {
          for (const profile of profiles) {
            if (!profile.email || processedEmails.has(profile.email)) continue;
            
            // Apply search filter for profiles without subscribers
            if (searchQuery.trim() && !profile.email.toLowerCase().includes(searchQuery.trim().toLowerCase())) {
              continue;
            }

            processedEmails.add(profile.email);

            // Ensure profile ID is unique
            let uniqueId = profile.id;
            let counter = 1;
            while (processedIds.has(uniqueId)) {
              uniqueId = `${profile.id}_${counter}`;
              counter++;
            }
            processedIds.add(uniqueId);

            const userWithDetails: UserWithDetails = {
              id: uniqueId,
              email: profile.email,
              created_at: profile.created_at,
              subscription: null
            };

            usersWithDetails.push(userWithDetails);
          }
        }

        // Sort by created_at descending, with null safety
        usersWithDetails.sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        });

        console.log('🔍 useUserQuery: Returning combined users:', usersWithDetails.length);
        return usersWithDetails;

      } catch (error) {
        console.error('Error in useUserQuery:', error);
        throw error;
      }
    },
    enabled: !!user && !authLoading && shouldFetch, // Only run when user is authenticated, auth is not loading, and shouldFetch is true
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    staleTime: 30000, // Cache for 30 seconds
    gcTime: 300000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });
};
