
import React, { useState, useRef, useEffect } from 'react';
import { OptimizedImageProps, createLazyImageObserver } from '@/utils/imageOptimization';

interface ExtendedOptimizedImageProps extends OptimizedImageProps {
  sizes?: string;
  onLoad?: () => void;
}

export const OptimizedImage: React.FC<ExtendedOptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  sizes,
  onLoad
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [inView, setInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const [currentSrc, setCurrentSrc] = useState<string>('');

  useEffect(() => {
    if (priority) {
      setCurrentSrc(src);
      return;
    }

    const observer = createLazyImageObserver((entry) => {
      if (entry.isIntersecting) {
        setInView(true);
        setCurrentSrc(src);
        observer.unobserve(entry.target);
      }
    });

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src, priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) {
      onLoad();
    }
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder while loading */}
      {!isLoaded && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{ width, height }}
        />
      )}
      
      <img
        ref={imgRef}
        src={inView ? currentSrc : ''}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        onLoad={handleLoad}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
    </div>
  );
};
