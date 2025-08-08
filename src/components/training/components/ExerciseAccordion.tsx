
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Target, Clock, Lightbulb, AlertTriangle } from 'lucide-react';
import { Exercise } from '../templateTypes';
import { useTranslations } from '@/hooks/useTranslations';

interface ExerciseAccordionProps {
  exercise: Exercise;
  exerciseIndex: number;
}

// Translation helper function for difficulty
const translateDifficulty = (difficulty: string, t: any) => {
  switch (difficulty) {
    case 'Anfänger': return t('training.template.difficulty.beginner');
    case 'Fortgeschritten': return t('training.template.difficulty.advanced');
    case 'Experte': return t('training.template.difficulty.expert');
    case 'Beginner': return t('training.template.difficulty.beginner');
    case 'Advanced': return t('training.template.difficulty.advanced');
    case 'Expert': return t('training.template.difficulty.expert');
    default: return difficulty;
  }
};

export const ExerciseAccordion = ({ exercise, exerciseIndex }: ExerciseAccordionProps) => {
  const { t } = useTranslations();
  
  return (
    <div className="border-l-4 border-l-primary/30 dark:border-l-primary/50 pl-4 bg-muted/50 dark:bg-muted/30 p-4 rounded-r-lg border border-l-0 border-border">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-base flex items-center gap-2 text-foreground">
            📘 {t('training.exercise.module')} {exerciseIndex + 1}: {exercise.title}
          </h4>
          {exercise.shortDescription && (
            <p className="text-sm text-muted-foreground mt-1">{exercise.shortDescription}</p>
          )}
        </div>
        <div className="ml-4 bg-muted text-foreground px-2 py-1 rounded text-sm border border-border">
          {translateDifficulty(exercise.difficulty, t)}
        </div>
      </div>

      <Accordion type="multiple" className="mt-3">
        {/* Exercise Goal */}
        {exercise.goal && (
          <AccordionItem value={`goal-${exercise.id}`} className="border-b-0">
            <AccordionTrigger className="py-2 text-sm">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <Target className="h-4 w-4" />
                📌 {t('training.exercise.goal')}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-2">
              <p className="text-sm text-foreground bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-200 dark:border-blue-400/50">{exercise.goal}</p>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Step-by-Step Guide */}
        {exercise.stepByStepGuide && (
          <AccordionItem value={`steps-${exercise.id}`} className="border-b-0">
            <AccordionTrigger className="py-2 text-sm">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                🧭 {t('training.exercise.stepByStepGuide')}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-2">
              <div className="space-y-2 bg-green-50 dark:bg-green-950/30 p-3 rounded-lg text-sm border border-green-200 dark:border-green-400/50">
                <div className="text-foreground"><strong className="text-foreground">{t('training.exercise.step1')}:</strong> {exercise.stepByStepGuide.step1}</div>
                <div className="text-foreground"><strong className="text-foreground">{t('training.exercise.step2')}:</strong> {exercise.stepByStepGuide.step2}</div>
                <div className="text-foreground"><strong className="text-foreground">{t('training.exercise.step3')}:</strong> {exercise.stepByStepGuide.step3}</div>
                <div className="border-t border-green-300 dark:border-green-400/50 pt-2 text-foreground">
                  <strong className="text-foreground">{t('training.exercise.errorCorrection')}:</strong> {exercise.stepByStepGuide.errorCorrection}
                </div>
                {exercise.stepByStepGuide.speciesAdaptation && (
                  <div className="border-t border-green-300 dark:border-green-400/50 pt-2 text-foreground">
                    <strong className="text-foreground">💡 {t('training.exercise.speciesAdaptation')}:</strong> {exercise.stepByStepGuide.speciesAdaptation}
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Repetition & Duration */}
        {exercise.repetitionSchedule && (
          <AccordionItem value={`schedule-${exercise.id}`} className="border-b-0">
            <AccordionTrigger className="py-2 text-sm">
              <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                <Clock className="h-4 w-4" />
                🔁 {t('training.exercise.repetitionAndDuration')}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-2">
              <div className="space-y-1 bg-purple-50 dark:bg-purple-950/30 p-3 rounded-lg text-sm border border-purple-200 dark:border-purple-400/50">
                <div className="text-foreground"><strong className="text-foreground">{t('training.exercise.dailyPractice')}:</strong> {exercise.repetitionSchedule.dailyPractice}</div>
                <div className="text-foreground"><strong className="text-foreground">{t('training.exercise.frequency')}:</strong> {exercise.repetitionSchedule.frequency}</div>
                <div className="text-foreground"><strong className="text-foreground">{t('training.exercise.trainingDuration')}:</strong> {exercise.repetitionSchedule.trainingDuration}</div>
                {exercise.repetitionSchedule.note && (
                  <div className="text-purple-800 dark:text-purple-300 font-medium">
                    ⚠️ {exercise.repetitionSchedule.note}
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Required Tools */}
        {exercise.requiredTools && (
          <AccordionItem value={`tools-${exercise.id}`} className="border-b-0">
            <AccordionTrigger className="py-2 text-sm">
              <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                🧰 {t('training.exercise.requiredToolsAndConditions')}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-2">
              <div className="bg-orange-50 dark:bg-orange-950/30 p-3 rounded-lg text-sm border border-orange-200 dark:border-orange-400/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="text-foreground">
                    <strong className="text-foreground">{t('training.exercise.equipment')}:</strong>
                    <ul className="list-disc list-inside mt-1 text-muted-foreground">
                      {exercise.requiredTools.equipment.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-foreground"><strong className="text-foreground">{t('training.exercise.location')}:</strong> {exercise.requiredTools.location}</div>
                  <div className="text-foreground"><strong className="text-foreground">{t('training.exercise.timeframe')}:</strong> {exercise.requiredTools.timeframe}</div>
                  {exercise.requiredTools.speciesAdaptation && (
                    <div className="text-foreground"><strong className="text-foreground">{t('training.exercise.speciesAdaptation')}:</strong> {exercise.requiredTools.speciesAdaptation}</div>
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Learning Tips */}
        {exercise.learningTips && exercise.learningTips.length > 0 && (
          <AccordionItem value={`tips-${exercise.id}`} className="border-b-0">
            <AccordionTrigger className="py-2 text-sm">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                <Lightbulb className="h-4 w-4" />
                🧠 {t('training.exercise.learningTipsAndMotivation')}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-2">
              <div className="bg-indigo-50 dark:bg-indigo-950/30 p-3 rounded-lg border border-indigo-200 dark:border-indigo-400/50">
                <ul className="space-y-1 text-sm">
                  {exercise.learningTips.map((tip, i) => (
                    <li key={i} className="text-foreground">• {tip}</li>
                  ))}
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Common Mistakes */}
        {exercise.commonMistakes && exercise.commonMistakes.length > 0 && (
          <AccordionItem value={`mistakes-${exercise.id}`} className="border-b-0">
            <AccordionTrigger className="py-2 text-sm">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                <AlertTriangle className="h-4 w-4" />
                🚩 {t('training.exercise.avoidCommonMistakes')}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-2">
              <div className="bg-red-50 dark:bg-red-950/30 p-3 rounded-lg border border-red-200 dark:border-red-400/50">
                <ul className="space-y-1 text-sm">
                  {exercise.commonMistakes.map((mistake, i) => (
                    <li key={i} className="text-red-800 dark:text-red-300">❌ {mistake}</li>
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
