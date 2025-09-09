import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useGTM } from '@/hooks/useGTM';

export const PageViewTracker = () => {
  const location = useLocation();
  const { trackPageView } = useAnalytics();
  const { trackPageView: trackGTMPageView } = useGTM();

  useEffect(() => {
    // Track page view with both analytics systems
    trackPageView({
      timestamp: new Date().toISOString(),
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    });

    // Track page view with GTM
    trackGTMPageView(location.pathname, document.title);
  }, [location.pathname, trackPageView, trackGTMPageView]);

  // This component doesn't render anything
  return null;
};
