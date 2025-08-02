
import React from 'react';

// Performance utilities for caching and optimization

export class PerformanceCache {
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  static set(key: string, data: any, ttlMinutes: number = 5): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000
    });
  }

  static get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  static clear(): void {
    this.cache.clear();
  }

  static has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
}

// Query result caching decorator
export function withCache<T>(
  key: string, 
  queryFn: () => Promise<T>, 
  ttlMinutes: number = 5
): () => Promise<T> {
  return async () => {
    const cached = PerformanceCache.get(key);
    if (cached) {
      return cached;
    }

    const result = await queryFn();
    PerformanceCache.set(key, result, ttlMinutes);
    return result;
  };
}

// Development-only console logging
export const devLog = (message: string, data?: any) => {
  // Logging removed
};

// Performance measurement utilities
export class PerformanceTimer {
  private startTime: number;
  private label: string;

  constructor(label: string) {
    this.label = label;
    this.startTime = performance.now();
  }

  end(): number {
    const duration = performance.now() - this.startTime;
    return duration;
  }
}

// Component render optimization
export const optimizeComponent = <T extends object>(
  component: React.ComponentType<T>,
  debugName?: string
) => {
  const OptimizedComponent = React.memo(component);
  OptimizedComponent.displayName = debugName || component.displayName || component.name;
  return OptimizedComponent;
};
