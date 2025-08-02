
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

// Track if we've already logged the admin page message for this session
let hasLoggedAdminPageDisable = false;

// Track analytics connection status to prevent repeated failed requests
let analyticsConnectionFailed = false;

export const useAnalytics = () => {
  const { user } = useAuth();

  const trackEvent = async (
    eventType: 'page_view' | 'chat_started' | 'subscription_created' | 'trial_started' | 'auth_required_for_chat' | 'performance_lcp' | 'performance_cls' | 'performance_fid' | 'performance_ttfb' | 'performance_load_time',
    metadata?: Record<string, any>
  ) => {
    try {
      // CRITICAL: Completely disable analytics on admin pages to prevent database flooding
      const currentPath = window.location.pathname;
      if (currentPath.includes('/admin')) {
        return; // Exit immediately, no logging needed
      }

      // Skip if no user or in development
      if (!user || window.location.hostname === 'localhost') {
        return;
      }

      // Skip if analytics connection has previously failed to prevent repeated errors
      if (analyticsConnectionFailed) {
        return;
      }

      // Only track on production with valid user
      const { error } = await supabase.from('analytics_events').insert({
        user_id: user.id,
        event_type: eventType,
        page_path: currentPath,
        metadata: metadata || {}
      });

      // Log error but don't throw to prevent app crashes
      if (error) {
        console.warn('Analytics tracking error:', error);
        analyticsConnectionFailed = true; // Mark as failed to prevent repeated attempts
        return;
      }
    } catch (error) {
      // Silently ignore all analytics errors to prevent app crashes
      console.warn('Analytics tracking failed:', error);
      analyticsConnectionFailed = true; // Mark as failed to prevent repeated attempts
      return;
    }
  };

  return { trackEvent };
};
