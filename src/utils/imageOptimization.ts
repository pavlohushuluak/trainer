
// Image optimization utilities

export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

// Generate optimized image URLs for different formats and sizes
export const generateOptimizedImageUrl = (
  originalUrl: string,
  width: number,
  height: number,
  format: 'webp' | 'avif' | 'jpeg' = 'webp'
): string => {
  // For now, return original URL but could be extended with image CDN
  // In production, you'd integrate with services like Cloudinary, ImageKit, etc.
  return originalUrl;
};

// Image preloader for critical images
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

// Lazy loading intersection observer
export const createLazyImageObserver = (callback: (entry: IntersectionObserverEntry) => void) => {
  const options = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
  };

  return new IntersectionObserver((entries) => {
    entries.forEach(callback);
  }, options);
};
