
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

interface PricingLinkProps {
  isDevelopment: boolean;
}

export const PricingLink = ({ isDevelopment }: PricingLinkProps) => {
  const { t } = useTranslations();
  
  if (isDevelopment) return null;

  return (
    <div className="mb-8 animate-fade-in-up delay-500">
      <Button 
        variant="ghost" 
        onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
        className="text-muted-foreground hover:text-primary underline"
      >
        <Heart className="mr-2 h-4 w-4" />
        {t('hero.viewPricing')}
      </Button>
    </div>
  );
};
