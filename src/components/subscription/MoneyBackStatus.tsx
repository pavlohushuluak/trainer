
import { useState } from "react";
import { Shield, Calendar, AlertCircle, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { differenceInDays, format } from "date-fns";
import { de } from "date-fns/locale";

interface MoneyBackStatusProps {
  subscriptionStart?: string;
  isTrialing?: boolean;
}

export const MoneyBackStatus = ({ subscriptionStart, isTrialing }: MoneyBackStatusProps) => {
  // Don't show for trial subscriptions
  if (!subscriptionStart || isTrialing) return null;

  const startDate = new Date(subscriptionStart);
  const today = new Date();
  const daysSinceStart = differenceInDays(today, startDate);
  const daysRemaining = Math.max(0, 14 - daysSinceStart);
  const isWithinMoneyBackPeriod = daysRemaining > 0;

  // Hide the money-back guarantee card if outside the 14-day period
  if (!isWithinMoneyBackPeriod) return null;

  const endDate = new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000);
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/20">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <CollapsibleTrigger className="flex items-center justify-between w-full text-left hover:bg-green-100/50 dark:hover:bg-green-900/30 -m-2 p-2 rounded transition-colors">
            <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <Shield className="h-5 w-5" />
              💰 Geld-zurück-Garantie aktiv
              <Badge variant="outline" className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700">
                {daysRemaining} {daysRemaining === 1 ? "Tag" : "Tage"} verbleibend
              </Badge>
            </CardTitle>
            <ChevronDown className={`h-4 w-4 text-green-600 dark:text-green-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="space-y-3 pt-0">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                  Du hast noch <strong>{daysRemaining} {daysRemaining === 1 ? "Tag" : "Tage"}</strong> für deine risikofreie Testphase
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  Garantie-Ende: {format(endDate, "dd. MMMM yyyy", { locale: de })}
                </p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-card p-3 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-green-700 dark:text-green-300">
                  <p className="font-medium mb-1">🛡️ Vollständiger Schutz</p>
                  <p>
                    Kündige innerhalb der ersten 14 Tage und erhalte dein Geld automatisch zurück. 
                    Keine Nachfragen, kein Aufwand – dein Vertrauen ist uns wichtig.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
