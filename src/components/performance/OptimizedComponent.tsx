import React, { memo, useCallback, useRef, useEffect, useState } from 'react';
import { usePerformanceOptimization } from '@/hooks/usePerformanceOptimization';

interface OptimizedComponentProps {
  children: React.ReactNode;
  componentName: string;
  enableLogging?: boolean;
  enableIntersectionObserver?: boolean;
  enableVirtualScrolling?: boolean;
  threshold?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const OptimizedComponent = memo(({
  children,
  componentName,
  enableLogging = false,
  enableIntersectionObserver = false,
  enableVirtualScrolling = false,
  threshold = 16,
  className,
  style
}: OptimizedComponentProps) => {
  const [shouldRender, setShouldRender] = useState(!enableIntersectionObserver);
  const { trackRender, useIntersectionObserver } = usePerformanceOptimization({
    enableLogging,
    componentName,
    threshold
  });

  const { elementRef, hasIntersected } = useIntersectionObserver({
    rootMargin: '100px 0px',
    threshold: 0.1
  });

  // Track render performance
  useEffect(() => {
    trackRender();
  });

  // Handle intersection observer
  useEffect(() => {
    if (enableIntersectionObserver && hasIntersected) {
      setShouldRender(true);
    }
  }, [enableIntersectionObserver, hasIntersected]);

  const containerRef = useRef<HTMLDivElement>(null);

  // Combine refs
  const combinedRef = useCallback((node: HTMLDivElement | null) => {
    if (enableIntersectionObserver) {
      (elementRef as any).current = node;
    }
    containerRef.current = node;
  }, [enableIntersectionObserver, elementRef]);

  if (!shouldRender) {
    return (
      <div 
        ref={combinedRef}
        className={`optimized-component-placeholder ${className || ''}`}
        style={{
          minHeight: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          ...style
        }}
      >
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={combinedRef}
      className={`optimized-component ${className || ''}`}
      style={style}
    >
      {children}
    </div>
  );
});

OptimizedComponent.displayName = 'OptimizedComponent';

// Higher-order component for easy optimization
export const withOptimization = <P extends object>(
  Component: React.ComponentType<P>,
  options: {
    componentName?: string;
    enableLogging?: boolean;
    enableIntersectionObserver?: boolean;
    threshold?: number;
  } = {}
) => {
  const OptimizedWrapper = (props: P) => (
    <OptimizedComponent
      componentName={options.componentName || Component.displayName || Component.name}
      enableLogging={options.enableLogging}
      enableIntersectionObserver={options.enableIntersectionObserver}
      threshold={options.threshold}
    >
      <Component {...props} />
    </OptimizedComponent>
  );

  OptimizedWrapper.displayName = `withOptimization(${Component.displayName || Component.name})`;
  return memo(OptimizedWrapper);
}; 