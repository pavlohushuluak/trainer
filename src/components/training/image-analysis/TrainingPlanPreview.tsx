
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Target, CheckCircle, Circle, Crown, Lock } from 'lucide-react';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { useAuth } from '@/hooks/useAuth';

interface TrainingStep {
  title: string;
  description: string;
  duration_minutes: number;
  difficulty?: string;
}

interface TrainingPlan {
  title: string;
  goals: string[];
  steps: TrainingStep[];
  estimated_days?: number;
}

interface TrainingPlanPreviewProps {
  plan: TrainingPlan;
  onSavePlan?: () => void;
  onStartTraining?: () => void;
}

const cleanText = (text: string) => {
  return text
    .replace(/"""/g, '') // Remove triple quotes
    .replace(/```json|```/g, '') // Remove code block markers
    .replace(/^\s*```\s*$/gm, '') // Remove standalone code block lines
    .trim();
};

export const TrainingPlanPreview = ({ plan, onSavePlan, onStartTraining }: TrainingPlanPreviewProps) => {
  const { user } = useAuth();
  const { subscriptionMode } = useSubscriptionStatus();
  const totalMinutes = plan.steps.reduce((sum, step) => sum + step.duration_minutes, 0);

  const hasActiveSubscription = subscriptionMode === 'premium' || subscriptionMode === 'trial';
  const canSavePlan = user && hasActiveSubscription;

  const scrollToSubscriptionManagement = () => {
    const subscriptionSection = document.querySelector('.subscription-management-section');
    if (subscriptionSection) {
      subscriptionSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      setTimeout(() => {
        const paketeTab = document.querySelector('[data-value="plans"]') as HTMLElement;
        if (paketeTab) {
          paketeTab.click();
        }
      }, 500);
    }
  };

  return (
    <Card className="shadow-sm border-gray-100 dark:border-gray-800">
      <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-t-lg">
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
          📋 Dein personalisierter Trainingsplan
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {totalMinutes} Min. Gesamtzeit
          </div>
          {plan.estimated_days && (
            <div>📅 {plan.estimated_days} Tage Programm</div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Plan Title */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{cleanText(plan.title)}</h3>
        </div>

        {/* Goals */}
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            🎯 Das werden wir erreichen:
          </h4>
          <ul className="space-y-1">
            {plan.goals.map((goal, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                {cleanText(goal)}
              </li>
            ))}
          </ul>
        </div>

        {/* Training Steps */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-800 dark:text-gray-200">📝 Trainingsschritte:</h4>
          <div className="space-y-3">
            {plan.steps.slice(0, hasActiveSubscription ? plan.steps.length : 1).map((step, index) => (
              <div key={index} className="border-l-4 border-l-blue-300 dark:border-l-blue-600 pl-4 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-r-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Circle className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <h5 className="font-semibold text-gray-900 dark:text-gray-100">
                      Schritt {index + 1}: {cleanText(step.title)}
                    </h5>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {step.duration_minutes} Min
                    </Badge>
                    {step.difficulty && (
                      <Badge variant="secondary" className="text-xs">
                        {step.difficulty}
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{cleanText(step.description)}</p>
              </div>
            ))}
            
            {/* Show locked steps for free users */}
            {!hasActiveSubscription && plan.steps.length > 1 && (
              <div className="border-l-4 border-l-orange-300 dark:border-l-orange-600 pl-4 bg-orange-50 dark:bg-orange-900/20 p-4 rounded-r-lg relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    <span className="font-semibold text-gray-600 dark:text-gray-400">
                      {plan.steps.length - 1} weitere Schritte
                    </span>
                  </div>
                  <Crown className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Entsperre alle {plan.steps.length} Trainingsschritte mit Premium
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          {canSavePlan && onSavePlan && (
            <Button onClick={onSavePlan} className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white">
              ✅ Plan speichern & starten
            </Button>
          )}
          
          {!canSavePlan && onSavePlan && (
            <Button 
              onClick={scrollToSubscriptionManagement}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white"
            >
              <Crown className="h-4 w-4 mr-2" />
              Premium aktivieren zum Speichern
            </Button>
          )}
          
          {onStartTraining && (
            <Button 
              variant="outline" 
              onClick={onStartTraining} 
              className="flex-1"
              disabled={!hasActiveSubscription}
            >
              🎯 {hasActiveSubscription ? 'Sofort beginnen' : 'Nur mit Premium'}
            </Button>
          )}
        </div>

        {/* Motivation Footer */}
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
          <p className="text-sm text-purple-800 dark:text-purple-300">
            <strong>💪 Du schaffst das!</strong> Ich begleite dich bei jedem Schritt. 
            Kleine, regelmäßige Übungen bringen die besten Ergebnisse.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
