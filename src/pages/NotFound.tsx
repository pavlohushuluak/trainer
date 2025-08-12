import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Home, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const { t } = useTranslations();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-8">
            <AlertTriangle className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              {t('notFound.title')}
            </h2>
            <p className="text-muted-foreground mb-8">
              {t('notFound.description')}
            </p>
          </div>
          
          <div className="space-y-4">
            <Button 
              onClick={() => navigate('/')}
              className="w-full sm:w-auto"
              size="lg"
            >
              <Home className="h-4 w-4 mr-2" />
              {t('notFound.returnHome')}
            </Button>
            
            <div className="text-sm text-muted-foreground">
              {t('notFound.attemptedPath')}: <code className="bg-muted px-2 py-1 rounded text-xs">{location.pathname}</code>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default NotFound;
