
import { useCallback, useRef } from 'react';

interface PerformanceTrackingOptions {
  componentName: string;
  type: 'render' | 'action' | 'query';
  enableLogging?: boolean;
}

export const usePerformanceTracking = (options: PerformanceTrackingOptions) => {
  const { componentName, type, enableLogging = false } = options;
  const timersRef = useRef<Map<string, number>>(new Map());

  const trackAction = useCallback(
    <T extends (...args: any[]) => any>(actionName: string, action: T): T => {
      return ((...args: any[]) => {
        const startTime = performance.now();
        const trackingKey = `${componentName}-${actionName}`;
        
        timersRef.current.set(trackingKey, startTime);

        try {
          const result = action(...args);
          
          // Handle both sync and async results
          if (result && typeof result.then === 'function') {
            return result.then((asyncResult: any) => {
              const endTime = performance.now();
              const duration = endTime - startTime;
              
              timersRef.current.delete(trackingKey);
              return asyncResult;
            }).catch((error: any) => {
              const endTime = performance.now();
              const duration = endTime - startTime;
              
              timersRef.current.delete(trackingKey);
              throw error;
            });
          } else {
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            timersRef.current.delete(trackingKey);
            return result;
          }
        } catch (error) {
          const endTime = performance.now();
          const duration = endTime - startTime;
          
          timersRef.current.delete(trackingKey);
          throw error;
        }
      }) as T;
    },
    [componentName, enableLogging]
  );

  return { trackAction };
};
