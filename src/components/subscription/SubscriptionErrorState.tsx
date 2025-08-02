
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface SubscriptionErrorStateProps {
  error: string;
  onRetry: () => void;
}

export const SubscriptionErrorState = ({ error, onRetry }: SubscriptionErrorStateProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="text-center py-8">
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md mx-auto">
        <h3 className="text-destructive font-semibold mb-2">{t('subscription.errorState.loadingError')}</h3>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button onClick={onRetry} variant="outline" size="sm">
          {t('subscription.errorState.tryAgain')}
        </Button>
      </div>
    </div>
  );
};
