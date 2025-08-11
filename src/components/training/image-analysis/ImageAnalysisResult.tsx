
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Lightbulb, Target } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';

interface AnalysisResult {
  summary_text: string;
  mood_estimation: string;
  recommendation: string;
  followup_suggestion?: string;
  confidence_level?: string;
}

interface ImageAnalysisResultProps {
  result: AnalysisResult;
  onCreatePlan?: () => void;
  onSaveAnalysis?: () => void;
}

export const ImageAnalysisResult = ({ result, onCreatePlan, onSaveAnalysis }: ImageAnalysisResultProps) => {
  const { currentLanguage } = useTranslations();

  // Language-specific translations
  const translations = {
    de: {
      whatISee: 'Was ich in dem Bild sehe',
      mood: 'Stimmung:',
      confidence: 'Vertrauen:',
      myRecommendation: 'Meine Empfehlung',
      createTrainingPlan: 'Trainingsplan erstellen',
      saveAnalysis: 'Analyse speichern',
      learningMessage: 'Du lernst, dein Tier besser zu lesen – und stärkst eure Verbindung.'
    },
    en: {
      whatISee: 'What I see in the image',
      mood: 'Mood:',
      confidence: 'Confidence:',
      myRecommendation: 'My recommendation',
      createTrainingPlan: 'Create training plan',
      saveAnalysis: 'Save analysis',
      learningMessage: 'You learn to read your pet better – and strengthen your bond.'
    }
  };

  const t = translations[currentLanguage as keyof typeof translations] || translations.de;

  // Clean up the analysis text by removing unwanted quotes and formatting
  const cleanText = (text: string) => {
    if (!text) return '';
    
    return text
      .replace(/^["'`]+|["'`]+$/g, '') // Remove quotes at start/end
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  };

  const getMoodColor = (mood: string) => {
    const cleanMood = cleanText(mood).toLowerCase();
    
    // Support both German and English mood keywords
    switch (cleanMood) {
      // German moods
      case 'entspannt':
      case 'ruhig':
      // English moods
      case 'relaxed':
      case 'calm':
      case 'peaceful':
      case 'content':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300';
      
      // German moods
      case 'aufmerksam':
      case 'fokussiert':
      // English moods
      case 'attentive':
      case 'focused':
      case 'concentrated':
      case 'alert':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300';
      
      // German moods
      case 'angespannt':
      case 'gestresst':
      // English moods
      case 'tense':
      case 'stressed':
      case 'nervous':
      case 'restless':
        return 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300';
      
      // German moods
      case 'ängstlich':
      // English moods
      case 'anxious':
      case 'uncertain':
      case 'reserved':
      case 'shy':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300';
      
      // German moods
      case 'verspielt':
      case 'fröhlich':
      // English moods
      case 'playful':
      case 'happy':
      case 'lively':
      case 'active':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300';
      
      default: 
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300';
    }
  };

  const formatAnalysisText = (text: string) => {
    const cleanedText = cleanText(text);
    
    // Split into sentences for better readability
    const sentences = cleanedText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    return sentences.map((sentence, index) => (
      <p key={index} className="mb-2 last:mb-0">
        {sentence.trim()}.
      </p>
    ));
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-sm border-l-4 border-l-blue-500 dark:border-l-blue-400">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <Heart className="h-5 w-5 text-red-500" />
            {t.whatISee}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
            <div className="text-gray-800 dark:text-gray-200 leading-relaxed text-sm sm:text-base">
              {formatAnalysisText(result.summary_text)}
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.mood}</span>
            <Badge className={getMoodColor(result.mood_estimation)}>
              {cleanText(result.mood_estimation)}
            </Badge>
            {result.confidence_level && (
              <Badge variant="outline" className="text-xs">
                {t.confidence} {cleanText(result.confidence_level)}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-l-4 border-l-green-500 dark:border-l-green-400">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2 text-green-800 dark:text-green-200">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            {t.myRecommendation}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800">
            <div className="text-gray-800 dark:text-gray-200 leading-relaxed text-sm sm:text-base">
              {formatAnalysisText(result.recommendation)}
            </div>
          </div>
          
          {result.followup_suggestion && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="text-yellow-800 dark:text-yellow-300 font-medium mb-3 text-sm sm:text-base">
                {formatAnalysisText(cleanText(result.followup_suggestion))}
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                {onCreatePlan && (
                  <Button onClick={onCreatePlan} className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white text-sm sm:text-base min-h-[44px]">
                    <Target className="h-4 w-4 mr-2 flex-shrink-0" />
                    {t.createTrainingPlan}
                  </Button>
                )}
                {onSaveAnalysis && (
                  <Button variant="outline" onClick={onSaveAnalysis} className="text-sm sm:text-base min-h-[44px]">
                    💾 {t.saveAnalysis}
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-center text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-center gap-2">
          <span className="text-lg">💡</span>
          <strong className="text-gray-700 dark:text-gray-300">
            {t.learningMessage}
          </strong>
        </div>
      </div>
    </div>
  );
};
