
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Target, Clock, Lightbulb, AlertTriangle } from 'lucide-react';
import { Exercise } from '../templateTypes';

interface ExerciseAccordionProps {
  exercise: Exercise;
  exerciseIndex: number;
}

export const ExerciseAccordion = ({ exercise, exerciseIndex }: ExerciseAccordionProps) => {
  return (
    <div className="border-l-4 border-l-blue-300 pl-4 bg-gray-50 p-4 rounded-r-lg">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-base flex items-center gap-2">
            📘 Modul {exerciseIndex + 1}: {exercise.title}
          </h4>
          {exercise.shortDescription && (
            <p className="text-sm text-gray-600 mt-1">{exercise.shortDescription}</p>
          )}
        </div>
        <div className="ml-4 bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
          {exercise.difficulty}
        </div>
      </div>

      <Accordion type="multiple" className="mt-3">
        {/* Ziel der Übung */}
        {exercise.goal && (
          <AccordionItem value={`goal-${exercise.id}`} className="border-b-0">
            <AccordionTrigger className="py-2 text-sm">
              <div className="flex items-center gap-2 text-blue-700">
                <Target className="h-4 w-4" />
                📌 Ziel der Übung
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-2">
              <p className="text-sm bg-blue-50 p-3 rounded-lg">{exercise.goal}</p>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Schritt-für-Schritt */}
        {exercise.stepByStepGuide && (
          <AccordionItem value={`steps-${exercise.id}`} className="border-b-0">
            <AccordionTrigger className="py-2 text-sm">
              <div className="flex items-center gap-2 text-green-700">
                🧭 Schritt-für-Schritt-Anleitung
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-2">
              <div className="space-y-2 bg-green-50 p-3 rounded-lg text-sm">
                <div><strong>Schritt 1:</strong> {exercise.stepByStepGuide.step1}</div>
                <div><strong>Schritt 2:</strong> {exercise.stepByStepGuide.step2}</div>
                <div><strong>Schritt 3:</strong> {exercise.stepByStepGuide.step3}</div>
                <div className="border-t pt-2">
                  <strong>Fehlerkorrektur:</strong> {exercise.stepByStepGuide.errorCorrection}
                </div>
                {exercise.stepByStepGuide.speciesAdaptation && (
                  <div className="border-t pt-2">
                    <strong>💡 Tierart-Anpassung:</strong> {exercise.stepByStepGuide.speciesAdaptation}
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Wiederholung & Dauer */}
        {exercise.repetitionSchedule && (
          <AccordionItem value={`schedule-${exercise.id}`} className="border-b-0">
            <AccordionTrigger className="py-2 text-sm">
              <div className="flex items-center gap-2 text-purple-700">
                <Clock className="h-4 w-4" />
                🔁 Wiederholung & Dauer
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-2">
              <div className="space-y-1 bg-purple-50 p-3 rounded-lg text-sm">
                <div><strong>Tägliche Übung:</strong> {exercise.repetitionSchedule.dailyPractice}</div>
                <div><strong>Häufigkeit:</strong> {exercise.repetitionSchedule.frequency}</div>
                <div><strong>Trainingsdauer:</strong> {exercise.repetitionSchedule.trainingDuration}</div>
                {exercise.repetitionSchedule.note && (
                  <div className="text-purple-800 font-medium">
                    ⚠️ {exercise.repetitionSchedule.note}
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Benötigte Tools */}
        {exercise.requiredTools && (
          <AccordionItem value={`tools-${exercise.id}`} className="border-b-0">
            <AccordionTrigger className="py-2 text-sm">
              <div className="flex items-center gap-2 text-orange-700">
                🧰 Benötigte Tools & Rahmenbedingungen
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-2">
              <div className="bg-orange-50 p-3 rounded-lg text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <strong>Equipment:</strong>
                    <ul className="list-disc list-inside mt-1">
                      {exercise.requiredTools.equipment.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div><strong>Ort:</strong> {exercise.requiredTools.location}</div>
                  <div><strong>Zeitraum:</strong> {exercise.requiredTools.timeframe}</div>
                  {exercise.requiredTools.speciesAdaptation && (
                    <div><strong>Tierart-Anpassung:</strong> {exercise.requiredTools.speciesAdaptation}</div>
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Lerntipps */}
        {exercise.learningTips && exercise.learningTips.length > 0 && (
          <AccordionItem value={`tips-${exercise.id}`} className="border-b-0">
            <AccordionTrigger className="py-2 text-sm">
              <div className="flex items-center gap-2 text-indigo-700">
                <Lightbulb className="h-4 w-4" />
                🧠 Lerntipps & Motivation
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-2">
              <div className="bg-indigo-50 p-3 rounded-lg">
                <ul className="space-y-1 text-sm">
                  {exercise.learningTips.map((tip, i) => (
                    <li key={i}>• {tip}</li>
                  ))}
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Typische Fehler */}
        {exercise.commonMistakes && exercise.commonMistakes.length > 0 && (
          <AccordionItem value={`mistakes-${exercise.id}`} className="border-b-0">
            <AccordionTrigger className="py-2 text-sm">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-4 w-4" />
                🚩 Typische Fehler vermeiden
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-2">
              <div className="bg-red-50 p-3 rounded-lg">
                <ul className="space-y-1 text-sm">
                  {exercise.commonMistakes.map((mistake, i) => (
                    <li key={i} className="text-red-800">❌ {mistake}</li>
                  ))}
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );
};
