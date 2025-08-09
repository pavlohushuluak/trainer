
import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Home, Euro, Calendar, Brain, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export const Benefits = () => {
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

  // Enhanced Benefits data with gradients and colors
  const benefits = [
    {
      icon: Clock,
      title: t('benefits.benefit1.title'),
      descriptions: [
        t('benefits.benefit1.description1'),
        t('benefits.benefit1.description2'),
        t('benefits.benefit1.description3')
      ],
      gradient: 'from-blue-500/20 via-indigo-500/20 to-purple-500/20',
      iconGradient: 'from-blue-500 to-indigo-600',
      borderGradient: 'from-blue-500/50 to-indigo-500/50'
    },
    {
      icon: Home,
      title: t('benefits.benefit2.title'),
      descriptions: [
        t('benefits.benefit2.description1'),
        t('benefits.benefit2.description2')
      ],
      gradient: 'from-green-500/20 via-emerald-500/20 to-teal-500/20',
      iconGradient: 'from-green-500 to-emerald-600',
      borderGradient: 'from-green-500/50 to-emerald-500/50'
    },
    {
      icon: Euro,
      title: t('benefits.benefit3.title'),
      descriptions: [
        t('benefits.benefit3.description1'),
        t('benefits.benefit3.description2')
      ],
      priceInfo: {
        subscriptionPrice: t('benefits.benefit3.subscriptionPrice'),
        trainerPrice: t('benefits.benefit3.trainerPrice')
      },
      gradient: 'from-yellow-500/20 via-orange-500/20 to-red-500/20',
      iconGradient: 'from-yellow-500 to-orange-600',
      borderGradient: 'from-yellow-500/50 to-orange-500/50'
    },
    {
      icon: Calendar,
      title: t('benefits.benefit4.title'),
      descriptions: [
        t('benefits.benefit4.description1'),
        t('benefits.benefit4.description2')
      ],
      gradient: 'from-purple-500/20 via-pink-500/20 to-rose-500/20',
      iconGradient: 'from-purple-500 to-pink-600',
      borderGradient: 'from-purple-500/50 to-pink-500/50'
    },
    {
      icon: Brain,
      title: t('benefits.benefit5.title'),
      descriptions: [
        t('benefits.benefit5.description1'),
        t('benefits.benefit5.description2')
      ],
      gradient: 'from-cyan-500/20 via-blue-500/20 to-indigo-500/20',
      iconGradient: 'from-cyan-500 to-blue-600',
      borderGradient: 'from-cyan-500/50 to-blue-500/50'
    },
    {
      icon: Shield,
      title: t('benefits.benefit6.title'),
      descriptions: [
        t('benefits.benefit6.point1'),
        t('benefits.benefit6.point2'),
        t('benefits.benefit6.point3')
      ],
      gradient: 'from-rose-500/20 via-red-500/20 to-pink-500/20',
      iconGradient: 'from-rose-500 to-red-600',
      borderGradient: 'from-rose-500/50 to-red-500/50'
    }
  ];

  const totalSlides = benefits.length;

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

  // Auto-play functionality - only forward
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
    <section id="benefits" className="pt-6 md:pt-10 lg:pt-16 pb-4">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6 md:mb-8 bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent px-2">
            {t('benefits.title')}
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4 sm:px-6 leading-relaxed">
            {t('benefits.subtitle')}
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
            <div className="relative h-[400px] md:h-[450px] lg:h-[480px]">
              {benefits.map((benefit, index) => {
                const IconComponent = benefit.icon;
                const screenSize = isMobile ? 'mobile' : window.innerWidth >= 1280 ? 'desktop' : 'tablet';
                const transform = getCardTransform(index, screenSize);
                const isCenter = (index === currentIndex);

                return (
                  <div
                    key={index}
                                         className="absolute top-0 left-1/2 w-[85%] md:w-[280px] lg:w-[320px] xl:w-[350px] h-full transition-all duration-1600 ease-out cursor-pointer"
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
                                             className={cn(
                         "h-full border-2 transition-all duration-1600 ease-out shadow-2xl hover:shadow-3xl relative overflow-hidden",
                         `border-gradient-to-r ${benefit.borderGradient}`
                       )}
                                             style={{
                         transform: `rotateY(${transform.rotateY * 0.3}deg)`,
                         transformStyle: 'preserve-3d',
                         transition: 'transform 1.6s ease-out'
                       }}
                    >
                      {/* Dynamic Gradient Background */}
                      <div className={cn(
                        "absolute inset-0 bg-gradient-to-br opacity-20",
                        benefit.gradient
                      )} />

                      <CardContent className="h-full flex flex-col justify-center p-4 md:p-6 lg:p-8 relative z-10">
                        <div className="flex flex-col items-center text-center gap-4 lg:gap-6">
                          <div className="flex-shrink-0">
                            <div className={cn(
                              "w-12 h-12 lg:w-14 lg:h-14 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden",
                              `bg-gradient-to-br ${benefit.iconGradient}`
                            )}>
                              <div className="absolute inset-0 bg-white/20 backdrop-blur-sm" />
                              <IconComponent className="w-6 h-6 lg:w-7 lg:h-7 text-white relative z-10" />
                            </div>
                          </div>
                          <div className="flex-1 w-full">
                            <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-foreground mb-4 leading-tight">
                              {benefit.title}
                            </h3>
                            <div className="space-y-3 text-sm md:text-base text-muted-foreground">
                              {benefit.priceInfo && (
                                <div className="bg-accent/30 backdrop-blur-sm p-3 lg:p-4 rounded-lg border border-accent/20">
                                  <p className="text-sm lg:text-base">• <strong>{benefit.priceInfo.subscriptionPrice}</strong></p>
                                  <p className="text-sm lg:text-base">• <strong>{benefit.priceInfo.trainerPrice}</strong></p>
                                </div>
                              )}
                              {benefit.descriptions.map((description, descIndex) => (
                                <p
                                  key={descIndex}
                                  className={cn(
                                    descIndex === benefit.descriptions.length - 1 ? "font-semibold" : "",
                                    "leading-relaxed"
                                  )}
                                >
                                  {description}
                                </p>
                              ))}
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
            {benefits.map((_, index) => (
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
                aria-label={`Go to slide ${index + 1}`}
              >
                {index === currentIndex && (
                  <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Enhanced CTA Section */}
        <div className="text-center mt-8 sm:mt-12 md:mt-16 px-4">
          <div className="inline-block bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 backdrop-blur-sm px-6 xs:px-8 sm:px-10 py-4 xs:py-5 sm:py-6 md:py-8 rounded-xl xs:rounded-2xl sm:rounded-3xl border border-primary/20 shadow-lg sm:shadow-xl max-w-full">
            <h3 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2 xs:mb-3 sm:mb-4 bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent leading-tight">
              {t('benefits.cta.title')}
            </h3>
          </div>
        </div>
      </div>

      {/* CSS-in-JS for custom animations */}
      <style>
        {`
          .perspective-1500 {
            perspective: 1500px;
          }
          
          @keyframes shine {
            0% { transform: translateX(-100%) skewX(-12deg); }
            100% { transform: translateX(200%) skewX(-12deg); }
          }
          
          .animate-shine {
            animation: shine 2s ease-in-out infinite;
          }
        `}
      </style>
    </section>
  );
};
