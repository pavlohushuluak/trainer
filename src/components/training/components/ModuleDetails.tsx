
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Target, Clock, Lightbulb, AlertTriangle } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { DetailSection } from "./DetailSection";

export const ModuleDetails = () => {
  const { t } = useTranslations();
  
  return (
    <Accordion type="multiple" className="w-full">
      <AccordionItem value="module-details" className="border-0">
        <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 border-t">
          <span className="font-medium">{t('training.moduleDetails.showDetails')}</span>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <div className="space-y-4">
            {/* Ziel der Übung */}
            <div className="border-l-4 border-l-blue-300 pl-4 bg-blue-50 dark:bg-blue-950/30 p-4 rounded-r-lg">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 mb-2">
                <Target className="h-4 w-4" />
                <strong>{t('training.moduleDetails.exerciseGoal.title')}</strong>
              </div>
              <p className="text-sm text-foreground">
                {t('training.moduleDetails.exerciseGoal.description')}
              </p>
            </div>

            {/* Schritt-für-Schritt */}
            <Accordion type="multiple" className="mt-3">
              <DetailSection
                value="steps"
                title={t('training.moduleDetails.stepByStep.title')}
                icon=""
                bgColor="bg-green-50 dark:bg-green-950/30"
              >
                <div className="space-y-2">
                  <div><strong>{t('training.moduleDetails.stepByStep.step1.title')}:</strong> {t('training.moduleDetails.stepByStep.step1.description')}</div>
                  <div><strong>{t('training.moduleDetails.stepByStep.step2.title')}:</strong> {t('training.moduleDetails.stepByStep.step2.description')}</div>
                  <div><strong>{t('training.moduleDetails.stepByStep.step3.title')}:</strong> {t('training.moduleDetails.stepByStep.step3.description')}</div>
                  <div className="border-t pt-2">
                    <strong>{t('training.moduleDetails.stepByStep.errorCorrection.title')}:</strong> {t('training.moduleDetails.stepByStep.errorCorrection.description')}
                  </div>
                  <div className="border-t pt-2">
                    <strong>{t('training.moduleDetails.stepByStep.speciesAdaptation.title')}:</strong> {t('training.moduleDetails.stepByStep.speciesAdaptation.description')}
                  </div>
                </div>
              </DetailSection>

              {/* Wiederholung & Dauer */}
              <DetailSection
                value="schedule"
                title={t('training.moduleDetails.repetition.title')}
                icon={<Clock className="h-4 w-4" />}
                bgColor="bg-purple-50 dark:bg-purple-950/30"
              >
                <div className="space-y-1">
                  <div><strong>{t('training.moduleDetails.repetition.dailyExercise')}:</strong> {t('training.moduleDetails.repetition.dailyExerciseValue')}</div>
                  <div><strong>{t('training.moduleDetails.repetition.frequency')}:</strong> {t('training.moduleDetails.repetition.frequencyValue')}</div>
                  <div><strong>{t('training.moduleDetails.repetition.duration')}:</strong> {t('training.moduleDetails.repetition.durationValue')}</div>
                  <div className="text-purple-800 dark:text-purple-300 font-medium">
                    {t('training.moduleDetails.repetition.warning')}
                  </div>
                </div>
              </DetailSection>

              {/* Benötigte Tools */}
              <DetailSection
                value="tools"
                title={t('training.moduleDetails.tools.title')}
                icon=""
                bgColor="bg-orange-50 dark:bg-orange-950/30"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <strong>{t('training.moduleDetails.tools.equipment')}:</strong>
                    <ul className="list-disc list-inside mt-1">
                      <li>{t('training.moduleDetails.tools.treats')}</li>
                      <li>{t('training.moduleDetails.tools.clicker')}</li>
                      <li>{t('training.moduleDetails.tools.toys')}</li>
                    </ul>
                  </div>
                  <div><strong>{t('training.moduleDetails.tools.location')}:</strong> {t('training.moduleDetails.tools.locationValue')}</div>
                  <div><strong>{t('training.moduleDetails.tools.timing')}:</strong> {t('training.moduleDetails.tools.timingValue')}</div>
                  <div><strong>{t('training.moduleDetails.tools.speciesAdaptation')}:</strong> {t('training.moduleDetails.tools.speciesAdaptationValue')}</div>
                </div>
              </DetailSection>

              {/* Lerntipps */}
              <DetailSection
                value="tips"
                title={t('training.moduleDetails.tips.title')}
                icon={<Lightbulb className="h-4 w-4" />}
                bgColor="bg-indigo-50 dark:bg-indigo-950/30"
              >
                <ul className="space-y-1">
                  <li>• {t('training.moduleDetails.tips.tip1')}</li>
                  <li>• {t('training.moduleDetails.tips.tip2')}</li>
                  <li>• {t('training.moduleDetails.tips.tip3')}</li>
                  <li>• {t('training.moduleDetails.tips.tip4')}</li>
                </ul>
              </DetailSection>

              {/* Typische Fehler */}
              <DetailSection
                value="mistakes"
                title={t('training.moduleDetails.mistakes.title')}
                icon={<AlertTriangle className="h-4 w-4" />}
                bgColor="bg-red-50 dark:bg-red-950/30"
              >
                <ul className="space-y-1">
                  <li className="text-red-800 dark:text-red-300">❌ {t('training.moduleDetails.mistakes.mistake1')}</li>
                  <li className="text-red-800 dark:text-red-300">❌ {t('training.moduleDetails.mistakes.mistake2')}</li>
                  <li className="text-red-800 dark:text-red-300">❌ {t('training.moduleDetails.mistakes.mistake3')}</li>
                  <li className="text-red-800 dark:text-red-300">❌ {t('training.moduleDetails.mistakes.mistake4')}</li>
                </ul>
              </DetailSection>
            </Accordion>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
