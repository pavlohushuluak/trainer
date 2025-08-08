
import { useEffect, useState } from "react";
import { CheckCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConfetti } from "@/hooks/useConfetti";
import { useTranslation } from "react-i18next";

export const CompletedPlanBanner = () => {
  const { t } = useTranslation();
  const [hasTriggered, setHasTriggered] = useState(false);
  const { triggerCelebration } = useConfetti();

  useEffect(() => {
    if (!hasTriggered) {
      triggerCelebration();
      setHasTriggered(true);
    }
  }, [triggerCelebration, hasTriggered]);

  return (
    <div className="mt-4 p-3 sm:p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-400/50 rounded-lg">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
          <span className="font-medium text-sm sm:text-base">{t('training.completedPlanBanner.title')} 🎉</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={triggerCelebration}
          className="border-green-300 text-green-700 hover:bg-green-100 dark:border-green-400/50 dark:text-green-300 dark:hover:bg-green-950/50 text-xs sm:text-sm"
        >
          <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
          {t('training.completedPlanBanner.celebrateAgain')}
        </Button>
      </div>
      <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 mt-2 sm:mt-1">
        {t('training.completedPlanBanner.congratulations')}
      </p>
    </div>
  );
};
