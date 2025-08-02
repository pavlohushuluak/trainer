import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface BreadcrumbNavigationProps {
  showBackToPricing?: boolean;
  className?: string;
}

export const BreadcrumbNavigation = ({ 
  showBackToPricing = true, 
  className = "" 
}: BreadcrumbNavigationProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/')}
        className="h-8 px-2"
      >
        <Home className="h-4 w-4 mr-1" />
        {t('subscription.breadcrumb.home')}
      </Button>
      
      {showBackToPricing && (
        <>
          <span className="text-muted-foreground">/</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/#pricing')}
            className="h-8 px-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t('subscription.breadcrumb.backToPricing')}
          </Button>
        </>
      )}
      
      <span className="text-muted-foreground">/</span>
      <span className="font-medium">{t('subscription.breadcrumb.myPetTraining')}</span>
    </div>
  );
};