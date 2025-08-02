
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

interface RegularCancellationCardProps {
  subscriptionEnd?: string;
}

export const RegularCancellationCard = ({ subscriptionEnd }: RegularCancellationCardProps) => {
  return (
    <Card className="bg-orange-50 border-orange-200">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-5 w-5 text-orange-600" />
          <span className="font-medium text-orange-800">Reguläre Kündigung</span>
        </div>
        <p className="text-sm text-orange-700 mb-3">
          Die 14-Tage-Geld-zurück-Frist ist abgelaufen, aber dein Zugang bleibt bis zum 
          Ende der aktuellen Periode aktiv.
        </p>
        <div className="bg-white p-2 rounded border border-orange-300">
          <p className="text-xs text-orange-600">
            Zugang bis: {subscriptionEnd ? new Date(subscriptionEnd).toLocaleDateString('de-DE') : 'Ablaufdatum'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
