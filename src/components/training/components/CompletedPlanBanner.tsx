
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
    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-green-700">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">{t('training.completedPlanBanner.title')} 🎉</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={triggerCelebration}
          className="border-green-300 text-green-700 hover:bg-green-100"
        >
          <Sparkles className="h-4 w-4 mr-1" />
          {t('training.completedPlanBanner.celebrateAgain')}
        </Button>
      </div>
      <p className="text-sm text-green-600 mt-1">
        {t('training.completedPlanBanner.congratulations')}
      </p>
    </div>
  );
};
