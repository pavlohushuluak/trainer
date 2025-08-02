
import { useEffect, useRef, useCallback } from "react";

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  type: 'query' | 'render' | 'user-action';
}

export const usePerformanceMonitor = (componentName: string) => {
  const metricsRef = useRef<PerformanceMetric[]>([]);
  const activeMetricsRef = useRef<Map<string, number>>(new Map());

  const startMetric = useCallback((name: string, type: 'query' | 'render' | 'user-action' = 'user-action') => {
    const startTime = performance.now();
    const metricKey = `${componentName}-${name}`;
    
    activeMetricsRef.current.set(metricKey, startTime);
    
    return metricKey;
  }, [componentName]);

  const endMetric = useCallback((metricKey: string, name: string) => {
    const startTime = activeMetricsRef.current.get(metricKey);
    if (!startTime) return;

    const endTime = performance.now();
    const duration = endTime - startTime;

    const metric: PerformanceMetric = {
      name: `${componentName}-${name}`,
      startTime,
      endTime,
      duration,
      type: 'user-action'
    };

    metricsRef.current.push(metric);
    activeMetricsRef.current.delete(metricKey);

    return duration;
  }, [componentName]);

  const getMetrics = useCallback(() => {
    return [...metricsRef.current];
  }, []);

  const clearMetrics = useCallback(() => {
    metricsRef.current = [];
    activeMetricsRef.current.clear();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearMetrics();
    };
  }, [clearMetrics]);

  return {
    startMetric,
    endMetric,
    getMetrics,
    clearMetrics
  };
};
