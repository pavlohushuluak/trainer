
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
  const rectRef = useRef<DOMRect | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const pendingEventRef = useRef<React.MouseEvent | null>(null);
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
    setTimeout(() => setIsTransitioning(false), 300);
  }, [isTransitioning, totalSlides]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [isTransitioning, totalSlides]);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 300);
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
    pendingEventRef.current = e;
    if (rafIdRef.current != null) return;
    rafIdRef.current = requestAnimationFrame(() => {
      const evt = pendingEventRef.current;
      const rect = rectRef.current;
      rafIdRef.current = null;
      if (!evt || !rect) return;
      const x = evt.clientX - rect.left;
      const y = evt.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 50;
      const rotateY = (centerX - x) / 50;
      setMousePosition({ x: rotateY, y: rotateX });
    });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
    rectRef.current = null;
    if (rafIdRef.current != null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (carouselRef.current && isHovered && !isMobile) {
        rectRef.current = carouselRef.current.getBoundingClientRect();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isHovered, isMobile]);

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
    <section id="testimonials" className="pt-20 pb-4">
      <div className="mx-auto px-0">
        <div className="text-center mb-4 sm:mb-6 md:mb-8 lg:mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold pb-3 sm:pb-4 md:pb-6 px-3 sm:px-4 leading-tight animate-fade-in-up">
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent animate-gradient-x">
              {t('testimonials.title')}
            </span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-3xl mx-auto px-3 sm:px-4 md:px-6 leading-relaxed animate-fade-in-up delay-200">
            {t('testimonials.subtitle')}
          </p>
        </div>

        {/* 3D Carousel Container */}
        <div
          ref={carouselRef}
          className="relative mx-auto perspective-[1500px]"
          onMouseEnter={() => {
            if (isMobile) return;
            setIsHovered(true);
            if (carouselRef.current) {
              rectRef.current = carouselRef.current.getBoundingClientRect();
            }
          }}
          onMouseLeave={() => {
            if (isMobile) return;
            setIsHovered(false);
            handleMouseLeave();
          }}
          onMouseMove={handleMouseMove}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          // style={{
          //   transform: isMobile
          //     ? 'none'
          //     : `rotateX(${mousePosition.y}deg) rotateY(${mousePosition.x}deg)`,
          //   transformStyle: 'preserve-3d',
          //   transition: isHovered && !isMobile ? 'transform 0.2s ease-out' : 'transform 0.6s ease-out'
          // }}
        >
          {/* Enhanced Previous Button */}
          <Button
            onClick={prevSlide}
            disabled={isTransitioning}
            variant="ghost"
            size="icon"
            aria-label={"previousButton"}
            className={cn(
              "absolute left-2 sm:left-3 md:left-4 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-xl border border-border/50 hover:bg-background/95 transition-all duration-1000 shadow-lg hover:shadow-xl sm:shadow-xl sm:hover:shadow-2xl z-30 h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 touch-manipulation",
              isHovered ? "opacity-100 translate-x-0 scale-100" : "opacity-80 sm:opacity-70 -translate-x-1 sm:-translate-x-2 scale-95 sm:scale-90"
            )}
            style={{
              transform: isMobile
                ? 'none'
                : `translateZ(100px) ${isHovered ? 'translateX(0)' : 'translateX(-8px)'}`,
              transition: 'all 1.0s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 transition-transform group-hover:-translate-x-1 flex-shrink-0" />
          </Button>

          {/* Enhanced Next Button */}
          <Button
            onClick={nextSlide}
            disabled={isTransitioning}
            variant="ghost"
            size="icon"
            aria-label={"nextButton"}
            className={cn(
              "absolute right-2 sm:right-3 md:right-4 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-xl border border-border/50 hover:bg-background/95 transition-all duration-1000 shadow-lg hover:shadow-xl sm:shadow-xl sm:hover:shadow-2xl z-30 h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 touch-manipulation",
              isHovered ? "opacity-100 translate-x-0 scale-100" : "opacity-80 sm:opacity-70 translate-x-1 sm:translate-x-2 scale-95 sm:scale-90"
            )}
            style={{
              transform: isMobile
                ? 'none'
                : `translateZ(100px) ${isHovered ? 'translateX(0)' : 'translateX(8px)'}`,
              transition: 'all 1.0s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 transition-transform group-hover:translate-x-1 flex-shrink-0" />
          </Button>

          {/* Main 3D Carousel */}
          <div className="relative overflow-hidden pb-16 sm:pb-20 pt-6 sm:pt-8 w-full">
            <div className="relative h-[380px] xs:h-[420px] sm:h-[450px] md:h-[400px] lg:h-[420px]">
              {testimonials.map((testimonial, index) => {
                const screenSize = isMobile ? 'mobile' : window.innerWidth >= 1280 ? 'desktop' : 'tablet';
                const transform = getCardTransform(index, screenSize);
                const isCenter = (index === currentIndex);

                return (
                  <div
                    key={index}
                    className="absolute top-0 left-1/2 w-[88%] xs:w-[85%] sm:w-[80%] md:w-[320px] lg:w-[360px] xl:w-[400px] h-full transition-all duration-1600 ease-out cursor-pointer touch-manipulation"
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

                      <CardContent className="h-full flex flex-col justify-center p-4 sm:p-6 md:p-8 lg:p-10 relative z-10">
                        <div className="flex flex-col text-center gap-1.5 sm:gap-2 lg:gap-4">
                          {/* Quote Icon */}
                          <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-primary/30 leading-none">
                            "
                          </div>

                          {/* Testimonial Content */}
                          <div className="flex-1">
                            <blockquote className="text-sm sm:text-base md:text-lg lg:text-xl text-foreground leading-relaxed mb-3 sm:mb-4 lg:mb-6 font-medium">
                              "{testimonial.story}"
                            </blockquote>

                            {/* Rating */}
                            <div className="flex justify-center gap-0.5 sm:gap-1 mb-4 sm:mb-6 lg:mb-8">
                              {[...Array(testimonial.rating)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                              ))}
                            </div>

                            {/* Author Info */}
                            <div className="flex items-center justify-center gap-2 sm:gap-3 lg:gap-4">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-xl sm:text-2xl lg:text-3xl flex-shrink-0">
                                {testimonial.animal}
                              </div>
                              <div className="text-left min-w-0">
                                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-foreground truncate">
                                  {testimonial.name}
                                </h3>
                                <p className="text-xs sm:text-sm lg:text-base text-muted-foreground truncate">
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
        <div className="flex justify-center mt-[-32px] sm:mt-[-40px]">
          <div className="flex space-x-2 sm:space-x-3 px-3 sm:px-4">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                disabled={isTransitioning}
                className={cn(
                  "min-h-0 min-w-0 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-1000 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 relative overflow-hidden touch-manipulation flex items-center justify-center sm:block",
                  index === currentIndex
                    ? "bg-gradient-to-r from-primary to-primary/80 scale-150 shadow-lg sm:shadow-xl ring-2 ring-primary/40"
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
        <div className="text-center mt-6 sm:mt-8 md:mt-12 lg:mt-16 px-3 sm:px-4">
          <div className="inline-block bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 backdrop-blur-sm px-5 xs:px-6 sm:px-8 md:px-10 py-3 xs:py-4 sm:py-5 md:py-6 lg:py-8 rounded-lg xs:rounded-xl sm:rounded-2xl md:rounded-3xl border border-primary/20 shadow-md hover:shadow-lg sm:shadow-lg sm:hover:shadow-xl transition-shadow duration-300 max-w-full">
            <div className="flex items-center justify-center gap-2 sm:gap-3 lg:gap-4">
              <Star className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 fill-yellow-400 text-yellow-400 flex-shrink-0" />
              <div className="text-center min-w-0">
                <h3 className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-foreground bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent leading-tight">
                  {t('testimonials.rating')}
                </h3>
                <p className="text-xs xs:text-sm sm:text-base md:text-lg text-muted-foreground leading-tight">
                  {t('testimonials.reviews')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS-in-JS for enhanced 3D effects */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-5px); }
          }
          
          .carousel-3d {
            transform-style: preserve-3d;
          }
          
          .card-glow {
            position: relative;
          }
          
          .card-glow::before {
            content: '';
            position: absolute;
            inset: -2px;
            background: linear-gradient(45deg, transparent, rgba(99, 102, 241, 0.1), transparent);
            border-radius: inherit;
            z-index: -1;
            opacity: 0;
            transition: opacity 1.6s ease;
          }
          
          .card-glow.active::before {
            opacity: 1;
          }
        `}
      </style>
    </section>
  );
};
