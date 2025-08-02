
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, CheckCircle } from 'lucide-react';

export const MoneyBackGuaranteeCard = () => {
  return (
    <Card className="bg-green-50 border-green-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-green-800 flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Automatische Rückerstattung
        </CardTitle>
        <CardDescription className="text-green-700">
          Du kündigst innerhalb der ersten 14 Tage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">💳 Vollständige Rückerstattung</span>
          </div>
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">⚡ Automatisch in 3-5 Werktagen</span>
          </div>
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">📧 Bestätigung per E-Mail</span>
          </div>
        </div>
        
        <div className="bg-white p-3 rounded border border-green-300">
          <p className="text-xs text-green-800">
            <strong>Kein Aufwand für dich:</strong> Nach der Kündigung wird der Betrag automatisch 
            an deine ursprüngliche Zahlungsmethode zurückerstattet. Du musst nichts weiter tun.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
