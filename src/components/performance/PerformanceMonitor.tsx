
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

      // Largest Contentful Paint (LCP)
      if ('PerformanceObserver' in window) {
        try {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1] as any;
            if (lastEntry) {
              metrics.lcp = lastEntry.startTime;
              trackEvent('performance_lcp', { value: lastEntry.startTime });
            }
          });
          lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

          // Cumulative Layout Shift (CLS)
          const clsObserver = new PerformanceObserver((list) => {
            let clsValue = 0;
            list.getEntries().forEach((entry: any) => {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            });
            if (clsValue > 0) {
              metrics.cls = clsValue;
              trackEvent('performance_cls', { value: clsValue });
            }
          });
          clsObserver.observe({ type: 'layout-shift', buffered: true });

          // First Input Delay (FID)
          const fidObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry: any) => {
              metrics.fid = entry.processingStart - entry.startTime;
              trackEvent('performance_fid', { value: metrics.fid });
            });
          });
          fidObserver.observe({ type: 'first-input', buffered: true });

        } catch (error) {
          console.warn('Performance monitoring not supported:', error);
        }
      }

      // Time to First Byte (TTFB)
      if (performance.timing) {
        const ttfb = performance.timing.responseStart - performance.timing.navigationStart;
        metrics.ttfb = ttfb;
        trackEvent('performance_ttfb', { value: ttfb });
      }

      // Page Load Time
      window.addEventListener('load', () => {
        setTimeout(() => {
          const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
          trackEvent('performance_load_time', { value: loadTime });
        }, 0);
      });
    };

    trackPerformance();
  }, [trackEvent]);

  return null; // This is a monitoring component, no UI
};
