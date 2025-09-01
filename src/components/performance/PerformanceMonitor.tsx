
import { useEffect } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';

interface PerformanceMetrics {
  lcp?: number;
  fid?: number;
  cls?: number;
  ttfb?: number;
}

export const PerformanceMonitor = () => {
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    // Track Core Web Vitals
    const trackPerformance = () => {
      const metrics: PerformanceMetrics = {};
    }

    trackPerformance();
  }, [trackEvent]);

  return null; // This is a monitoring component, no UI
};