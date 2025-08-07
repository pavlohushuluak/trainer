
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";

export const Testimonials = () => {
  const { t } = useTranslations();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const testimonials = t('testimonials.stories', { returnObjects: true }) as Array<{
    animal: string;
    name: string;
    owner: string;
    story: string;
    rating: number;
  }>;

  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [testimonials.length, isTransitioning]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [testimonials.length, isTransitioning]);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [currentIndex, isTransitioning]);

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
    <section id="testimonials" className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
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
          {/* Main Carousel */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border border-border/50 shadow-2xl">
            {/* Testimonial Cards */}
            <div className="relative h-[400px] sm:h-[450px] lg:h-[500px]">
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
                      <div className="text-4xl sm:text-5xl lg:text-6xl text-primary/20 mb-6">
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

            {/* Navigation Arrows */}
            <Button
              onClick={prevSlide}
              disabled={isTransitioning}
              variant="ghost"
              size="icon"
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-12 sm:w-12 bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-background/90 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
            
            <Button
              onClick={nextSlide}
              disabled={isTransitioning}
              variant="ghost"
              size="icon"
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-12 sm:w-12 bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-background/90 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>

            {/* Auto-play Toggle */}
            <Button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 h-8 w-8 sm:h-10 sm:w-10 bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-background/90 transition-all duration-200"
            >
              {isAutoPlaying ? (
                <Pause className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Play className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </Button>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center items-center gap-2 mt-6 sm:mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                disabled={isTransitioning}
                className={cn(
                  "w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-200",
                  index === currentIndex
                    ? "bg-primary scale-125"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
              />
            ))}
          </div>

          {/* Slide Counter */}
          <div className="text-center mt-4 sm:mt-6">
            <span className="text-sm sm:text-base text-muted-foreground">
              {currentIndex + 1} / {testimonials.length}
            </span>
          </div>
        </div>

        {/* Bottom Rating */}
        <div className="text-center mt-12 sm:mt-16">
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
