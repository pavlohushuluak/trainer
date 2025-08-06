import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/hooks/useTranslations';
import { useIsMobile } from '@/hooks/use-mobile';

export const HeroCarousel = () => {
  const { t } = useTranslations();
  const isMobile = useIsMobile();
  
  // Use useMemo to recreate carousel images when mobile state changes
  const carouselImages = useMemo(() => [
    { 
      src: isMobile ? '/carousel/mobile/1.jpg' : '/carousel/1.jpg', 
      alt: t('hero.carousel.trainingSuccess') 
    },
    { 
      src: isMobile ? '/carousel/mobile/2.jpg' : '/carousel/2.jpg', 
      alt: t('hero.carousel.happyDogs') 
    },
    { 
      src: isMobile ? '/carousel/mobile/3.jpg' : '/carousel/3.jpg', 
      alt: t('hero.carousel.parkTraining') 
    },
    { 
      src: isMobile ? '/carousel/mobile/4.jpg' : '/carousel/4.jpg', 
      alt: t('hero.carousel.professionalTraining') 
    },
    { 
      src: isMobile ? '/carousel/mobile/5.jpg' : '/carousel/5.jpg', 
      alt: t('hero.carousel.humanAnimalBond') 
    },
    { 
      src: isMobile ? '/carousel/mobile/6.jpg' : '/carousel/6.jpg', 
      alt: t('hero.carousel.trainingSuccesses') 
    }
  ], [isMobile, t]);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [showSwipeHint, setShowSwipeHint] = useState(true);

  // Update carousel images when mobile state changes
  useEffect(() => {
    console.log('📱 HeroCarousel: Mobile state changed:', { 
      isMobile, 
      currentImage: carouselImages[currentIndex]?.src,
      allImages: carouselImages.map(img => img.src),
      timestamp: new Date().toISOString() 
    });
  }, [isMobile, currentIndex, carouselImages]);

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTransitioning) {
        nextSlide();
      }
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [currentIndex, isTransitioning]);

  // Hide swipe hint after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSwipeHint(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Test mobile image loading in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && isMobile) {
      console.log('📱 HeroCarousel: Testing mobile image loading...');
      carouselImages.forEach((image, index) => {
        const img = new Image();
        img.onload = () => {
          console.log(`📱 HeroCarousel: Mobile image ${index + 1} loaded successfully:`, image.src);
        };
        img.onerror = () => {
          console.error(`📱 HeroCarousel: Mobile image ${index + 1} failed to load:`, image.src);
        };
        img.src = image.src;
      });
    }
  }, [isMobile, carouselImages]);

  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [isTransitioning]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [isTransitioning]);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [currentIndex, isTransitioning]);

  // Touch handlers for mobile swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 30; // Reduced threshold for mobile
    const isRightSwipe = distance < -30;

    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      prevSlide();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevSlide, nextSlide]);

  return (
    <div className="relative w-full max-w-6xl mx-auto overflow-hidden rounded-2xl md:rounded-2xl rounded-xl shadow-2xl">
      {/* Carousel Container */}
      <div 
        className="relative aspect-[3/2]"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Images */}
        {carouselImages.map((image, index) => (
          <div
            key={index}
            className={cn(
              "absolute inset-0 transition-all duration-300 sm:duration-500 ease-in-out",
              index === currentIndex
                ? "opacity-100 scale-100"
                : "opacity-0 scale-105"
            )}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
              loading={index === 0 ? "eager" : "lazy"}
              onError={(e) => {
                console.error('📱 HeroCarousel: Image failed to load:', image.src);
                // Fallback to desktop image if mobile image fails
                if (image.src.includes('/mobile/')) {
                  const fallbackSrc = image.src.replace('/mobile/', '/');
                  console.log('📱 HeroCarousel: Falling back to:', fallbackSrc);
                  e.currentTarget.src = fallbackSrc;
                }
              }}
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            
            {/* Content Overlay */}
            <div className="absolute bottom-0 w-full p-4 sm:p-6 md:p-8 lg:p-12 text-white flex justify-center items-center">
              <div className="w-full text-center sm:text-left">
                <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-2 leading-tight">
                  {image.alt}
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-white/90 leading-relaxed">
                  {t('hero.carousel.description')}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <Button
          variant="ghost"
          size="icon"
          onClick={prevSlide}
          disabled={isTransitioning}
          className="hidden sm:block absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border-0 h-10 w-10 sm:h-12 sm:w-12 transition-all duration-200 shadow-lg"
        >
          <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 ml-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={nextSlide}
          disabled={isTransitioning}
          className="hidden sm:block absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border-0 h-10 w-10 sm:h-12 sm:w-12 transition-all duration-200 shadow-lg"
        >
          <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 ml-4" />
        </Button>

        {/* Dots Indicator */}
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex space-x-1.5 sm:space-x-2">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              disabled={isTransitioning}
              className={cn(
                "w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-200 min-w-2 min-h-2 shadow-sm",
                index === currentIndex
                  ? "bg-white scale-110 sm:scale-125 shadow-md"
                  : "bg-white/60 hover:bg-white/80"
              )}
            />
          ))}
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 sm:h-1 bg-white/30">
          <div
            className="h-full bg-white transition-all duration-500 ease-linear shadow-sm"
            style={{
              width: `${((currentIndex + 1) / carouselImages.length) * 100}%`
            }}
          />
        </div>

        {/* Debug indicator for development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded max-w-xs">
            <div>{isMobile ? '📱 Mobile' : '🖥️ Desktop'}</div>
            <div className="truncate">
              {carouselImages[currentIndex]?.src}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Touch Indicators */}
      <div className="absolute inset-0 pointer-events-none sm:hidden">
        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-white/15 rounded-full flex items-center justify-center backdrop-blur-sm">
          <ChevronLeft className="h-3 w-3 text-white" />
        </div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-white/15 rounded-full flex items-center justify-center backdrop-blur-sm">
          <ChevronRight className="h-3 w-3 text-white" />
        </div>
      </div>

      {/* Swipe Hint for Mobile */}
      {showSwipeHint && (
        <div className="absolute inset-0 pointer-events-none sm:hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-xs font-medium animate-pulse">
            {t('hero.carousel.swipeHint')}
          </div>
        </div>
      )}
    </div>
  );
}; 