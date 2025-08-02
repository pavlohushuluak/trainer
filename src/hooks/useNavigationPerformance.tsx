
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export const useNavigationPerformance = () => {
  const location = useLocation();
  const navigationStartRef = useRef<number | null>(null);
  
  useEffect(() => {
    // Mark navigation start
    if (performance.mark) {
      performance.mark('navigation-start');
      navigationStartRef.current = performance.now();
    }
    
    return () => {
      // Measure navigation completion
      if (navigationStartRef.current && performance.mark && performance.measure) {
        const navigationEnd = performance.now();
        const duration = navigationEnd - navigationStartRef.current;
        
        performance.mark('navigation-end');
        performance.measure('navigation-duration', 'navigation-start', 'navigation-end');
        
        // Log performance metrics
        const status = duration < 100 ? '🚀 INSTANT' : 
                      duration < 500 ? '✅ FAST' : 
                      duration < 1000 ? '⚠️ MEDIUM' : '🐌 SLOW';
        
        // Track exceptional performance
        if (duration < 100) {
          
        }
      }
    };
  }, [location.pathname]);
  
  return {
    markNavigationComplete: () => {
      if (navigationStartRef.current) {
        const duration = performance.now() - navigationStartRef.current;

      }
    }
  };
};
