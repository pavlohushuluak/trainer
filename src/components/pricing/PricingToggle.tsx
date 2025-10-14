
import { useTranslations } from "@/hooks/useTranslations";

interface PricingToggleProps {
  isYearly: boolean;
  onToggle: (isYearly: boolean) => void;
}

export const PricingToggle = ({ isYearly, onToggle }: PricingToggleProps) => {
  const { t } = useTranslations();
  return (
    <div className="flex justify-center mb-4 md:mb-8">
      <div className="flex justify-center bg-secondary border border-border p-1 rounded-lg shadow-sm">
        <button
          onClick={() => onToggle(false)}
          className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-md transition-all duration-200 font-medium text-sm sm:text-base ${
            !isYearly 
              ? 'bg-primary text-primary-foreground shadow-md transform scale-105' 
              : 'text-foreground hover:bg-accent/50'
          }`}
        >
          {t('pricing.monthly')}
        </button>
        <button
          onClick={() => onToggle(true)}
          className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-md transition-all duration-200 font-medium text-sm sm:text-base ${
            isYearly 
              ? 'bg-primary text-primary-foreground shadow-md transform scale-105' 
              : 'text-foreground hover:bg-accent/50'
          }`}
        >
          {t('pricing.yearly')}
        </button>
      </div>
    </div>
  );
};
