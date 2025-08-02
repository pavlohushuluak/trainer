
import { Zap } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

interface HeroContentProps {
  isDevelopment: boolean;
}

export const HeroContent = ({ isDevelopment }: HeroContentProps) => {
  const { t } = useTranslations();
  return (
    <>
      {/* Badge */}
      <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-in">
        <Zap className="h-4 w-4" />
        <span>{isDevelopment ? t('hero.testAccess') : t('hero.riskFreeTrial')}</span>
      </div>

      {/* Main Headline with Beautiful Gradient Styling */}
      <div className="mb-8 animate-professional-fade-in-up">
        {/* Beautiful gradient background */}
        <div className="relative">
          <div className="absolute inset-0 bg-beautiful-gradient blur-3xl opacity-40 animate-professional-pulse-soft"></div>
          <div className="absolute inset-0 bg-gradient-to-tl from-cta/10 via-transparent to-primary/10 blur-2xl opacity-30 animate-professional-pulse-soft delay-1000"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-cta/5 to-transparent blur-xl opacity-20 animate-professional-pulse-soft delay-500"></div>
        </div>

        <h1
          style={{ lineHeight: '1.2' }}
          className="relative text-2xl sm:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl gap-2 font-black text-foreground tracking-tight drop-shadow-beautiful"
          dangerouslySetInnerHTML={{ __html: t('hero.mainTitle') }}
        />

        {/* Beautiful shadow effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/3 to-transparent blur-xl opacity-20"></div>

        {/* Animated accent line with beautiful gradient */}
        <div className="mt-4 h-1 bg-beautiful-gradient rounded-full opacity-70 animate-width-expand"></div>
      </div>

      {/* Subtitle with enhanced styling */}
      <p
        className="relative text-xl sm:text-2xl lg:text-3xl text-muted-foreground mb-8 max-w-5xl mx-auto leading-relaxed animate-professional-fade-in-up delay-300 font-light"
        dangerouslySetInnerHTML={{ __html: t('hero.subtitle') }}
      />
    </>
  );
};
