
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Target, Clock, Lightbulb, AlertTriangle, BookOpen, Settings } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { DetailSection } from "./DetailSection";
import { TrainingStep } from "../types";
import { parseTrainingContent } from "@/utils/trainingStepParser";

interface ModuleDetailsProps {
  step: TrainingStep;
}

export const ModuleDetails = ({ step }: ModuleDetailsProps) => {
  const { t, currentLanguage } = useTranslations();
  
  // Get structured content from database fields based on language
  const getStructuredContent = () => {
    // First try to get structured content from database fields
    const structuredContent = {
      exerciseGoal: step.exercise_goal_en || step.exercise_goal || '',
      stepByStep: step.step_by_step_guide_en || step.step_by_step_guide || '',
      repetition: step.repetition_duration_en || step.repetition_duration || '',
      tools: step.required_tools_en || step.required_tools || '',
      tips: step.learning_tips_en || step.learning_tips || '',
      mistakes: step.common_mistakes_en || step.common_mistakes || ''
    };

    // If no structured content is available, try to parse from description
    const hasStructuredContent = Object.values(structuredContent).some(content => content && content.trim() !== '');
    
    if (!hasStructuredContent) {
      const stepDescription = currentLanguage === 'en' && step.description_en 
        ? step.description_en 
        : step.description;
      
      const parsedSections = parseTrainingContent(stepDescription);
      
      return {
        exerciseGoal: parsedSections.exerciseGoal,
        stepByStep: parsedSections.stepByStepGuide,
        repetition: parsedSections.repetitionDuration,
        tools: parsedSections.requiredTools,
        tips: parsedSections.learningTips,
        mistakes: parsedSections.commonMistakes
      };
    }

    return structuredContent;
  };

  const contentSections = getStructuredContent();
  
  return (
    <Accordion type="multiple" className="w-full">
      <AccordionItem value="module-details" className="border-0">
        <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 border-t">
          <span className="font-medium">{t('training.moduleDetails.showDetails')}</span>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <div className="space-y-4">
            {/* Exercise Goal */}
            <DetailSection
              value="goal"
              title={t('training.moduleDetails.exerciseGoal.title')}
              icon={<Target className="h-4 w-4" />}
              bgColor="bg-blue-50 dark:bg-blue-950/30"
            >
              {contentSections.exerciseGoal ? (
                <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {contentSections.exerciseGoal}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  {t('training.moduleDetails.exerciseGoal.description')}
                </div>
              )}
            </DetailSection>

            {/* Step-by-Step Guide */}
            <DetailSection
              value="steps"
              title={t('training.moduleDetails.stepByStep.title')}
              icon={<BookOpen className="h-4 w-4" />}
              bgColor="bg-green-50 dark:bg-green-950/30"
            >
              {contentSections.stepByStep ? (
                <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {contentSections.stepByStep}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 gap-2">
                    <div><strong>{t('training.moduleDetails.stepByStep.step1.title')}:</strong> {t('training.moduleDetails.stepByStep.step1.description')}</div>
                    <div><strong>{t('training.moduleDetails.stepByStep.step2.title')}:</strong> {t('training.moduleDetails.stepByStep.step2.description')}</div>
                    <div><strong>{t('training.moduleDetails.stepByStep.step3.title')}:</strong> {t('training.moduleDetails.stepByStep.step3.description')}</div>
                  </div>
                </div>
              )}
            </DetailSection>

            {/* Repetition & Duration */}
            <DetailSection
              value="schedule"
              title={t('training.moduleDetails.repetition.title')}
              icon={<Clock className="h-4 w-4" />}
              bgColor="bg-purple-50 dark:bg-purple-950/30"
            >
              {contentSections.repetition ? (
                <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {contentSections.repetition}
                </div>
              ) : (
                <div className="space-y-1">
                  <div><strong>{t('training.moduleDetails.repetition.dailyExercise')}:</strong> {t('training.moduleDetails.repetition.dailyExerciseValue')}</div>
                  <div><strong>{t('training.moduleDetails.repetition.frequency')}:</strong> {t('training.moduleDetails.repetition.frequencyValue')}</div>
                  <div><strong>{t('training.moduleDetails.repetition.duration')}:</strong> {t('training.moduleDetails.repetition.durationValue')}</div>
                  <div className="text-purple-800 dark:text-purple-300 font-medium">
                    {t('training.moduleDetails.repetition.warning')}
                  </div>
                </div>
              )}
            </DetailSection>

            {/* Required Tools & Framework */}
            <DetailSection
              value="tools"
              title={t('training.moduleDetails.tools.title')}
              icon={<Settings className="h-4 w-4" />}
              bgColor="bg-orange-50 dark:bg-orange-950/30"
            >
              {contentSections.tools ? (
                <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {contentSections.tools}
                </div>
              ) : (
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
              )}
            </DetailSection>

            {/* Learning Tips & Motivation */}
            <DetailSection
              value="tips"
              title={t('training.moduleDetails.tips.title')}
              icon={<Lightbulb className="h-4 w-4" />}
              bgColor="bg-indigo-50 dark:bg-indigo-950/30"
            >
              {contentSections.tips ? (
                <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {contentSections.tips}
                </div>
              ) : (
                <ul className="space-y-1">
                  <li>• {t('training.moduleDetails.tips.tip1')}</li>
                  <li>• {t('training.moduleDetails.tips.tip2')}</li>
                  <li>• {t('training.moduleDetails.tips.tip3')}</li>
                  <li>• {t('training.moduleDetails.tips.tip4')}</li>
                </ul>
              )}
            </DetailSection>

            {/* Avoid Common Mistakes */}
            <DetailSection
              value="mistakes"
              title={t('training.moduleDetails.mistakes.title')}
              icon={<AlertTriangle className="h-4 w-4" />}
              bgColor="bg-red-50 dark:bg-red-950/30"
            >
              {contentSections.mistakes ? (
                <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {contentSections.mistakes}
                </div>
              ) : (
                <ul className="space-y-1">
                  <li className="text-red-800 dark:text-red-300">❌ {t('training.moduleDetails.mistakes.mistake1')}</li>
                  <li className="text-red-800 dark:text-red-300">❌ {t('training.moduleDetails.mistakes.mistake2')}</li>
                  <li className="text-red-800 dark:text-red-300">❌ {t('training.moduleDetails.mistakes.mistake3')}</li>
                  <li className="text-red-800 dark:text-red-300">❌ {t('training.moduleDetails.mistakes.mistake4')}</li>
                </ul>
              )}
            </DetailSection>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
