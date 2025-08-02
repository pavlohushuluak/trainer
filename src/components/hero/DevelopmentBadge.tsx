
import { useTranslations } from "@/hooks/useTranslations";

interface DevelopmentBadgeProps {
  isDevelopment: boolean;
}

export const DevelopmentBadge = ({ isDevelopment }: DevelopmentBadgeProps) => {
  const { t } = useTranslations();
  
  if (!isDevelopment) return null;

  return (
    <div className="absolute top-4 left-4 z-20 bg-green-100 dark:bg-green-900/20 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-xs font-medium">
      {t('hero.developmentMode')}
    </div>
  );
};
