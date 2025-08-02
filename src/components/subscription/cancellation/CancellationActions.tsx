
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface CancellationActionsProps {
  isWithinMoneyBackPeriod: boolean;
  isProcessing: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const CancellationActions = ({
  isWithinMoneyBackPeriod,
  isProcessing,
  onConfirm,
  onCancel
}: CancellationActionsProps) => {
  return (
    <div className="flex flex-col gap-2 pt-4">
      <Button 
        onClick={onConfirm} 
        variant={isWithinMoneyBackPeriod ? "default" : "destructive"}
        className="w-full"
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Wird gekündigt...
          </>
        ) : (
          isWithinMoneyBackPeriod 
            ? "✅ Kündigen & Geld zurückerhalten" 
            : "Endgültig kündigen"
        )}
      </Button>
      <Button 
        variant="outline" 
        onClick={onCancel} 
        className="w-full"
        disabled={isProcessing}
      >
        Doch nicht kündigen
      </Button>
    </div>
  );
};
