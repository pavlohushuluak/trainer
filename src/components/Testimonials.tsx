
import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export const Testimonials = () => {
  const { t } = useTranslations();
  const isMobile = useIsMobile();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const testimonials = t('testimonials.stories', { returnObjects: true }) as Array<{
    animal: string;
    name: string;
    owner: string;
    story: string;
    rating: number;
  }>;

  const totalSlides = testimonials.length;

  // Navigation functions
  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
    setTimeout(() => setIsTransitioning(false), 1600);
  }, [isTransitioning, totalSlides]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
    setTimeout(() => setIsTransitioning(false), 1600);
  }, [isTransitioning, totalSlides]);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 1600);
  }, [currentIndex, isTransitioning]);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || isHovered) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide, isHovered]);

  // Keyboard navigation - both arrows
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsAutoPlaying(!isAutoPlaying);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, isAutoPlaying]);

  // Enhanced 3D mouse movement for desktop
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!carouselRef.current || isMobile) return;
    
    const rect = carouselRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 50;
    const rotateY = (centerX - x) / 50;
    
    setMousePosition({ x: rotateY, y: rotateX });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
  };

  // Touch handlers for mobile swipe - both directions
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(null);
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

  // Calculate card positions for 3D carousel
  const getCardTransform = (index: number, screenSize: 'mobile' | 'tablet' | 'desktop') => {
    const centerIndex = currentIndex;
    let relativeIndex = (index - centerIndex + totalSlides) % totalSlides;
    
    if (screenSize === 'mobile') {
      // Mobile: single card centered
      if (relativeIndex === 0) {
        return {
          translateX: 0,
          translateZ: 0,
          rotateY: 0,
          scale: 1.05,
          opacity: 1,
          zIndex: 10
        };
      } else if (relativeIndex === 1) {
        return {
          translateX: 100,
          translateZ: -150,
          rotateY: -25,
          scale: 1,
          opacity: 0.4,
          zIndex: 5
        };
      } else if (relativeIndex === totalSlides - 1) {
        return {
          translateX: -100,
          translateZ: -150,
          rotateY: 25,
          scale: 1,
          opacity: 0.4,
          zIndex: 5
        };
      } else {
        return {
          translateX: relativeIndex > totalSlides / 2 ? -200 : 200,
          translateZ: -300,
          rotateY: relativeIndex > totalSlides / 2 ? 45 : -45,
          scale: 1,
          opacity: 0,
          zIndex: 1
        };
      }
    } else {
      // Desktop: 3 cards with middle at 105%
      if (relativeIndex === 0) {
        // Center card - 105% scale
        return {
          translateX: 0,
          translateZ: 0,
          rotateY: 0,
          scale: 1.05,
          opacity: 1,
          zIndex: 20
        };
      } else if (relativeIndex === 1) {
        // Right card - same styling as center but normal scale
        return {
          translateX: screenSize === 'desktop' ? 85 : 70,
          translateZ: 0,
          rotateY: -15,
          scale: 1,
          opacity: 1,
          zIndex: 15
        };
      } else if (relativeIndex === totalSlides - 1) {
        // Left card - same styling as center but normal scale
        return {
          translateX: screenSize === 'desktop' ? -85 : -70,
          translateZ: 0,
          rotateY: 15,
          scale: 1,
          opacity: 1,
          zIndex: 15
        };
      } else if (relativeIndex === 2) {
        // Far right card
        return {
          translateX: 170,
          translateZ: -100,
          rotateY: -30,
          scale: 1,
          opacity: 0.3,
          zIndex: 5
        };
      } else if (relativeIndex === totalSlides - 2) {
        // Far left card
        return {
          translateX: -170,
          translateZ: -100,
          rotateY: 30,
          scale: 1,
          opacity: 0.3,
          zIndex: 5
        };
      } else {
        // Hidden cards
        return {
          translateX: relativeIndex > totalSlides / 2 ? 300 : -300,
          translateZ: -200,
          rotateY: relativeIndex > totalSlides / 2 ? -45 : 45,
          scale: 1,
          opacity: 0,
          zIndex: 1
        };
      }
    }
  };

  return (
    <section id="testimonials" className="pt-6 md:pt-10 lg:pt-16 pb-4">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6 md:mb-8 bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent px-2">
            {t('testimonials.title')}
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4 sm:px-6 leading-relaxed">
            {t('testimonials.subtitle')}
          </p>
        </div>

        {/* 3D Carousel Container */}
        <div
          ref={carouselRef}
          className="relative max-w-7xl mx-auto perspective-[1500px]"
          onMouseEnter={() => !isMobile && setIsHovered(true)}
          onMouseLeave={() => {
            !isMobile && setIsHovered(false);
            handleMouseLeave();
          }}
          onMouseMove={handleMouseMove}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{
            transform: isMobile
              ? 'none'
              : `rotateX(${mousePosition.y}deg) rotateY(${mousePosition.x}deg)`,
            transformStyle: 'preserve-3d',
            transition: isHovered && !isMobile ? 'transform 0.2s ease-out' : 'transform 0.6s ease-out'
          }}
        >
          {/* Enhanced Previous Button */}
          <Button
            onClick={prevSlide}
            disabled={isTransitioning}
            variant="ghost"
            size="icon"
            className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-xl border border-border/50 hover:bg-background/95 transition-all duration-1000 shadow-2xl hover:shadow-3xl z-30 h-12 w-12 md:h-14 md:w-14",
              isHovered ? "opacity-100 translate-x-0 scale-100" : "opacity-70 -translate-x-2 scale-90"
            )}
            style={{
              transform: isMobile
                ? 'none'
                : `translateZ(100px) ${isHovered ? 'translateX(0)' : 'translateX(-8px)'}`,
              transition: 'all 1.0s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <ChevronLeft className="h-6 w-6 md:h-7 md:w-7 transition-transform group-hover:-translate-x-1" />
          </Button>

          {/* Enhanced Next Button */}
          <Button
            onClick={nextSlide}
            disabled={isTransitioning}
            variant="ghost"
            size="icon"
            className={cn(
              "absolute right-4 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-xl border border-border/50 hover:bg-background/95 transition-all duration-1000 shadow-2xl hover:shadow-3xl z-30 h-12 w-12 md:h-14 md:w-14",
              isHovered ? "opacity-100 translate-x-0 scale-100" : "opacity-70 translate-x-2 scale-90"
            )}
            style={{
              transform: isMobile
                ? 'none'
                : `translateZ(100px) ${isHovered ? 'translateX(0)' : 'translateX(8px)'}`,
              transition: 'all 1.0s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <ChevronRight className="h-6 w-6 md:h-7 md:w-7 transition-transform group-hover:translate-x-1" />
          </Button>

          {/* Main 3D Carousel */}
          <div className="relative overflow-hidden py-4">
            <div className="relative h-[450px] md:h-[400px] lg:h-[420px]">
              {testimonials.map((testimonial, index) => {
                const screenSize = isMobile ? 'mobile' : window.innerWidth >= 1280 ? 'desktop' : 'tablet';
                const transform = getCardTransform(index, screenSize);
                const isCenter = (index === currentIndex);

                return (
                  <div
                    key={index}
                    className="absolute top-0 left-1/2 w-[85%] md:w-[320px] lg:w-[360px] xl:w-[400px] h-full transition-all duration-1600 ease-out cursor-pointer"
                    style={{
                      transform: `
                        translateX(-50%) 
                        translateX(${transform.translateX}%) 
                        translateZ(${transform.translateZ}px) 
                        rotateY(${transform.rotateY}deg) 
                        scale(${transform.scale})
                      `,
                      opacity: transform.opacity,
                      zIndex: transform.zIndex,
                      transformStyle: 'preserve-3d',
                      transformOrigin: 'center center'
                    }}
                    onClick={() => !isCenter && goToSlide(index)}
                  >
                    <Card 
                      className="h-full border-2 transition-all duration-1600 ease-out shadow-2xl hover:shadow-3xl relative overflow-hidden border-primary/20"
                      style={{
                        transform: `rotateY(${transform.rotateY * 0.3}deg)`,
                        transformStyle: 'preserve-3d',
                        transition: 'transform 1.6s ease-out'
                      }}
                    >
                      {/* Dynamic Gradient Background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 opacity-20" />

                      <CardContent className="h-full flex flex-col justify-center p-6 md:p-8 lg:p-10 relative z-10">
                        <div className="flex flex-col text-center gap-4 lg:gap-6">
                          {/* Quote Icon */}
                          <div className="text-4xl md:text-5xl lg:text-6xl text-primary/30 leading-none">
                            "
                          </div>

                          {/* Testimonial Content */}
                          <div className="flex-1">
                            <blockquote className="text-base md:text-lg lg:text-xl text-foreground leading-relaxed mb-6 lg:mb-8 font-medium">
                              "{testimonial.story}"
                            </blockquote>

                            {/* Rating */}
                            <div className="flex justify-center gap-1 mb-6 lg:mb-8">
                              {[...Array(testimonial.rating)].map((_, i) => (
                                <Star key={i} className="w-5 h-5 lg:w-6 lg:h-6 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>

                            {/* Author Info */}
                            <div className="flex items-center justify-center gap-3 lg:gap-4">
                              <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-2xl lg:text-3xl">
                                {testimonial.animal}
                              </div>
                              <div className="text-left">
                                <h3 className="text-lg lg:text-xl font-bold text-foreground">
                                  {testimonial.name}
                                </h3>
                                <p className="text-sm lg:text-base text-muted-foreground">
                                  {t('testimonials.withOwner')} {testimonial.owner}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Professional Dots Indicator */}
        <div className="flex justify-center mt-6 sm:mt-8">
          <div className="flex space-x-3 px-4">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                disabled={isTransitioning}
                className={cn(
                  "min-h-0 min-w-0 w-3 h-3 rounded-full transition-all duration-1000 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 relative overflow-hidden",
                  index === currentIndex
                    ? "bg-gradient-to-r from-primary to-primary/80 scale-150 shadow-xl ring-2 ring-primary/40"
                    : "bg-gradient-to-r from-muted-foreground/40 to-muted-foreground/30 hover:from-muted-foreground/60 hover:to-muted-foreground/50 hover:scale-125"
                )}
                aria-label={`Go to testimonial ${index + 1}`}
              >
                {index === currentIndex && (
                  <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Enhanced Rating Section */}
        <div className="text-center mt-8 sm:mt-12 md:mt-16 px-4">
          <div className="inline-block bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 backdrop-blur-sm px-6 xs:px-8 sm:px-10 py-4 xs:py-5 sm:py-6 md:py-8 rounded-xl xs:rounded-2xl sm:rounded-3xl border border-primary/20 shadow-lg sm:shadow-xl max-w-full">
            <div className="flex items-center justify-center gap-3 lg:gap-4">
              <Star className="w-6 h-6 lg:w-8 lg:h-8 fill-yellow-400 text-yellow-400" />
              <div className="text-center">
                <h3 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-foreground bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent leading-tight">
                  {t('testimonials.rating')}
                </h3>
                <p className="text-sm xs:text-base sm:text-lg text-muted-foreground">
                  {t('testimonials.reviews')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS-in-JS for custom animations */}
      <style>
        {`
          .perspective-1500 {
            perspective: 1500px;
          }
        `}
      </style>
    </section>
  );
};
