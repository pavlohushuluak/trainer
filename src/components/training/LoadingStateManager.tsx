
import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface LoadingStateManagerProps {
  children: ReactNode;
  isLoading: boolean;
  hasError?: boolean;
  errorMessage?: string;
  fallbackComponent?: ReactNode;
  loadingMessage?: string;
}

export const LoadingStateManager = ({
  children,
  isLoading,
  hasError = false,
  errorMessage,
  fallbackComponent,
  loadingMessage = "Lädt..."
}: LoadingStateManagerProps) => {
  if (isLoading) {
    return (
      <Card className="border-2 border-dashed border-blue-300 bg-blue-50">
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-blue-700">{loadingMessage}</p>
        </CardContent>
      </Card>
    );
  }

  if (hasError) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }
    
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-6 text-center">
          <p className="text-orange-700">
            {errorMessage || "Ein Fehler ist aufgetreten. Bitte versuche es später erneut."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};
