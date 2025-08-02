
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Home, Euro, Calendar, Brain, Shield } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

export const Benefits = () => {
  const { t } = useTranslations();
  return (
    <section id="benefits" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            {t('benefits.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('benefits.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-1 gap-12 max-w-4xl mx-auto">
          {/* Benefit 1 */}
          <Card className="border-2 border-border hover:border-primary/50 transition-all duration-300">
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    {t('benefits.benefit1.title')}
                  </h3>
                  <div className="space-y-3 text-muted-foreground">
                    <p>{t('benefits.benefit1.description1')}</p>
                    <p>{t('benefits.benefit1.description2')}</p>
                    <p className="font-semibold">{t('benefits.benefit1.description3')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefit 2 */}
          <Card className="border-2 border-border hover:border-primary/50 transition-all duration-300">
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Home className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    {t('benefits.benefit2.title')}
                  </h3>
                  <div className="space-y-3 text-muted-foreground">
                    <p>{t('benefits.benefit2.description1')}</p>
                    <p className="font-semibold">{t('benefits.benefit2.description2')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefit 3 */}
          <Card className="border-2 border-border hover:border-primary/50 transition-all duration-300">
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Euro className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    {t('benefits.benefit3.title')}
                  </h3>
                  <div className="space-y-3 text-muted-foreground">
                    <div className="bg-accent/20 p-4 rounded-lg">
                      <p>• <strong>{t('benefits.benefit3.subscriptionPrice')}</strong></p>
                      <p>• <strong>{t('benefits.benefit3.trainerPrice')}</strong></p>
                    </div>
                    <p>{t('benefits.benefit3.description1')}</p>
                    <p className="font-semibold">{t('benefits.benefit3.description2')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefit 4 */}
          <Card className="border-2 border-border hover:border-primary/50 transition-all duration-300">
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    {t('benefits.benefit4.title')}
                  </h3>
                  <div className="space-y-3 text-muted-foreground">
                    <p>{t('benefits.benefit4.description1')}</p>
                    <p className="font-semibold">{t('benefits.benefit4.description2')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefit 5 */}
          <Card className="border-2 border-border hover:border-primary/50 transition-all duration-300">
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Brain className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    {t('benefits.benefit5.title')}
                  </h3>
                  <div className="space-y-3 text-muted-foreground">
                    <p>{t('benefits.benefit5.description1')}</p>
                    <p className="font-semibold">{t('benefits.benefit5.description2')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefit 6 */}
          <Card className="border-2 border-border hover:border-primary/50 transition-all duration-300">
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    {t('benefits.benefit6.title')}
                  </h3>
                  <div className="space-y-3 text-muted-foreground">
                    <div className="space-y-2">
                      <p>• {t('benefits.benefit6.point1')}</p>
                      <p>• {t('benefits.benefit6.point2')}</p>
                      <p>• {t('benefits.benefit6.point3')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="inline-block bg-primary/10 px-8 py-6 rounded-2xl">
            <h3 className="text-2xl font-bold text-foreground mb-3">
              {t('benefits.cta.title')}
            </h3>
          </div>
        </div>
      </div>
    </section>
  );
};
