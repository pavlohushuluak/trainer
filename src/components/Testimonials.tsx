
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";

export const Testimonials = () => {
  const { t } = useTranslations();
  const testimonials = t('testimonials.stories', { returnObjects: true }) as Array<{
    animal: string;
    name: string;
    owner: string;
    story: string;
    rating: number;
  }>;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Calculate slides for different screen sizes
  const totalSlides = testimonials.length;
  const slidesForDesktop = Math.max(1, testimonials.length - 1); // -1 because we show 2 cards, so last slide shows last 2 cards

  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    // On desktop, we have fewer slides since we show 2 cards at once
    const maxSlides = window.innerWidth >= 768 ? slidesForDesktop : totalSlides;
    setCurrentIndex((prev) => (prev + 1) % maxSlides);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [totalSlides, slidesForDesktop, isTransitioning]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    // On desktop, we have fewer slides since we show 2 cards at once
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
      // Desktop: show 2 cards, move by 1
      return [currentIndex, currentIndex + 1].filter(i => i < testimonials.length);
    } else {
      // Mobile: show 1 card
      return [currentIndex];
    }
  };

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  // Pause auto-play on hover
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  return (
    <section id="testimonials" className="md:py-4 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-4 md:mb-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6">
            {t('testimonials.title')}
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t('testimonials.subtitle')}
          </p>
        </div>

                {/* Carousel Container */}
        <div 
          className="relative max-w-4xl mx-auto"
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
          <div className="relative mx-4 md:mx-8 lg:mx-12 overflow-hidden rounded-2xl bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border border-border/50 shadow-2xl">
            {/* Testimonial Cards */}
            <div className="relative h-[400px] sm:h-[370px] md:h-[320px] lg:h-[370px]">
              {/* Mobile: Single card view */}
              <div className="md:hidden">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className={cn(
                      "absolute inset-0 transition-all duration-500 ease-in-out",
                      index === currentIndex
                        ? "opacity-100 translate-x-0"
                        : index === (currentIndex - 1 + testimonials.length) % testimonials.length
                          ? "opacity-0 -translate-x-full"
                          : "opacity-0 translate-x-full"
                    )}
                  >
                    <Card className="h-full border-0 shadow-none bg-transparent">
                      <CardContent className="h-full flex flex-col justify-center p-8 sm:p-10 lg:p-12">
                        {/* Quote Icon */}
                        <div className="text-4xl sm:text-5xl lg:text-6xl text-primary/20 mb-2">
                          "
                        </div>

                        {/* Testimonial Content */}
                        <div className="flex-1">
                          <blockquote className="text-lg sm:text-xl lg:text-2xl text-foreground leading-relaxed mb-6 sm:mb-8">
                            "{testimonial.story}"
                          </blockquote>

                          {/* Rating */}
                          <div className="flex gap-1 mb-4 sm:mb-6">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <Star key={i} className="w-5 h-5 sm:w-6 sm:h-6 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>

                          {/* Author Info */}
                          <div className="flex items-center gap-3 sm:gap-4">
                            <span className="text-3xl sm:text-4xl lg:text-5xl">{testimonial.animal}</span>
                            <div>
                              <h3 className="font-semibold text-foreground text-base sm:text-lg">
                                {testimonial.name}
                              </h3>
                              <p className="text-sm sm:text-base text-muted-foreground">
                                {t('testimonials.withOwner')} {testimonial.owner}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>

              {/* Desktop: Two cards side by side */}
              <div className="hidden md:block">
                {testimonials.map((testimonial, index) => {
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
                          ? `translateX(${(index - currentIndex) * 50}%)`
                          : undefined
                      }}
                    >
                      <Card className="h-full border-0 shadow-none bg-transparent" style={{ width: "50%" }}>
                        <CardContent className="h-full flex flex-col justify-center p-6 lg:p-8">
                          {/* Quote Icon */}
                          <div className="text-3xl lg:text-4xl text-primary/20 mb-4">
                            "
                          </div>

                          {/* Testimonial Content */}
                          <div className="flex-1">
                            <blockquote className="text-base lg:text-lg text-foreground leading-relaxed mb-4 lg:mb-6">
                              "{testimonial.story}"
                            </blockquote>

                            {/* Rating */}
                            <div className="flex gap-1 mb-3 lg:mb-4">
                              {[...Array(testimonial.rating)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 lg:w-5 lg:h-5 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>

                            {/* Author Info */}
                            <div className="flex items-center gap-2 lg:gap-3">
                              <span className="text-2xl lg:text-3xl">{testimonial.animal}</span>
                              <div>
                                <h3 className="font-semibold text-foreground text-sm lg:text-base">
                                  {testimonial.name}
                                </h3>
                                <p className="text-xs lg:text-sm text-muted-foreground">
                                  {t('testimonials.withOwner')} {testimonial.owner}
                                </p>
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

        {/* Bottom Rating */}
        <div className="text-center mt-4 md:mt-6">
          <div className="inline-flex items-center gap-3 bg-accent/20 px-6 py-3 sm:px-8 sm:py-4 rounded-full border border-accent/30">
            <Star className="w-5 h-5 sm:w-6 sm:h-6 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-foreground text-sm sm:text-base">
              {t('testimonials.rating')}
            </span>
            <span className="text-muted-foreground text-sm sm:text-base">
              • {t('testimonials.reviews')}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
