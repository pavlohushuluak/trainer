import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight, Circle, Play, Pause, Maximize2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/hooks/useTranslations';
import { useIsMobile } from '@/hooks/use-mobile';

export const HeroCarousel = () => {
  const { t } = useTranslations();
  const isMobile = useIsMobile();
  const carouselRef = useRef<HTMLDivElement>(null);
  
  // Use useMemo to recreate carousel images when mobile state changes
  const carouselImages = useMemo(() => [
    { 
      src: isMobile ? '/carousel/mobile/1.jpg' : '/carousel/1.jpg', 
      alt: t('hero.carousel.trainingSuccess'),
      title: t('hero.carousel.trainingSuccess'),
      subtitle: t('hero.carousel.description'),
      gradient: 'from-blue-600/20 via-purple-600/20 to-pink-600/20'
    },
    { 
      src: isMobile ? '/carousel/mobile/2.jpg' : '/carousel/2.jpg', 
      alt: t('hero.carousel.happyDogs'),
      title: t('hero.carousel.happyDogs'),
      subtitle: t('hero.carousel.description'),
      gradient: 'from-green-600/20 via-emerald-600/20 to-teal-600/20'
    },
    { 
      src: isMobile ? '/carousel/mobile/3.jpg' : '/carousel/3.jpg', 
      alt: t('hero.carousel.parkTraining'),
      title: t('hero.carousel.parkTraining'),
      subtitle: t('hero.carousel.description'),
      gradient: 'from-orange-600/20 via-red-600/20 to-pink-600/20'
    },
    { 
      src: isMobile ? '/carousel/mobile/4.jpg' : '/carousel/4.jpg', 
      alt: t('hero.carousel.professionalTraining'),
      title: t('hero.carousel.professionalTraining'),
      subtitle: t('hero.carousel.description'),
      gradient: 'from-indigo-600/20 via-purple-600/20 to-blue-600/20'
    },
    { 
      src: isMobile ? '/carousel/mobile/5.jpg' : '/carousel/5.jpg', 
      alt: t('hero.carousel.humanAnimalBond'),
      title: t('hero.carousel.humanAnimalBond'),
      subtitle: t('hero.carousel.description'),
      gradient: 'from-yellow-600/20 via-orange-600/20 to-red-600/20'
    },
    { 
      src: isMobile ? '/carousel/mobile/6.jpg' : '/carousel/6.jpg', 
      alt: t('hero.carousel.trainingSuccesses'),
      title: t('hero.carousel.trainingSuccesses'),
      subtitle: t('hero.carousel.description'),
      gradient: 'from-cyan-600/20 via-blue-600/20 to-indigo-600/20'
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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
    }, 7000); // Increased to 7 seconds for better viewing

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
  }, [carouselImages, isMobile]);

  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
    setTimeout(() => setIsTransitioning(false), 700);
  }, [carouselImages.length, isTransitioning]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
    setTimeout(() => setIsTransitioning(false), 700);
  }, [carouselImages.length, isTransitioning]);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 700);
  }, [currentIndex, isTransitioning]);

  const toggleAutoPlay = useCallback(() => {
    setIsAutoPlaying(!isAutoPlaying);
  }, [isAutoPlaying]);

  // Enhanced touch handlers for mobile
  const onTouchStart = (e: React.TouchEvent) => {
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
    } else if (isRightSwipe) {
      prevSlide();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  // Enhanced keyboard navigation
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

  // Mouse movement for 3D effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!carouselRef.current) return;
    
    const rect = carouselRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    
    setMousePosition({ x: rotateY, y: rotateX });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
  };

  return (
    <div className="relative w-full">
      {/* 3D Carousel Container */}
      <div
        ref={carouselRef}
        className="relative w-full aspect-[16/9] overflow-hidden rounded-2xl shadow-2xl"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          handleMouseLeave();
        }}
        onMouseMove={handleMouseMove}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          transform: `perspective(1000px) rotateX(${mousePosition.y}deg) rotateY(${mousePosition.x}deg)`,
          transformStyle: 'preserve-3d',
          transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.3s ease-out'
        }}
      >
        {/* 3D Image Layers */}
        {carouselImages.map((image, index) => {
          const isActive = index === currentIndex;
          const isNext = index === (currentIndex + 1) % carouselImages.length;
          const isPrev = index === (currentIndex - 1 + carouselImages.length) % carouselImages.length;
          
          let transform = '';
          let zIndex = 0;
          let opacity = 0;
          let scale = 0.8;
          
          if (isActive) {
            transform = 'translateZ(0px) scale(1)';
            zIndex = 10;
            opacity = 1;
            scale = 1;
          } else if (isNext) {
            transform = 'translateZ(-200px) translateX(60%) scale(0.85) rotateY(-15deg)';
            zIndex = 5;
            opacity = 0.7;
            scale = 0.85;
          } else if (isPrev) {
            transform = 'translateZ(-200px) translateX(-60%) scale(0.85) rotateY(15deg)';
            zIndex = 5;
            opacity = 0.7;
            scale = 0.85;
          } else {
            transform = 'translateZ(-400px) scale(0.7)';
            zIndex = 1;
            opacity = 0.3;
            scale = 0.7;
          }

          return (
            <div
              key={index}
              className="absolute inset-0 transition-all duration-1000 ease-out"
              style={{
                transform,
                zIndex,
                opacity,
                transformStyle: 'preserve-3d'
              }}
            >
              {/* 3D Image Container */}
              <div 
                className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl"
                style={{
                  transform: `scale(${scale})`,
                  transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {/* Background Image */}
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
                
                {/* Dynamic Gradient Overlay */}
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent",
                  image.gradient
                )} />
                
                {/* Animated Sparkles Effect */}
                {isActive && (
                  <div className="absolute inset-0 overflow-hidden">
                    {[...Array(6)].map((_, i) => (
                      <Sparkles
                        key={i}
                        className="absolute text-white/30 animate-pulse"
                        style={{
                          left: `${20 + i * 15}%`,
                          top: `${30 + i * 10}%`,
                          animationDelay: `${i * 0.5}s`,
                          animationDuration: '3s'
                        }}
                        size={16 + i * 2}
                      />
                    ))}
                  </div>
                )}
                
                {/* Enhanced Content Overlay - Desktop Only */}
                <div className="absolute inset-0 hidden sm:flex items-end justify-center p-8 md:p-12 lg:p-16">
                  <div className="w-full max-w-4xl text-center text-white">
                    <div className={cn(
                      "transform transition-all duration-1000 delay-300",
                      isActive 
                        ? "opacity-100 translate-y-0 scale-100" 
                        : "opacity-0 translate-y-8 scale-95"
                    )}>
                      <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold pb-4 leading-tight drop-shadow-2xl bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                        {image.title}
                      </h3>
                      <p className="text-lg sm:text-xl md:text-2xl text-white/90 leading-relaxed max-w-3xl mx-auto drop-shadow-lg font-medium">
                        {image.subtitle}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Enhanced 3D Navigation Arrows - Hidden on Mobile */}
        <Button
          variant="ghost"
          size="icon"
          onClick={prevSlide}
          disabled={isTransitioning}
          className={cn(
            "absolute left-6 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white backdrop-blur-xl border border-white/30 h-14 w-14 transition-all duration-500 shadow-2xl hover:shadow-3xl group z-20 hidden sm:flex",
            isHovered ? "opacity-100 translate-x-0 scale-100" : "opacity-0 -translate-x-4 scale-90"
          )}
          style={{
            transform: `translateZ(50px) ${isHovered ? 'translateX(0)' : 'translateX(-16px)'}`,
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-7 w-7 transition-transform group-hover:-translate-x-1" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={nextSlide}
          disabled={isTransitioning}
          className={cn(
            "absolute right-6 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white backdrop-blur-xl border border-white/30 h-14 w-14 transition-all duration-500 shadow-2xl hover:shadow-3xl group z-20 hidden sm:flex",
            isHovered ? "opacity-100 translate-x-0 scale-100" : "opacity-0 translate-x-4 scale-90"
          )}
          style={{
            transform: `translateZ(50px) ${isHovered ? 'translateX(0)' : 'translateX(16px)'}`,
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          aria-label="Next slide"
        >
          <ChevronRight className="h-7 w-7 transition-transform group-hover:translate-x-1" />
        </Button>



        {/* Enhanced 3D Progress Bar */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-2 bg-black/40 backdrop-blur-md z-20"
          style={{
            transform: 'translateZ(40px)'
          }}
        >
          <div
            className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary/60 transition-all duration-700 ease-out shadow-lg"
            style={{
              width: `${((currentIndex + 1) / carouselImages.length) * 100}%`,
              transition: 'width 0.7s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          />
        </div>

        {/* Enhanced 3D Auto-play Controls - Hidden on Mobile */}
        <div 
          className={cn(
            "absolute top-6 right-6 flex items-center gap-3 transition-all duration-500 z-20 hidden sm:flex",
            isHovered ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-4 scale-90"
          )}
          style={{
            transform: `translateZ(50px) ${isHovered ? 'translateY(0)' : 'translateY(-16px)'}`,
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleAutoPlay}
            className="bg-black/40 hover:bg-black/60 text-white backdrop-blur-xl border border-white/30 h-12 w-12 transition-all duration-300 shadow-xl hover:shadow-2xl"
            aria-label={isAutoPlaying ? "Pause auto-play" : "Start auto-play"}
          >
            {isAutoPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>
          
          {/* Enhanced Slide Counter */}
          <div className="bg-black/40 backdrop-blur-xl border border-white/30 rounded-xl px-4 py-2 text-white text-sm font-semibold shadow-xl">
            <span className="text-primary font-bold">{currentIndex + 1}</span>
            <span className="text-white/70"> / {carouselImages.length}</span>
          </div>
        </div>

        {/* Debug indicator for development - Hidden on Mobile */}
        {process.env.NODE_ENV === 'development' && (
          <div 
            className="absolute top-6 left-6 bg-black/60 text-white text-xs px-4 py-2 rounded-xl backdrop-blur-xl border border-white/30 z-20 hidden sm:block"
            style={{
              transform: 'translateZ(30px)'
            }}
          >
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
        <div className="absolute inset-0 pointer-events-none sm:hidden z-30">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/70 backdrop-blur-xl rounded-2xl px-6 py-4 text-white text-sm font-medium animate-pulse border border-white/30 shadow-2xl">
            <div className="flex items-center gap-3">
              <Maximize2 className="h-5 w-5" />
              {t('hero.carousel.swipeHint')}
            </div>
          </div>
        </div>
      )}

      {/* Professional Dots Indicator - Below Carousel (All Devices) */}
      <div className="flex justify-center mt-6">
        <div className="flex space-x-2 sm:space-x-3">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              disabled={isTransitioning}
              className={cn(
                "rounded-full transition-all duration-500 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-0 min-w-0 relative overflow-hidden",
                // Mobile styling
                "w-2.5 h-2.5 sm:hidden",
                index === currentIndex
                  ? "bg-gradient-to-r from-primary via-primary/90 to-primary/80 scale-125 shadow-lg ring-1 ring-primary/30"
                  : "bg-gradient-to-r from-muted-foreground/30 via-muted-foreground/20 to-muted-foreground/30 hover:from-muted-foreground/50 hover:via-muted-foreground/40 hover:to-muted-foreground/50 hover:scale-110",
                // Desktop styling
                "sm:w-3 sm:h-3 sm:block",
                index === currentIndex
                  ? "sm:bg-gradient-to-r sm:from-white sm:via-white/95 sm:to-white/90 sm:scale-150 sm:shadow-xl sm:ring-2 sm:ring-white/40 sm:ring-offset-1 sm:ring-offset-black/20"
                  : "sm:bg-gradient-to-r sm:from-white/40 sm:via-white/30 sm:to-white/40 sm:hover:from-white/60 sm:hover:via-white/50 sm:hover:to-white/60 sm:hover:scale-125 sm:shadow-md"
              )}
              aria-label={`Go to slide ${index + 1}`}
            >
              {/* Animated glow effect for active dot */}
              {index === currentIndex && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 animate-pulse sm:from-white/20 sm:via-white/10 sm:to-white/20" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Enhanced Mobile Content Section - Below Carousel */}
      <div className="block sm:hidden mt-6">
        <div className="bg-gradient-to-br from-background via-background/95 to-background/90 backdrop-blur-xl border border-border/30 rounded-2xl shadow-2xl">
          <div className="p-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className={cn(
                "transform transition-all duration-1000 delay-300",
                "opacity-100 translate-y-0 scale-100"
              )}>
                <h3 className="text-2xl sm:text-3xl font-bold mb-4 leading-tight text-foreground bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  {carouselImages[currentIndex]?.title}
                </h3>
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto font-medium">
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