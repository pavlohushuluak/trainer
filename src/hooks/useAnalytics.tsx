
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

// Track if we've already logged the admin page message for this session
let hasLoggedAdminPageDisable = false;

// Track analytics connection status to prevent repeated failed requests
let analyticsConnectionFailed = false;

export const useAnalytics = () => {
  const { user } = useAuth();

  const trackEvent = async (
    eventType: 'page_view' | 'homepage_view' | 'mainpage_view' | 'chat_started' | 'subscription_created' | 'trial_started' | 'auth_required_for_chat' | 'performance_lcp' | 'performance_cls' | 'performance_fid' | 'performance_ttfb' | 'performance_load_time',
    metadata?: Record<string, any>
  ) => {
    try {
      // CRITICAL: Completely disable analytics on admin pages to prevent database flooding
      const currentPath = window.location.pathname;
      if (currentPath.includes('/admin')) {
        console.log('🚫 Analytics disabled on admin page:', currentPath);
        return; // Exit immediately, no logging needed
      }

      // Skip if analytics connection has previously failed to prevent repeated errors
      if (analyticsConnectionFailed) {
        console.log('🚫 Analytics connection failed, skipping tracking');
        return;
      }

      // Get user email for tracking
      const userEmail = user?.email || null;
      const isDevelopment = window.location.hostname === 'localhost';

      console.log('📊 Analytics tracking:', {
        eventType,
        currentPath,
        userEmail,
        isDevelopment,
        metadata
      });

      // Use the new track_page_view function for page view events
      if (['page_view', 'homepage_view', 'mainpage_view'].includes(eventType)) {
        const { data, error } = await supabase.rpc('track_page_view', {
          p_page_path: currentPath,
          p_user_email: userEmail
        });

        if (error) {
          console.error('❌ Analytics tracking error:', error);
          analyticsConnectionFailed = true;
          return;
        }

        console.log('✅ Analytics tracking successful:', {
          eventType,
          currentPath,
          userEmail,
          result: data
        });
      } else {
        // For non-page-view events, we can still use the old system or create a separate table
        // For now, we'll skip these events since the new system focuses on page views
        console.log('📝 Non-page-view event tracked:', eventType, metadata);
      }
    } catch (error) {
      // Log analytics errors for debugging
      console.error('❌ Analytics tracking failed:', error);
      analyticsConnectionFailed = true; // Mark as failed to prevent repeated attempts
      return;
    }
  };

  // Specialized function for tracking page views based on current path
  const trackPageView = async (metadata?: Record<string, any>) => {
    const currentPath = window.location.pathname;

    if (currentPath === '/') {
      // Homepage view
      await trackEvent('homepage_view', metadata);
    } else if (currentPath === '/mein-tiertraining') {
      // Main training page view
      await trackEvent('mainpage_view', metadata);
    } else {
      // Generic page view for other pages
      await trackEvent('page_view', metadata);
    }
  };

  return { trackEvent, trackPageView };
};