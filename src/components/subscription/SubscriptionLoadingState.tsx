
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

export const SubscriptionLoadingState = () => {
  const { t } = useTranslation();
  
  return (
    <Card className="border-dashed">
      <CardContent className="py-8">
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t('subscription.loadingState.loadingData')}</p>
        </div>
      </CardContent>
    </Card>
  );
};
