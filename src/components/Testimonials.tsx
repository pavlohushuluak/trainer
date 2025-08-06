
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

export const Testimonials = () => {
  const { t } = useTranslations();
  
  const testimonials = t('testimonials.stories', { returnObjects: true }) as Array<{
    animal: string;
    name: string;
    owner: string;
    story: string;
    rating: number;
  }>;
  return (
    <section id="testimonials" className="py-10 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            {t('testimonials.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('testimonials.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index} 
              className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{testimonial.animal}</span>
                  <div>
                    <h3 className="font-semibold text-foreground">{testimonial.name}</h3>
                    <p className="text-sm text-muted-foreground">{t('testimonials.withOwner')} {testimonial.owner}</p>
                  </div>
                </div>
                
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-cta text-cta" />
                  ))}
                </div>
                
                <blockquote className="text-sm text-muted-foreground leading-relaxed">
                  "{testimonial.story}"
                </blockquote>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 bg-accent/20 px-6 py-3 rounded-full">
            <Star className="w-5 h-5 fill-cta text-cta" />
            <span className="font-semibold text-foreground">{t('testimonials.rating')}</span>
            <span className="text-muted-foreground">• {t('testimonials.reviews')}</span>
          </div>
        </div>
      </div>
    </section>
  );
};
