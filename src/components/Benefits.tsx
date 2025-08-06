
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Home, Euro, Calendar, Brain, Shield } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

export const Benefits = () => {
  const { t } = useTranslations();
  return (
    <section id="benefits" className="pt-12 sm:pt-16 lg:pt-20 bg-background pb-4">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6">
            {t('benefits.title')}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            {t('benefits.subtitle')}
          </p>
        </div>

        <div className="grid gap-6 md:gap-4 lg:gap-6 xl:gap-8 max-w-4xl mx-auto">
          {/* Benefit 1 */}
          <Card className="border-2 border-border hover:border-primary/50 transition-all duration-300">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
                <div className="flex-shrink-0 flex justify-center sm:justify-start">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">
                    {t('benefits.benefit1.title')}
                  </h3>
                  <div className="space-y-2 sm:space-y-3 text-sm sm:text-base text-muted-foreground">
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
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
                <div className="flex-shrink-0 flex justify-center sm:justify-start">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Home className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">
                    {t('benefits.benefit2.title')}
                  </h3>
                  <div className="space-y-2 sm:space-y-3 text-sm sm:text-base text-muted-foreground">
                    <p>{t('benefits.benefit2.description1')}</p>
                    <p className="font-semibold">{t('benefits.benefit2.description2')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefit 3 */}
          <Card className="border-2 border-border hover:border-primary/50 transition-all duration-300">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
                <div className="flex-shrink-0 flex justify-center sm:justify-start">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Euro className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">
                    {t('benefits.benefit3.title')}
                  </h3>
                  <div className="space-y-2 sm:space-y-3 text-sm sm:text-base text-muted-foreground">
                    <div className="bg-accent/20 p-3 sm:p-4 rounded-lg">
                      <p className="text-sm sm:text-base">• <strong>{t('benefits.benefit3.subscriptionPrice')}</strong></p>
                      <p className="text-sm sm:text-base">• <strong>{t('benefits.benefit3.trainerPrice')}</strong></p>
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
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
                <div className="flex-shrink-0 flex justify-center sm:justify-start">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">
                    {t('benefits.benefit4.title')}
                  </h3>
                  <div className="space-y-2 sm:space-y-3 text-sm sm:text-base text-muted-foreground">
                    <p>{t('benefits.benefit4.description1')}</p>
                    <p className="font-semibold">{t('benefits.benefit4.description2')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefit 5 */}
          <Card className="border-2 border-border hover:border-primary/50 transition-all duration-300">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
                <div className="flex-shrink-0 flex justify-center sm:justify-start">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">
                    {t('benefits.benefit5.title')}
                  </h3>
                  <div className="space-y-2 sm:space-y-3 text-sm sm:text-base text-muted-foreground">
                    <p>{t('benefits.benefit5.description1')}</p>
                    <p className="font-semibold">{t('benefits.benefit5.description2')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefit 6 */}
          <Card className="border-2 border-border hover:border-primary/50 transition-all duration-300">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
                <div className="flex-shrink-0 flex justify-center sm:justify-start">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">
                    {t('benefits.benefit6.title')}
                  </h3>
                  <div className="space-y-2 sm:space-y-3 text-sm sm:text-base text-muted-foreground">
                    <div className="space-y-1.5 sm:space-y-2">
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
        <div className="text-center mt-4 sm:mt-8">
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
