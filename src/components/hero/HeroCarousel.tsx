import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Circle, Play, Pause, Maximize2 } from 'lucide-react';
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
      alt: t('hero.carousel.trainingSuccess'),
      title: t('hero.carousel.trainingSuccess'),
      subtitle: t('hero.carousel.description')
    },
    { 
      src: isMobile ? '/carousel/mobile/2.jpg' : '/carousel/2.jpg', 
      alt: t('hero.carousel.happyDogs'),
      title: t('hero.carousel.happyDogs'),
      subtitle: t('hero.carousel.description')
    },
    { 
      src: isMobile ? '/carousel/mobile/3.jpg' : '/carousel/3.jpg', 
      alt: t('hero.carousel.parkTraining'),
      title: t('hero.carousel.parkTraining'),
      subtitle: t('hero.carousel.description')
    },
    { 
      src: isMobile ? '/carousel/mobile/4.jpg' : '/carousel/4.jpg', 
      alt: t('hero.carousel.professionalTraining'),
      title: t('hero.carousel.professionalTraining'),
      subtitle: t('hero.carousel.description')
    },
    { 
      src: isMobile ? '/carousel/mobile/5.jpg' : '/carousel/5.jpg', 
      alt: t('hero.carousel.humanAnimalBond'),
      title: t('hero.carousel.humanAnimalBond'),
      subtitle: t('hero.carousel.description')
    },
    { 
      src: isMobile ? '/carousel/mobile/6.jpg' : '/carousel/6.jpg', 
      alt: t('hero.carousel.trainingSuccesses'),
      title: t('hero.carousel.trainingSuccesses'),
      subtitle: t('hero.carousel.description')
    }
  ], [isMobile, t]);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Update carousel images when mobile state changes
  useEffect(() => {
    console.log('📱 HeroCarousel: Mobile state changed:', { 
      isMobile, 
      currentImage: carouselImages[currentIndex]?.src,
      allImages: carouselImages.map(img => img.src),
      timestamp: new Date().toISOString() 
    });
  }, [isMobile, currentIndex, carouselImages]);

  // Auto-advance carousel with pause on hover
  useEffect(() => {
    if (!isAutoPlaying || isPaused || isHovered) return;
    
    const interval = setInterval(() => {
      if (!isTransitioning) {
        nextSlide();
      }
    }, 6000); // Increased to 6 seconds for better viewing

    return () => clearInterval(interval);
  }, [currentIndex, isTransitioning, isAutoPlaying, isPaused, isHovered]);

  // Hide swipe hint after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSwipeHint(false);
    }, 4000);

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
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning, carouselImages.length]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning, carouselImages.length]);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [currentIndex, isTransitioning]);

  const toggleAutoPlay = useCallback(() => {
    setIsAutoPlaying(!isAutoPlaying);
    setIsPaused(false);
  }, [isAutoPlaying]);

  const pauseCarousel = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resumeCarousel = useCallback(() => {
    setIsPaused(false);
  }, []);

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
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

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
      } else if (e.key === ' ') {
        e.preventDefault();
        toggleAutoPlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevSlide, nextSlide, toggleAutoPlay]);

  return (
    <div 
      className="relative w-full max-w-7xl mx-auto overflow-hidden rounded-3xl shadow-2xl bg-gradient-to-br from-background/50 to-background/20 backdrop-blur-sm border border-border/20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Carousel Container */}
      <div 
        className="relative aspect-[16/9]"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Images with enhanced transitions */}
        {carouselImages.map((image, index) => (
          <div
            key={index}
            className={cn(
              "absolute inset-0 transition-all duration-700 ease-out",
              index === currentIndex
                ? "opacity-100 scale-100 translate-x-0"
                : index < currentIndex
                ? "opacity-0 scale-95 -translate-x-4"
                : "opacity-0 scale-95 translate-x-4"
            )}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
              loading={index === 0 ? "eager" : "lazy"}
              onError={(e) => {
                console.error('📱 HeroCarousel: Image failed to load:', image.src);
                if (image.src.includes('/mobile/')) {
                  const fallbackSrc = image.src.replace('/mobile/', '/');
                  console.log('📱 HeroCarousel: Falling back to:', fallbackSrc);
                  e.currentTarget.src = fallbackSrc;
                }
              }}
            />
            
            {/* Enhanced Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 via-black/10 to-transparent" />
            
            {/* Enhanced Content Overlay - Desktop Only */}
            <div className="absolute inset-0 hidden sm:flex items-end justify-center p-6 sm:p-8 md:p-12 lg:p-16">
              <div className="w-full max-w-4xl text-center text-white">
                <div className={cn(
                  "transform transition-all duration-700 delay-200",
                  index === currentIndex 
                    ? "opacity-100 translate-y-0" 
                    : "opacity-0 translate-y-8"
                )}>
                  <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 leading-tight drop-shadow-lg">
                    {image.title}
                  </h3>
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 leading-relaxed max-w-2xl mx-auto drop-shadow-md">
                    {image.subtitle}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Enhanced Navigation Arrows */}
        <Button
          variant="ghost"
          size="icon"
          onClick={prevSlide}
          disabled={isTransitioning}
          className={cn(
            "absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white backdrop-blur-md border border-white/20 h-12 w-12 transition-all duration-300 shadow-xl hover:shadow-2xl group",
            isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
          )}
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6 transition-transform group-hover:-translate-x-1" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={nextSlide}
          disabled={isTransitioning}
          className={cn(
            "absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white backdrop-blur-md border border-white/20 h-12 w-12 transition-all duration-300 shadow-xl hover:shadow-2xl group",
            isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
          )}
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
        </Button>

        {/* Enhanced Dots Indicator */}
        <div className="absolute bottom-3 md:bottom-6 left-1/2 -translate-x-1/2 flex space-x-3">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              disabled={isTransitioning}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300 shadow-lg hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50 min-h-0 min-w-0",
                index === currentIndex
                  ? "bg-white scale-125 shadow-xl"
                  : "bg-white/60 hover:bg-white/80"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Enhanced Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-linear shadow-lg"
            style={{
              width: `${((currentIndex + 1) / carouselImages.length) * 100}%`
            }}
          />
        </div>

        {/* Auto-play Controls */}
        <div className={cn(
          "absolute top-4 right-4 flex items-center gap-2 transition-all duration-300",
          isHovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
        )}>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleAutoPlay}
            className="bg-black/30 hover:bg-black/50 text-white backdrop-blur-md border border-white/20 h-10 w-10 transition-all duration-200 shadow-lg"
            aria-label={isAutoPlaying ? "Pause auto-play" : "Start auto-play"}
          >
            {isAutoPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          
          {/* Slide Counter */}
          <div className="bg-black/30 backdrop-blur-md border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm font-medium shadow-lg">
            {currentIndex + 1} / {carouselImages.length}
          </div>
        </div>

        {/* Debug indicator for development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute top-4 left-4 bg-black/50 text-white text-xs px-3 py-2 rounded-lg backdrop-blur-sm border border-white/20">
            <div className="flex items-center gap-2">
              <span>{isMobile ? '📱' : '🖥️'}</span>
              <span>{isAutoPlaying ? '▶️' : '⏸️'}</span>
            </div>
            <div className="truncate max-w-32 mt-1">
              {carouselImages[currentIndex]?.src.split('/').pop()}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Swipe Hint for Mobile */}
      {showSwipeHint && (
        <div className="absolute inset-0 pointer-events-none sm:hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-md rounded-xl px-4 py-3 text-white text-sm font-medium animate-pulse border border-white/20 shadow-xl">
            <div className="flex items-center gap-2">
              <Maximize2 className="h-4 w-4" />
              {t('hero.carousel.swipeHint')}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Content Section - Below Carousel */}
      <div className="block sm:hidden">
        <div className="bg-gradient-to-br from-background to-background/95 backdrop-blur-sm border-t border-border/20">
          <div className="p-4 sm:p-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className={cn(
                "transform transition-all duration-700 delay-300",
                "opacity-100 translate-y-0"
              )}>
                <h3 className="text-2xl sm:text-3xl font-bold mb-3 leading-tight text-foreground">
                  {carouselImages[currentIndex]?.title}
                </h3>
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                  {carouselImages[currentIndex]?.subtitle}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 