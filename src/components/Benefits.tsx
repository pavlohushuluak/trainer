
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Home, Euro, Calendar, Brain, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";

export const Benefits = () => {
  const { t } = useTranslations();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Benefits data
  const benefits = [
    {
      icon: Clock,
      title: t('benefits.benefit1.title'),
      descriptions: [
        t('benefits.benefit1.description1'),
        t('benefits.benefit1.description2'),
        t('benefits.benefit1.description3')
      ]
    },
    {
      icon: Home,
      title: t('benefits.benefit2.title'),
      descriptions: [
        t('benefits.benefit2.description1'),
        t('benefits.benefit2.description2')
      ]
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
      }
    },
    {
      icon: Calendar,
      title: t('benefits.benefit4.title'),
      descriptions: [
        t('benefits.benefit4.description1'),
        t('benefits.benefit4.description2')
      ]
    },
    {
      icon: Brain,
      title: t('benefits.benefit5.title'),
      descriptions: [
        t('benefits.benefit5.description1'),
        t('benefits.benefit5.description2')
      ]
    },
    {
      icon: Shield,
      title: t('benefits.benefit6.title'),
      descriptions: [
        t('benefits.benefit6.point1'),
        t('benefits.benefit6.point2'),
        t('benefits.benefit6.point3')
      ]
    }
  ];

  // Calculate slides for different screen sizes
  const totalSlides = benefits.length;
  const slidesForDesktop = Math.max(1, benefits.length - 1);

  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    const maxSlides = window.innerWidth >= 768 ? slidesForDesktop : totalSlides;
    setCurrentIndex((prev) => (prev + 1) % maxSlides);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [totalSlides, slidesForDesktop, isTransitioning]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    const maxSlides = window.innerWidth >= 768 ? slidesForDesktop : totalSlides;
    setCurrentIndex((prev) => (prev - 1 + maxSlides) % maxSlides);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [totalSlides, slidesForDesktop, isTransitioning]);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [currentIndex, isTransitioning]);

  // Get current slides based on screen size
  const getCurrentSlides = () => {
    if (window.innerWidth >= 768) {
      return [currentIndex, currentIndex + 1].filter(i => i < benefits.length);
    } else {
      return [currentIndex];
    }
  };

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 6000); // Slightly longer interval for benefits

    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  // Pause auto-play on hover
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  return (
    <section id="benefits" className="pt-12 sm:pt-16 lg:pt-20 pb-4">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6">
            {t('benefits.title')}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            {t('benefits.subtitle')}
          </p>
        </div>

        {/* Carousel Container */}
        <div
          className="relative max-w-6xl mx-auto"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Navigation Arrows - Outside Carousel */}
          <Button
            onClick={prevSlide}
            disabled={isTransitioning}
            variant="ghost"
            size="icon"
            className="absolute left-[38px] top-1/2 -translate-y-1/2 -translate-x-12 h-10 w-10 sm:h-12 sm:w-12 bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-background/90 transition-all duration-200 shadow-lg hover:shadow-xl z-10"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>

          <Button
            onClick={nextSlide}
            disabled={isTransitioning}
            variant="ghost"
            size="icon"
            className="absolute right-[38px] top-1/2 -translate-y-1/2 translate-x-12 h-10 w-10 sm:h-12 sm:w-12 bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-background/90 transition-all duration-200 shadow-lg hover:shadow-xl z-10"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>

          {/* Main Carousel */}
          <div className="relative mx-4 md:mx-8 lg:mx-12 overflow-hidden shadow-2xl">
            {/* Benefit Cards */}
            <div className="relative h-[400px] sm:h-[370px] md:h-[320px] lg:h-[370px]">
              {/* Mobile: Single card view */}
              <div className="md:hidden">
                {benefits.map((benefit, index) => {
                  const IconComponent = benefit.icon;
                  return (
                    <div
                      key={index}
                      className={cn(
                        "absolute inset-0 transition-all duration-500 ease-in-out",
                        index === currentIndex
                          ? "opacity-100 translate-x-0"
                          : index === (currentIndex - 1 + benefits.length) % benefits.length
                            ? "opacity-0 -translate-x-full"
                            : "opacity-0 translate-x-full"
                      )}
                    >
                      <Card className="h-full border-2 border-border hover:border-primary/50 transition-all duration-300">
                        <CardContent className="h-full flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                          <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
                            <div className="flex-shrink-0 flex justify-center sm:justify-start">
                              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 rounded-full flex items-center justify-center">
                                <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                              </div>
                            </div>
                            <div className="text-center sm:text-left flex-1">
                              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">
                                {benefit.title}
                              </h3>
                              <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-muted-foreground">
                                {benefit.priceInfo && (
                                  <div className="bg-accent/20 p-3 sm:p-4 rounded-lg">
                                    <p className="text-sm sm:text-base">• <strong>{benefit.priceInfo.subscriptionPrice}</strong></p>
                                    <p className="text-sm sm:text-base">• <strong>{benefit.priceInfo.trainerPrice}</strong></p>
                                  </div>
                                )}
                                {benefit.descriptions.map((description, descIndex) => (
                                  <p key={descIndex} className={descIndex === benefit.descriptions.length - 1 ? "font-semibold" : ""}>
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

              {/* Desktop: Two cards side by side */}
              <div className="hidden md:block">
                {benefits.map((benefit, index) => {
                  const IconComponent = benefit.icon;
                  const currentSlides = getCurrentSlides();
                  const isVisible = currentSlides.includes(index);

                  return (
                    <div
                      key={index}
                      className={cn(
                        "absolute inset-0 transition-all duration-500 ease-in-out",
                        isVisible
                          ? "opacity-100 translate-x-0"
                          : index < currentIndex
                            ? "opacity-0 -translate-x-full"
                            : "opacity-0 translate-x-full"
                      )}
                      style={{
                        transform: isVisible
                          ? `translateX(${(index - currentIndex) * 52}%)`
                          : undefined
                      }}
                    >
                      <Card className="h-full border-2 border-border hover:border-primary/50 transition-all duration-300" style={{ width: "48%" }}>
                        <CardContent className="h-full flex flex-col justify-center p-4 lg:p-6">
                          <div className="flex flex-col items-center text-center gap-3 lg:gap-4">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                <IconComponent className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg lg:text-xl font-bold text-foreground mb-3 lg:mb-4">
                                {benefit.title}
                              </h3>
                              <div className="space-y-2 lg:space-y-3 text-xs lg:text-sm text-muted-foreground">
                                {benefit.priceInfo && (
                                  <div className="bg-accent/20 p-2 lg:p-3 rounded-lg">
                                    <p className="text-xs lg:text-sm">• <strong>{benefit.priceInfo.subscriptionPrice}</strong></p>
                                    <p className="text-xs lg:text-sm">• <strong>{benefit.priceInfo.trainerPrice}</strong></p>
                                  </div>
                                )}
                                {benefit.descriptions.map((description, descIndex) => (
                                  <p key={descIndex} className={descIndex === benefit.descriptions.length - 1 ? "font-semibold" : ""}>
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
        </div>

        {/* CTA Section */}
        <div className="text-center mt-8 sm:mt-12">
          <div className="inline-block bg-primary/10 px-6 sm:px-8 py-4 sm:py-6 rounded-xl sm:rounded-2xl">
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-3">
              {t('benefits.cta.title')}
            </h3>
          </div>
        </div>
      </div>
    </section>
  );
};
