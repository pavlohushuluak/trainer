
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Target, Clock, Lightbulb, AlertTriangle } from "lucide-react";
import { DetailSection } from "./DetailSection";

export const ModuleDetails = () => {
  return (
    <Accordion type="multiple" className="w-full">
      <AccordionItem value="module-details" className="border-0">
        <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 border-t">
          <span className="font-medium">📚 Modul-Details anzeigen</span>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <div className="space-y-4">
            {/* Ziel der Übung */}
            <div className="border-l-4 border-l-blue-300 pl-4 bg-blue-50 dark:bg-blue-950/30 p-4 rounded-r-lg">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 mb-2">
                <Target className="h-4 w-4" />
                <strong>📌 Ziel der Übung</strong>
              </div>
              <p className="text-sm text-foreground">
                Das Tier soll lernen, grundlegende Kommandos zu verstehen und darauf zu reagieren. 
                Aufbau einer vertrauensvollen Beziehung zwischen Tier und Halter.
              </p>
            </div>

            {/* Schritt-für-Schritt */}
            <Accordion type="multiple" className="mt-3">
              <DetailSection
                value="steps"
                title="🧭 Schritt-für-Schritt-Anleitung"
                icon=""
                bgColor="bg-green-50 dark:bg-green-950/30"
              >
                <div className="space-y-2">
                  <div><strong>Schritt 1:</strong> Bereiten Sie die Trainingsumgebung vor und sorgen Sie für Ruhe</div>
                  <div><strong>Schritt 2:</strong> Zeigen Sie das gewünschte Verhalten vor und belohnen Sie sofort</div>
                  <div><strong>Schritt 3:</strong> Wiederholen Sie die Übung mehrmals mit positiver Verstärkung</div>
                  <div className="border-t pt-2">
                    <strong>Fehlerkorrektur:</strong> Bei Verweigerung Pause machen und später nochmals versuchen
                  </div>
                  <div className="border-t pt-2">
                    <strong>💡 Tierart-Anpassung:</strong> Je nach Tierart Belohnungen anpassen (Leckerli, Streicheln, Spielzeug)
                  </div>
                </div>
              </DetailSection>

              {/* Wiederholung & Dauer */}
              <DetailSection
                value="schedule"
                title="🔁 Wiederholung & Dauer"
                icon={<Clock className="h-4 w-4" />}
                bgColor="bg-purple-50 dark:bg-purple-950/30"
              >
                <div className="space-y-1">
                  <div><strong>Tägliche Übung:</strong> 3-5 Minuten je Session</div>
                  <div><strong>Häufigkeit:</strong> 2-3× pro Tag</div>
                  <div><strong>Trainingsdauer:</strong> 1-2 Wochen für erste Fortschritte</div>
                  <div className="text-purple-800 dark:text-purple-300 font-medium">
                    ⚠️ Nur bei Ruhe & Motivation üben – kein Zwang!
                  </div>
                </div>
              </DetailSection>

              {/* Benötigte Tools */}
              <DetailSection
                value="tools"
                title="🧰 Benötigte Tools & Rahmenbedingungen"
                icon=""
                bgColor="bg-orange-50 dark:bg-orange-950/30"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <strong>Equipment:</strong>
                    <ul className="list-disc list-inside mt-1">
                      <li>Leckerli</li>
                      <li>Clicker (optional)</li>
                      <li>Spielzeug als Belohnung</li>
                    </ul>
                  </div>
                  <div><strong>Ort:</strong> Ruhiger Raum</div>
                  <div><strong>Zeitraum:</strong> Nach dem Spaziergang</div>
                  <div><strong>Tierart-Anpassung:</strong> Bei Katzen leise arbeiten</div>
                </div>
              </DetailSection>

              {/* Lerntipps */}
              <DetailSection
                value="tips"
                title="🧠 Lerntipps & Motivation"
                icon={<Lightbulb className="h-4 w-4" />}
                bgColor="bg-indigo-50 dark:bg-indigo-950/30"
              >
                <ul className="space-y-1">
                  <li>• Bleibe ruhig, freundlich und konsequent</li>
                  <li>• Belohne auch kleine Fortschritte sichtbar</li>
                  <li>• Trainingspausen einhalten, kein Dauerdruck</li>
                  <li>• Setze früh auf Rituale & Wiedererkennung</li>
                </ul>
              </DetailSection>

              {/* Typische Fehler */}
              <DetailSection
                value="mistakes"
                title="🚩 Typische Fehler vermeiden"
                icon={<AlertTriangle className="h-4 w-4" />}
                bgColor="bg-red-50 dark:bg-red-950/30"
              >
                <ul className="space-y-1">
                  <li className="text-red-800 dark:text-red-300">❌ Kein Schimpfen oder Strafen</li>
                  <li className="text-red-800 dark:text-red-300">❌ Zu schnelles Steigern der Schwierigkeit</li>
                  <li className="text-red-800 dark:text-red-300">❌ Fehlende Belohnung = Übung verliert Reiz</li>
                  <li className="text-red-800 dark:text-red-300">❌ Negative Verknüpfungen (Training = Zwang)</li>
                </ul>
              </DetailSection>
            </Accordion>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
