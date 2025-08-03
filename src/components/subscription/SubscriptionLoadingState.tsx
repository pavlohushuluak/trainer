
import { Loader2, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface SubscriptionLoadingStateProps {
  onRetry?: () => void;
  showRetry?: boolean;
  loadingMessage?: string;
}

export const SubscriptionLoadingState = ({ 
  onRetry, 
  showRetry = false,
  loadingMessage 
}: SubscriptionLoadingStateProps) => {
  const { t } = useTranslation();
  
  const displayMessage = loadingMessage || t('subscription.loadingState.loadingData');
  
  return (
    <Card className="border-dashed">
      <CardContent className="py-8">
        <div 
          className="flex flex-col items-center justify-center space-y-4"
          role="status"
          aria-live="polite"
          aria-label={displayMessage}
        >
          <div className="flex items-center justify-center space-x-2">
            <Loader2 
              className="h-5 w-5 animate-spin text-primary" 
              aria-hidden="true"
            />
            <p className="text-sm text-muted-foreground">
              {displayMessage}
            </p>
          </div>
          
          {showRetry && onRetry && (
            <div className="flex flex-col items-center space-y-2">
              <p className="text-xs text-muted-foreground text-center">
                {t('subscription.loadingState.takingLonger')}
              </p>
              <Button
                onClick={onRetry}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                aria-label={t('subscription.loadingState.retryLoading')}
              >
                <RefreshCw className="h-4 w-4" />
                {t('subscription.loadingState.retry')}
              </Button>
            </div>
          )}
          
          <div className="text-xs text-muted-foreground text-center max-w-sm">
            {t('subscription.loadingState.pleaseWait')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
